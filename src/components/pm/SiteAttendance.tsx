"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Users, Clock, CheckCircle, AlertCircle, TrendingUp, Calendar } from 'lucide-react';

interface SiteSummary {
  totalEmployees: number;
  totalAttendanceRecords: number;
  pendingApprovals: number;
  currentlyCheckedIn: number;
}

interface EmployeeSummary {
  employeeId: string;
  employeeName: string;
  totalDays: number;
  totalHours: number;
  pendingApprovals: number;
  lastCheckIn: string | null;
  currentStatus: 'checked-in' | 'checked-out';
}

interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkInTime: string;
  checkOutTime: string | null;
  status: 'pending' | 'approved' | 'rejected';
  totalHours: string | null;
  attachments: Array<{
    type: string;
    url: string;
    timestamp: string;
  }>;
  approvedBy: string | null;
  approvedAt: string | null;
  rejectionReason: string | null;
}

export default function SiteAttendance() {
  const params = useParams();
  const router = useRouter();
  const [siteData, setSiteData] = useState<{
    site: string;
    summary: SiteSummary;
    employeeSummary: EmployeeSummary[];
    attendanceRecords: AttendanceRecord[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: ''
  });
  const [viewMode, setViewMode] = useState<'summary' | 'detailed'>('summary');

  const loadSiteData = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filters.startDate) queryParams.set('startDate', filters.startDate);
      if (filters.endDate) queryParams.set('endDate', filters.endDate);
      if (filters.status) queryParams.set('status', filters.status);
      
      const res = await fetch(`/api/pm/site/${params.siteName}?${queryParams}`);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to load site data');
      
      setSiteData(data);
    } catch (error) {
      console.error('Error loading site data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.siteName) {
      loadSiteData();
    }
  }, [params.siteName, filters]);

  const getStatusColor = (status: string) => {
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!siteData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Site not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </button>
          <div className="flex items-center space-x-2">
            <MapPin className="h-6 w-6 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">{siteData.site}</h1>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('summary')}
            className={`px-4 py-2 rounded-md font-medium ${
              viewMode === 'summary'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Summary
          </button>
          <button
            onClick={() => setViewMode('detailed')}
            className={`px-4 py-2 rounded-md font-medium ${
              viewMode === 'detailed'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Detailed
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              className="w-full p-2 border rounded-md"
              value={filters.startDate}
              onChange={(e) => setFilters({...filters, startDate: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              className="w-full p-2 border rounded-md"
              value={filters.endDate}
              onChange={(e) => setFilters({...filters, endDate: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              className="w-full p-2 border rounded-md"
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Site Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Engineers</p>
              <p className="text-2xl font-bold">{siteData.summary.totalEmployees}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Currently Checked In</p>
              <p className="text-2xl font-bold text-green-600">
                {siteData.summary.currentlyCheckedIn}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Approvals</p>
              <p className="text-2xl font-bold text-orange-600">
                {siteData.summary.pendingApprovals}
              </p>
            </div>
            <AlertCircle className="h-8 w-8 text-orange-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Records</p>
              <p className="text-2xl font-bold text-indigo-600">
                {siteData.summary.totalAttendanceRecords}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-indigo-500" />
          </div>
        </div>
      </div>

      {viewMode === 'summary' ? (
        /* Employee Summary View */
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Engineer Summary
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Click on an engineer name to view detailed attendance history
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Engineer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Days
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pending
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Activity
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {siteData.employeeSummary.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      No engineers found for this site
                    </td>
                  </tr>
                ) : (
                  siteData.employeeSummary.map((employee) => (
                    <tr key={employee.employeeId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => router.push(`/pm/engineers/${employee.employeeId}`)}
                          className="text-sm font-medium text-blue-600 hover:text-blue-900 hover:underline text-left"
                        >
                          {employee.employeeName}
                        </button>
                        <div className="text-sm text-gray-500">
                          {employee.employeeId}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          employee.currentStatus === 'checked-in'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {employee.currentStatus === 'checked-in' ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Checked In
                            </>
                          ) : (
                            <>
                              <Clock className="h-3 w-3 mr-1" />
                              Checked Out
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{employee.totalDays}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {employee.totalHours.toFixed(1)}h
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {employee.pendingApprovals > 0 ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {employee.pendingApprovals}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500">0</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {employee.lastCheckIn 
                            ? new Date(employee.lastCheckIn).toLocaleDateString()
                            : '-'
                          }
                        </div>
                        <div className="text-sm text-gray-500">
                          {employee.lastCheckIn 
                            ? new Date(employee.lastCheckIn).toLocaleTimeString()
                            : '-'
                          }
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Detailed Attendance View */
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Detailed Attendance Records
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Engineer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check In
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check Out
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {siteData.attendanceRecords.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      No attendance records found for the selected filters
                    </td>
                  </tr>
                ) : (
                  siteData.attendanceRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{record.date}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => router.push(`/pm/engineers/${record.employeeId}`)}
                          className="text-sm font-medium text-blue-600 hover:text-blue-900 hover:underline text-left"
                        >
                          {record.employeeName}
                        </button>
                        <div className="text-sm text-gray-500">
                          {record.employeeId}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{record.checkInTime}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {record.checkOutTime || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {record.totalHours ? `${record.totalHours}h` : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                          {record.status}
                        </span>
                        {record.approvedAt && (
                          <div className="text-xs text-gray-500 mt-1">
                            by {record.approvedBy}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
