"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, MapPin, CheckSquare, Clock, TrendingUp, AlertCircle, Activity } from 'lucide-react';
import RealTimeDashboard from '@/components/pm/RealTimeDashboard';

interface DashboardStats {
  totalEngineers: number;
  currentlyCheckedIn: number;
  pendingApprovals: number;
  totalSites: number;
  todayRecords: number;
  weeklyTrend: number;
}

interface RecentActivity {
  id: string;
  type: 'check-in' | 'check-out' | 'approval';
  employeeName: string;
  site: string;
  timestamp: string;
  status: string;
}

export default function PMDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalEngineers: 0,
    currentlyCheckedIn: 0,
    pendingApprovals: 0,
    totalSites: 0,
    todayRecords: 0,
    weeklyTrend: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRealTime, setShowRealTime] = useState(false);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/pm/dashboard');
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to load dashboard data');
      
      // Calculate stats
      const employees = data.employees || [];
      const sites = [...new Set(employees.map((e: any) => e.site))];
      const today = new Date().toISOString().split('T')[0];
      const todayRecords = employees.filter((e: any) => 
        new Date(e.latestCheckIn).toISOString().split('T')[0] === today
      ).length;
      
      setStats({
        totalEngineers: employees.length,
        currentlyCheckedIn: employees.filter((e: any) => e.status === 'checked-in').length,
        pendingApprovals: employees.reduce((sum: number, e: any) => sum + e.pendingApprovals, 0),
        totalSites: sites.length,
        todayRecords,
        weeklyTrend: 12.5 // Mock trend data
      });
      
      // Generate recent activity (mock data for now)
      setRecentActivity([
        {
          id: '1',
          type: 'check-in',
          employeeName: 'Fathima',
          site: 'Site A',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          status: 'pending'
        },
        {
          id: '2',
          type: 'approval',
          employeeName: 'Jane Smith',
          site: 'Site B',
          timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          status: 'approved'
        },
        {
          id: '3',
          type: 'check-out',
          employeeName: 'Mike Johnson',
          site: 'Site A',
          timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
          status: 'approved'
        }
      ]);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'check-in':
        return <CheckSquare className="h-4 w-4 text-green-600" />;
      case 'check-out':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'approval':
        return <CheckSquare className="h-4 w-4 text-purple-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Project Manager Dashboard</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowRealTime(!showRealTime)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium ${
              showRealTime
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            <Activity className="h-4 w-4" />
            <span>{showRealTime ? 'Hide' : 'Show'} Real-Time</span>
          </button>
          <div className="text-sm text-gray-500">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>
      </div>

      {/* Real-time Dashboard */}
      {showRealTime && (
        <div className="bg-white shadow-lg rounded-lg p-6 border-2 border-indigo-200">
          <RealTimeDashboard />
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Engineers</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalEngineers}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Currently Checked In</p>
              <p className="text-3xl font-bold text-green-600">{stats.currentlyCheckedIn}</p>
            </div>
            <CheckSquare className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Approvals</p>
              <p className="text-3xl font-bold text-orange-600">{stats.pendingApprovals}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-orange-500" />
          </div>
          {stats.pendingApprovals > 0 && (
            <Link
              href="/pm/approvals"
              className="mt-2 text-sm text-orange-600 hover:text-orange-800"
            >
              Review now →
            </Link>
          )}
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Sites</p>
              <p className="text-3xl font-bold text-indigo-600">{stats.totalSites}</p>
            </div>
            <MapPin className="h-8 w-8 text-indigo-500" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/pm/engineers"
            className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Users className="h-6 w-6 text-blue-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">View Engineers</p>
              <p className="text-sm text-gray-500">Check attendance status</p>
            </div>
          </Link>
          
          <Link
            href="/pm/sites"
            className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <MapPin className="h-6 w-6 text-green-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">View Sites</p>
              <p className="text-sm text-gray-500">Site-wise attendance</p>
            </div>
          </Link>
          
          <Link
            href="/pm/approvals"
            className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <CheckSquare className="h-6 w-6 text-orange-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Approvals</p>
              <p className="text-sm text-gray-500">Review pending requests</p>
            </div>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentActivity.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            ) : (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-3">
                    {getActivityIcon(activity.type)}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {activity.employeeName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {activity.type.replace('-', ' ')} at {activity.site}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActivityColor(activity.status)}`}>
                      {activity.status}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(activity.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Today's Overview */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Today's Overview</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Check-ins Today</span>
              <span className="font-medium">{stats.todayRecords}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Currently Active</span>
              <span className="font-medium text-green-600">{stats.currentlyCheckedIn}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Weekly Trend</span>
              <span className="font-medium text-green-600 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                {stats.weeklyTrend}%
              </span>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <Link
                href="/pm/reports"
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
              >
                View detailed reports →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
