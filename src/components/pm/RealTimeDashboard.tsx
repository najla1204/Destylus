"use client";

import { useState, useEffect } from 'react';
import { Users, MapPin, Clock, CheckCircle, AlertCircle, Activity, RefreshCw } from 'lucide-react';

interface RealTimeUser {
  sessionId: string;
  user: {
    id: string;
    name: string;
    email: string;
    employeeId: string;
    role: string;
    site: string;
  };
  session: {
    loginTime: string;
    lastActivity: string;
    isActive: boolean;
  };
  attendance: {
    id: string;
    status: string;
    checkInTime: string;
    checkOutTime: string | null;
    site: string;
    approvalStatus: string;
    inTimePhoto: string | null;
    outTimePhoto: string | null;
    location: {
      latitude: number;
      longitude: number;
      address: string;
    } | null;
  } | null;
}

interface Summary {
  totalActiveUsers: number;
  currentlyCheckedIn: number;
  pendingApprovals: number;
  totalTodayRecords: number;
  byRole: {
    engineers: number;
    projectManagers: number;
    hr: number;
  };
}

export default function RealTimeDashboard() {
  const [realTimeData, setRealTimeData] = useState<RealTimeUser[]>([]);
  const [summary, setSummary] = useState<Summary>({
    totalActiveUsers: 0,
    currentlyCheckedIn: 0,
    pendingApprovals: 0,
    totalTodayRecords: 0,
    byRole: {
      engineers: 0,
      projectManagers: 0,
      hr: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedSite, setSelectedSite] = useState<string>('');

  const fetchRealTimeData = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedRole) params.set('role', selectedRole);
      if (selectedSite) params.set('site', selectedSite);
      
      const res = await fetch(`/api/attendance/realtime?${params}`);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to fetch real-time data');
      
      setRealTimeData(data.realTimeData || []);
      setSummary(data.summary || summary);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching real-time data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealTimeData();
    
    if (autoRefresh) {
      const interval = setInterval(fetchRealTimeData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh, selectedRole, selectedSite]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'checked-in':
        return 'bg-green-100 text-green-800';
      case 'checked-out':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getApprovalStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDuration = (loginTime: string, lastActivity: string) => {
    const login = new Date(loginTime);
    const activity = new Date(lastActivity);
    const diff = activity.getTime() - login.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header with Refresh Controls */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Real-Time Attendance</h2>
          <p className="text-sm text-gray-500">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded text-indigo-600"
            />
            <span className="text-sm text-gray-600">Auto-refresh</span>
          </label>
          <button
            onClick={fetchRealTimeData}
            className="flex items-center space-x-2 px-3 py-1 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">All Roles</option>
              <option value="engineer">Engineers</option>
              <option value="project_manager">Project Managers</option>
              <option value="hr">HR</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Site</label>
            <input
              type="text"
              value={selectedSite}
              onChange={(e) => setSelectedSite(e.target.value)}
              placeholder="Enter site name"
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">{summary.totalActiveUsers}</p>
            </div>
            <Activity className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Checked In</p>
              <p className="text-2xl font-bold text-green-600">{summary.currentlyCheckedIn}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-orange-600">{summary.pendingApprovals}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-orange-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Today Records</p>
              <p className="text-2xl font-bold text-indigo-600">{summary.totalTodayRecords}</p>
            </div>
            <Clock className="h-8 w-8 text-indigo-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Engineers</p>
              <p className="text-2xl font-bold text-blue-600">{summary.byRole.engineers}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Real-time User List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Live User Activity
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Currently active users and their attendance status
          </p>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Site
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Approval
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Session Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {realTimeData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      No active users found
                    </td>
                  </tr>
                ) : (
                  realTimeData.map((user) => (
                    <tr key={user.sessionId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.user.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.user.employeeId}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {user.user.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                          {user.user.site || 'Not assigned'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.attendance?.status || 'checked-out')}`}>
                          {user.attendance?.status || 'checked-out'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getApprovalStatusColor(user.attendance?.approvalStatus || 'pending')}`}>
                          {user.attendance?.approvalStatus || 'pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDuration(user.session.loginTime, user.session.lastActivity)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Since {new Date(user.session.loginTime).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.attendance?.location ? (
                          <div className="text-sm text-gray-900">
                            {user.attendance.location.address.length > 30 
                              ? `${user.attendance.location.address.substring(0, 30)}...`
                              : user.attendance.location.address
                            }
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">No location</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
