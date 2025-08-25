import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Save, 
  Edit3, 
  Calendar,
  User,
  Building,
  Clock,
  Hash
} from 'lucide-react';
import { scheduleAPI, ScheduleItem } from '../services/api';

const Schedule = () => {
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const shiftOptions = [
    '7am-3pm',
    '3pm-11pm', 
    '11pm-7am',
    '10am-6pm'
  ];
  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await scheduleAPI.getSchedule();
      setSchedule(response.schedule || []);
    } catch (err: any) {
      setError('Failed to fetch schedule data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await scheduleAPI.updateSchedule(schedule);
      setSuccess('Schedule updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError('Failed to save schedule changes.');
    } finally {
      setSaving(false);
    }
  };

  const addRow = () => {
    const newItem: ScheduleItem = {
      Email: '',
      Department: '',
      SunTue: 'No',
      WedThu: 'No', 
      FriSat: 'No',
      Shift: '7am-3pm',
      score: 0
    };
    setSchedule([...schedule, newItem]);
  };

  const deleteRow = (index: number) => {
    setSchedule(schedule.filter((_, i) => i !== index));
  };

  const updateRow = (index: number, field: keyof ScheduleItem, value: string | number) => {
    const updatedSchedule = [...schedule];
    updatedSchedule[index] = { ...updatedSchedule[index], [field]: value };
    setSchedule(updatedSchedule);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-3">
                <Calendar className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-semibold text-gray-900">Schedule Editor</h1>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={addRow}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Add Row</span>
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700">{success}</p>
          </div>
        )}

        {/* Schedule Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center space-x-2">
                        <Hash className="h-4 w-4" />
                        <span>ID</span>
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>Email</span>
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center space-x-2">
                        <Building className="h-4 w-4" />
                        <span>Department</span>
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <span>SunTue</span>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <span>WedThu</span>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <span>FriSat</span>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Shift
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Delete
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {schedule.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="email"
                          value={item.Email}
                          onChange={(e) => updateRow(index, 'Email', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="user@example.com"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={item.Department}
                          onChange={(e) => updateRow(index, 'Department', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Department name"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-4">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name={`sunTue-${index}`}
                              value="Yes"
                              checked={item.SunTue === 'Yes'}
                              onChange={(e) => updateRow(index, 'SunTue', e.target.value)}
                              className="mr-2 text-blue-600 focus:ring-blue-500"
                            />
                            Yes
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name={`sunTue-${index}`}
                              value="No"
                              checked={item.SunTue === 'No'}
                              onChange={(e) => updateRow(index, 'SunTue', e.target.value)}
                              className="mr-2 text-blue-600 focus:ring-blue-500"
                            />
                            No
                          </label>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-4">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name={`wedThu-${index}`}
                              value="Yes"
                              checked={item.WedThu === 'Yes'}
                              onChange={(e) => updateRow(index, 'WedThu', e.target.value)}
                              className="mr-2 text-blue-600 focus:ring-blue-500"
                            />
                            Yes
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name={`wedThu-${index}`}
                              value="No"
                              checked={item.WedThu === 'No'}
                              onChange={(e) => updateRow(index, 'WedThu', e.target.value)}
                              className="mr-2 text-blue-600 focus:ring-blue-500"
                            />
                            No
                          </label>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-4">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name={`friSat-${index}`}
                              value="Yes"
                              checked={item.FriSat === 'Yes'}
                              onChange={(e) => updateRow(index, 'FriSat', e.target.value)}
                              className="mr-2 text-blue-600 focus:ring-blue-500"
                            />
                            Yes
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name={`friSat-${index}`}
                              value="No"
                              checked={item.FriSat === 'No'}
                              onChange={(e) => updateRow(index, 'FriSat', e.target.value)}
                              className="mr-2 text-blue-600 focus:ring-blue-500"
                            />
                            No
                          </label>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={item.Shift}
                          onChange={(e) => updateRow(index, 'Shift', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {shiftOptions.map((shift) => (
                            <option key={shift} value={shift}>
                              {shift}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          value={item.score}
                          onChange={(e) => updateRow(index, 'score', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0"
                          min="0"
                          step="0.1"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => deleteRow(index)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {schedule.length === 0 && (
                <div className="text-center py-12">
                  <Edit3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No schedule items found</p>
                  <button
                    onClick={addRow}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add First Row</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Schedule;