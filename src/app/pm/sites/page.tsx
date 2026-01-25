"use client";

import { useState, useEffect } from 'react';
import { MapPin, Users, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface SiteData {
  name: string;
  totalEngineers: number;
  currentlyCheckedIn: number;
  pendingApprovals: number;
  totalRecords: number;
}

export default function PMSitesPage() {
  const [sites, setSites] = useState<SiteData[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSites = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/pm/dashboard');
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to load sites');
      
      // Group attendance by site to get site statistics
      const siteMap = new Map<string, SiteData>();
      
      data.employees?.forEach((employee: any) => {
        const siteName = employee.site;
        
        if (!siteMap.has(siteName)) {
          siteMap.set(siteName, {
            name: siteName,
            totalEngineers: 0,
            currentlyCheckedIn: 0,
            pendingApprovals: 0,
            totalRecords: 0
          });
        }
        
        const site = siteMap.get(siteName)!;
        site.totalEngineers++;
        site.totalRecords += employee.totalRecords;
        site.pendingApprovals += employee.pendingApprovals;
        
        if (employee.status === 'checked-in') {
          site.currentlyCheckedIn++;
        }
      });
      
      setSites(Array.from(siteMap.values()));
    } catch (error) {
      console.error('Error loading sites:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSites();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Site Attendance Overview</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Sites</p>
              <p className="text-2xl font-bold">{sites.length}</p>
            </div>
            <MapPin className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Engineers</p>
              <p className="text-2xl font-bold">
                {sites.reduce((sum, site) => sum + site.totalEngineers, 0)}
              </p>
            </div>
            <Users className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Currently Checked In</p>
              <p className="text-2xl font-bold text-green-600">
                {sites.reduce((sum, site) => sum + site.currentlyCheckedIn, 0)}
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
                {sites.reduce((sum, site) => sum + site.pendingApprovals, 0)}
              </p>
            </div>
            <AlertCircle className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Sites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sites.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">No sites found</p>
          </div>
        ) : (
          sites.map((site) => (
            <Link
              key={site.name}
              href={`/pm/sites/${encodeURIComponent(site.name)}`}
              className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-6 w-6 text-indigo-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    {site.name}
                  </h3>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Engineers</span>
                  <span className="font-medium">{site.totalEngineers}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Checked In</span>
                  <span className="font-medium text-green-600">
                    {site.currentlyCheckedIn}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pending</span>
                  <span className="font-medium text-orange-600">
                    {site.pendingApprovals}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Records</span>
                  <span className="font-medium">{site.totalRecords}</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-indigo-600 font-medium">
                    View Details
                  </span>
                  <svg
                    className="h-4 w-4 text-indigo-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
