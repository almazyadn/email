from exchangelib import Credentials, Account, Configuration, DELEGATE, Message
from exchangelib.protocol import BaseProtocol, NoVerifyHTTPAdapter
from classify_email import classify_email
from schedule_handler import get_available_employee, load_schedule
import re
from zoneinfo import ZoneInfo


def run_email_system(username: str, password: str, email: str, ews_url: str):
    """
    Main function to process unread emails.
    Login credentials & server info are passed as arguments (from frontend).
    """

    # --- Account settings (dynamic) ---
    BaseProtocol.HTTP_ADAPTER_CLS = NoVerifyHTTPAdapter
    credentials = Credentials(username, password)
    config = Configuration(credentials=credentials, service_endpoint=ews_url)
    account = Account(email, config=config, autodiscover=False, access_type=DELEGATE)

    timezone = ZoneInfo("Asia/Riyadh")

    # --- Helper functions ---
    def sanitize_folder_name(name):
        """Sanitize folder name to remove invalid characters"""
        return re.sub(r'[^\w\s-]', '', name).strip()

    def reply_request(item):
        """Send a fixed reply to the sender"""
        reply_body = "Please provide the request number if available or write otherwise."
        reply = Message(
            account=account,
            folder=item.folder,
            subject="Re: " + (item.subject or ""),
            body=reply_body,
            to_recipients=[item.sender.email_address] if item.sender else []
        )
        reply.send()
        print(f"Sent REPLAY reply to {item.sender.email_address if item.sender else 'unknown'}")

    def forward_to_employee(item, employee_email):
        """Forward the email to a specific employee with original sender + body"""
        original_sender = item.sender.email_address if item.sender else "unknown"
        body = f"Original sender: {original_sender}\n\n{item.text_body or ''}"
        reply = Message(
            account=account,
            folder=item.folder,
            subject=(item.subject),
            body=body,
            to_recipients=[employee_email]
        )
        reply.send()
        print(f"Forwarded email '{item.subject}' to {employee_email}")

    def move_to_folder(item, folder_name):
        """Move the email to a specific folder, create if it doesn't exist"""
        inbox = account.inbox
        target_folder = None
        for f in inbox.parent.walk():
            if f.name == folder_name:
                target_folder = f
                break
        if not target_folder:
            target_folder = inbox.parent.add_folder(folder_name)
        item.move(target_folder)
        print(f"Moved email '{item.subject}' to folder '{folder_name}'")

    def handle_request(item):
        """
        Handle REQUEST emails:
        - Extract original sender from body
        - Check states:true/false
        - If true → send confirmation
        - If false → extract missing items and send them to original sender
        """
        body = item.text_body or ""

        # Extract original sender
        match_sender = re.search(r'sender\s*:\s*(.*?)\s*\$', body, re.IGNORECASE | re.DOTALL)
        original_sender = match_sender.group(1).strip() if match_sender else None

        # Extract states value
        match_states = re.search(r'states\s*:\s*(true|false)', body, re.IGNORECASE)
        states = match_states.group(1).lower() == 'true' if match_states else None

        # Extract missing items if states is false
        missing_items = ""
        if states is False:
            match_missing = re.search(r'missing\s*:\s*(.*?)\s*\$', body, re.IGNORECASE | re.DOTALL)
            missing_items = match_missing.group(1).strip() if match_missing else ""

        if not original_sender:
            print("Could not determine original sender for REQUEST email.")
            return

        print("Original sender:", original_sender)
        print("States:", states)
        print("Missing items:", repr(missing_items))

        # Compose reply message
        if states is True:
            reply_body = "Your request has been updated successfully."
        else:
            reply_body = f"Your request is missing the following items:\n{missing_items}"

        reply = Message(
            account=account,
            folder=item.folder,
            subject="Re: " + (item.subject or ""),
            body=reply_body,
            to_recipients=[original_sender]
        )
        reply.send()
        print(f"Sent REQUEST reply to {original_sender}")

    # --- Process unread emails ---
    unread_items = account.inbox.filter(is_read=False)

    for item in unread_items:
        try:
            sender = item.sender.email_address if item.sender else ""
            subject = item.subject or ""
            body = item.text_body or ""

            classification = classify_email(subject, body, sender)
            print(f"Email from {sender} classified as {classification}")

            # Handle based on classification
            if classification == "REPLAY":
                reply_request(item)

            elif classification == "REQUEST":
                handle_request(item)

            elif classification in ["D", "MD", "F", "E"]:
                sent_time = item.datetime_received.astimezone(timezone)
                weekday = sent_time.strftime('%A')
                hour = sent_time.hour

                employee_email = get_available_employee(classification, weekday, hour)
                if employee_email:
                    forward_to_employee(item, employee_email)
                    move_to_folder(item, "Sent Items")
                else:
                    print(f"No available employee for {classification} at {weekday} {hour}:00")

            else:
                folder_name = sanitize_folder_name(classification)
                move_to_folder(item, folder_name)

            item.is_read = True
            item.save()

        except Exception as e:
            print(f"Error processing email '{item.subject}': {e}")