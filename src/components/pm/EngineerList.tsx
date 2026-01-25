"use client";

import { useState, useEffect } from 'react';
import { Users, Clock, CheckCircle, AlertCircle, Calendar, Filter } from 'lucide-react';
import Link from 'next/link';

interface Engineer {
  employeeId: string;
  employeeName: string;
  site: string;
  latestCheckIn: string;
  latestCheckOut: string | null;
  status: 'checked-in' | 'checked-out';
  totalRecords: number;
  pendingApprovals: number;
}

export default function EngineerList() {
  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [sites, setSites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    site: '',
    date: new Date().toISOString().split('T')[0],
    status: ''
  });

  const loadEngineers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.site) params.set('site', filters.site);
      if (filters.date) params.set('date', filters.date);
      
      const res = await fetch(`/api/pm/dashboard?${params}`);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to load engineers');
      
      setEngineers(data.employees || []);
      setSites(data.sites || []);
    } catch (error) {
      console.error('Error loading engineers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEngineers();
  }, [filters]);

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'checked-in':
        return <CheckCircle className="h-4 w-4" />;
      case 'checked-out':
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-medium">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              className="w-full p-2 border rounded-md"
              value={filters.date}
              onChange={(e) => setFilters({...filters, date: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Site</label>
            <select
              className="w-full p-2 border rounded-md"
              value={filters.site}
              onChange={(e) => setFilters({...filters, site: e.target.value})}
            >
              <option value="">All Sites</option>
              {sites.map((site) => (
                <option key={site} value={site}>
                  {site}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              className="w-full p-2 border rounded-md"
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <option value="">All Status</option>
              <option value="checked-in">Checked In</option>
              <option value="checked-out">Checked Out</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Engineers</p>
              <p className="text-2xl font-bold">{engineers.length}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Checked In</p>
              <p className="text-2xl font-bold text-green-600">
                {engineers.filter(e => e.status === 'checked-in').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Checked Out</p>
              <p className="text-2xl font-bold text-gray-600">
                {engineers.filter(e => e.status === 'checked-out').length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-gray-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Approvals</p>
              <p className="text-2xl font-bold text-orange-600">
                {engineers.reduce((sum, e) => sum + e.pendingApprovals, 0)}
              </p>
            </div>
            <AlertCircle className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Engineers List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Engineers Attendance
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
                  Site
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Check In
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Check Out
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pending
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {engineers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No engineers found for the selected filters
                  </td>
                </tr>
              ) : (
                engineers
                  .filter(engineer => !filters.status || engineer.status === filters.status)
                  .map((engineer) => (
                    <tr key={engineer.employeeId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/pm/engineers/${engineer.employeeId}`}
                          className="text-sm font-medium text-blue-600 hover:text-blue-900 hover:underline"
                        >
                          {engineer.employeeName}
                        </Link>
                        <div className="text-sm text-gray-500">
                          {engineer.employeeId}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{engineer.site}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(engineer.status)}`}>
                          {getStatusIcon(engineer.status)}
                          <span className="ml-1">{engineer.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(engineer.latestCheckIn).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(engineer.latestCheckIn).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {engineer.latestCheckOut 
                            ? new Date(engineer.latestCheckOut).toLocaleDateString()
                            : '-'
                          }
                        </div>
                        <div className="text-sm text-gray-500">
                          {engineer.latestCheckOut 
                            ? new Date(engineer.latestCheckOut).toLocaleTimeString()
                            : '-'
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {engineer.pendingApprovals > 0 ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {engineer.pendingApprovals}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500">0</span>
                        )}
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
