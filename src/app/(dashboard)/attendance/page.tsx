// src/app/(dashboard)/attendance/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Camera, CheckCircle2, XCircle, Clock, User, MapPin, Calendar, Clock as ClockIcon, Check, X, AlertCircle } from "lucide-react";

type AttendanceState = "idle" | "checked-in" | "checked-out";

interface AttendanceRecord {
  _id: string;
  employeeName: string;
  employeeId: string;
  role: string;
  site: string;
  status: 'checked-in' | 'checked-out';
  approvalStatus: 'pending' | 'approved' | 'rejected';
  checkInTime: string;
  checkOutTime?: string;
  inTimePhoto?: string;
  outTimePhoto?: string;
  totalHours?: number;
  notes?: string;
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function AttendancePage() {
  /* ---------------- STATE ---------------- */
  const [userRole, setUserRole] = useState<"Engineer" | "ProjectManager">("Engineer");
  const [pmTab, setPmTab] = useState<"my-attendance" | "verify">("verify");
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceRecord[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<AttendanceRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [status, setStatus] = useState<AttendanceState>("idle");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [selectedSite, setSelectedSite] = useState("");
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number; address: string } | null>(null);
  const [capturingPhoto, setCapturingPhoto] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  // Demo data - replace with your actual data
  const employeeName = "John Doe";
  const employeeId = "EMP-001";
  const role = "Site Engineer";
  const availableSites = ["Skyline Tower A", "City Bridge Renovation", "Green Valley Mall"];

  /* ---------------- HANDLERS ---------------- */
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setMessage("Geolocation is not supported by your browser. Please use a modern browser that supports geolocation.");
      setMessageType("error");
      return;
    }

    setMessage("Getting your location...");
    setMessageType("success");
    setLoading(true);

    const options = {
      enableHighAccuracy: true,
      timeout: 10000, // 10 seconds
      maximumAge: 0 // Force fresh location
    };

    const success = (position: GeolocationPosition) => {
      setCurrentLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        address: "Current Location" // In a real app, you'd want to reverse geocode this
      });
      setMessage("Location found!");
      setMessageType("success");
      setLoading(false);
    };

    const error = (error: GeolocationPositionError) => {
      let errorMessage = "Could not get your location. ";

      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage += "Please enable location permissions in your browser settings and refresh the page.";
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage += "Location information is unavailable. Please check your network connection and try again.";
          break;
        case error.TIMEOUT:
          errorMessage += "The request to get your location timed out. Please try again.";
          break;
        default:
          errorMessage += "An unknown error occurred.";
      }

      console.error("Geolocation error:", error);
      setMessage(errorMessage);
      setMessageType("error");
      setLoading(false);
    };

    navigator.geolocation.getCurrentPosition(success, error, options);
  };

  const loadAttendance = async () => {
    try {
      // Use local mock if API fails for demo
      let data;
      try {
        const res = await fetch(`/api/attendance?employeeId=${employeeId}`);
        if (!res.ok) throw new Error("API not available");
        data = await res.json();
      } catch (e) {
        console.warn("API load failed, using mock data", e);
        data = { attendanceLogs: [] };
      }

      setAttendanceLogs(data.attendanceLogs || []);

      // For project managers, load pending approvals
      if (userRole === 'ProjectManager') {
        try {
          const pendingRes = await fetch('/api/attendance?approvalStatus=pending');
          const pendingData = pendingRes.ok ? await pendingRes.json() : { attendanceLogs: [] };
          setPendingApprovals(pendingData.attendanceLogs || []);
        } catch (e) {
          setPendingApprovals([]);
        }
      }

      // Check if user is currently checked in
      const activeCheckIn = data.attendanceLogs?.find(
        (log: AttendanceRecord) => !log.checkOutTime
      );

      setStatus(activeCheckIn ? "checked-in" : "idle");
      if (activeCheckIn) {
        setSelectedSite(activeCheckIn.site);
      }
    } catch (error) {
      console.error("Error loading attendance:", error);
      setMessage("Failed to load attendance data");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- EFFECTS ---------------- */
  useEffect(() => {
    // In a real app, get user role from auth context or localStorage
    const role = localStorage.getItem("userRole") as "Engineer" | "ProjectManager" | null;
    if (role) {
      setUserRole(role);
    }
    loadAttendance();
    getCurrentLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const captureGeotagPhoto = async (): Promise<string> => {
    setCapturingPhoto(true);
    try {
      // Simulate photo capture delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // In a real app, you would capture the actual photo here
      const photoUrl = currentLocation
        ? `https://maps.googleapis.com/maps/api/staticmap?center=${currentLocation.latitude},${currentLocation.longitude}&zoom=15&size=400x200&markers=color:red%7C${currentLocation.latitude},${currentLocation.longitude}&key=YOUR_GOOGLE_MAPS_API_KEY`
        : "https://via.placeholder.com/400x200?text=Photo+Captured";

      setPhotoUrl(photoUrl);
      return photoUrl;
    } catch (error) {
      console.error("Error capturing photo:", error);
      throw new Error("Could not capture photo");
    } finally {
      setCapturingPhoto(false);
    }
  };



  const handleAttendance = async (action: "check-in" | "check-out") => {
    if (!selectedSite) {
      setMessage("Please select a site");
      setMessageType("error");
      return;
    }

    setActionLoading(true);
    setMessage("");

    try {
      // Capture geotag photo
      const photoUrl = await captureGeotagPhoto();

      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          employeeName,
          employeeId,
          role,
          site: selectedSite,
          photoUrl,
          location: currentLocation
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Action failed");
      }

      setMessage(data.message);
      setMessageType("success");
      await loadAttendance();
      setMessageType("success");
      await loadAttendance();
    } catch (err: unknown) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "Failed to process request";
      setMessage(errorMessage);
      setMessageType("error");
    } finally {
      setActionLoading(false);
      setTimeout(() => setMessage(""), 5000);
    }
  };

  const handleReviewAction = async (id: string, action: 'approve' | 'reject') => {
    if (action === 'reject' && !rejectionReason.trim()) {
      setMessage("Please provide a reason for rejection");
      setMessageType("error");
      return;
    }

    setActionLoading(true);
    setMessage("");

    try {
      const res = await fetch(`/api/attendance/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: action,
          ...(action === 'reject' && { rejectionReason })
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update attendance');
      }

      setMessage(`Attendance ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
      setMessageType("success");
      setSelectedRecord(null);
      setRejectionReason("");
      await loadAttendance();
      setRejectionReason("");
      await loadAttendance();
    } catch (err: unknown) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to process request';
      setMessage(errorMessage);
      setMessageType("error");
    } finally {
      setActionLoading(false);
      setTimeout(() => setMessage(""), 5000);
    }
  };

  /* ---------------- RENDER HELPERS ---------------- */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const MyAttendanceUI = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Mark Attendance</h2>

        {/* Site Selection */}
        <div className="mb-6">
          <label htmlFor="site" className="block text-sm font-medium text-gray-700 mb-2">
            Select Site
          </label>
          <select
            id="site"
            value={selectedSite}
            onChange={(e) => setSelectedSite(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
            disabled={status === "checked-in"}
          >
            <option value="">Select a site</option>
            {availableSites.map((site) => (
              <option key={site} value={site}>
                {site}
              </option>
            ))}
          </select>
        </div>

        {/* Check In/Out Button */}
        <div className="flex justify-center my-6">
          <button
            onClick={() => handleAttendance(status === "checked-in" ? "check-out" : "check-in")}
            disabled={actionLoading || capturingPhoto || !selectedSite}
            className={`px-6 py-3 rounded-full text-white font-medium ${status === "checked-in"
              ? "bg-red-500 hover:bg-red-600"
              : "bg-green-500 hover:bg-green-600"
              } disabled:opacity-50 flex items-center gap-2`}
          >
            {capturingPhoto ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {status === "checked-in" ? "Capturing Check-Out..." : "Capturing Check-In..."}
              </>
            ) : (
              <>
                {status === "checked-in" ? (
                  <>
                    <Clock className="h-5 w-5" />
                    Check Out from {selectedSite}
                  </>
                ) : (
                  <>
                    <Check className="h-5 w-5" />
                    Check In to {selectedSite}
                  </>
                )}
              </>
            )}
          </button>
        </div>

        {/* Photo Preview */}
        {photoUrl && (
          <div className="mt-4 p-4 border rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">Captured Photo:</p>
            <img
              src={photoUrl}
              alt="Location preview"
              className="w-full h-auto rounded-md"
            />
          </div>
        )}

        {/* Current Status */}
        {status === "checked-in" && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <Clock className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  You are currently checked in at {selectedSite}. Don&apos;t forget to check out when you leave.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {attendanceLogs
              .filter(log => log.employeeId === employeeId)
              .sort((a, b) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime())
              .slice(0, 5)
              .map((log) => (
                <li key={log._id}>
                  <div className="px-4 py-4 flex items-center sm:px-6">
                    <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <div className="flex text-sm">
                          <p className="font-medium text-indigo-600 truncate">
                            {log.site}
                          </p>
                          <p className="ml-2 flex-shrink-0 font-normal text-gray-500">
                            {new Date(log.checkInTime).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="mt-2 flex">
                          <div className="flex items-center text-sm text-gray-500">
                            <ClockIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                            <p>
                              {new Date(log.checkInTime).toLocaleTimeString()} -{' '}
                              {log.checkOutTime
                                ? new Date(log.checkOutTime).toLocaleTimeString()
                                : 'Present'}
                              {log.totalHours && ` (${log.totalHours.toFixed(2)} hours)`}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex-shrink-0 sm:mt-0">
                        <div className="flex overflow-hidden">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${log.approvalStatus === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : log.approvalStatus === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                            }`}>
                            {log.approvalStatus.charAt(0).toUpperCase() + log.approvalStatus.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
          </ul>
        </div>
      </div>
    </div >
  );

  const ProjectManagerView = () => (
    <div className="space-y-6">
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setPmTab('verify')}
          className={`py-4 px-6 font-medium text-sm ${pmTab === 'verify'
            ? 'border-b-2 border-indigo-500 text-indigo-600'
            : 'text-gray-500 hover:text-gray-700'
            }`}
        >
          Verify Attendance
        </button>
        <button
          onClick={() => setPmTab('my-attendance')}
          className={`py-4 px-6 font-medium text-sm ${pmTab === 'my-attendance'
            ? 'border-b-2 border-indigo-500 text-indigo-600'
            : 'text-gray-500 hover:text-gray-700'
            }`}
        >
          My Attendance
        </button>
      </div>

      {pmTab === 'verify' ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Pending Approvals
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Review and approve attendance records for your team.
            </p>
          </div>

          {pendingApprovals.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No pending approvals
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {pendingApprovals.map((record) => (
                <li key={record._id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-indigo-600 truncate">
                          {record.employeeName}
                        </div>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {record.role}
                          </p>
                        </div>
                      </div>
                      <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <MapPin className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                          {record.site}
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <Calendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                          {new Date(record.checkInTime).toLocaleDateString()}
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <ClockIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                          {new Date(record.checkInTime).toLocaleTimeString()}
                          {record.checkOutTime && (
                            <>
                              {' - '}
                              {new Date(record.checkOutTime).toLocaleTimeString()}
                              {record.totalHours && ` (${record.totalHours.toFixed(2)} hours)`}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedRecord(record);
                          setRejectionReason('');
                        }}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        View Details
                      </button>
                    </div>
                  </div>

                  {/* Photo preview */}
                  <div className="mt-4 flex space-x-4">
                    {record.inTimePhoto && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Check-in Photo</p>
                        <div
                          className="w-20 h-20 bg-gray-100 rounded-md flex items-center justify-center cursor-pointer"
                          onClick={() => window.open(record.inTimePhoto, '_blank')}
                        >
                          <Camera className="h-6 w-6 text-gray-400" />
                        </div>
                      </div>
                    )}
                    {record.outTimePhoto && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Check-out Photo</p>
                        <div
                          className="w-20 h-20 bg-gray-100 rounded-md flex items-center justify-center cursor-pointer"
                          onClick={() => window.open(record.outTimePhoto, '_blank')}
                        >
                          <Camera className="h-6 w-6 text-gray-400" />
                        </div>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <MyAttendanceUI />
      )}

      {/* Approval/Rejection Modal */}
      {selectedRecord && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Review Attendance
                  </h3>
                  <div className="mt-4 text-left">
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Employee:</span> {selectedRecord.employeeName}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      <span className="font-medium">Site:</span> {selectedRecord.site}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      <span className="font-medium">Check-in:</span> {new Date(selectedRecord.checkInTime).toLocaleString()}
                    </p>
                    {selectedRecord.checkOutTime && (
                      <p className="text-sm text-gray-500 mt-1">
                        <span className="font-medium">Check-out:</span> {new Date(selectedRecord.checkOutTime).toLocaleString()}
                      </p>
                    )}
                    {selectedRecord.inTimePhoto && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Check-in Photo:</p>
                        <div
                          className="w-full h-48 bg-gray-100 rounded-md flex items-center justify-center cursor-pointer"
                          onClick={() => window.open(selectedRecord.inTimePhoto, '_blank')}
                        >
                          <Camera className="h-12 w-12 text-gray-400" />
                        </div>
                      </div>
                    )}
                    {selectedRecord.outTimePhoto && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Check-out Photo:</p>
                        <div
                          className="w-full h-48 bg-gray-100 rounded-md flex items-center justify-center cursor-pointer"
                          onClick={() => window.open(selectedRecord.outTimePhoto, '_blank')}
                        >
                          <Camera className="h-12 w-12 text-gray-400" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
                  onClick={() => handleReviewAction(selectedRecord._id, 'approve')}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Approving...' : 'Approve'}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                  onClick={() => setSelectedRecord(null)}
                  disabled={actionLoading}
                >
                  Cancel
                </button>
              </div>
              <div className="mt-4">
                <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700">
                  Rejection Reason (if applicable)
                </label>
                <div className="mt-1">
                  <textarea
                    rows={3}
                    name="rejectionReason"
                    id="rejectionReason"
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                    placeholder="Enter reason for rejection"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  />
                </div>
                <div className="mt-2">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-red-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm"
                    onClick={() => handleReviewAction(selectedRecord._id, 'reject')}
                    disabled={actionLoading || !rejectionReason.trim()}
                  >
                    {actionLoading ? 'Rejecting...' : 'Reject'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  /* ---------------- MAIN RENDER ---------------- */
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Attendance Management</h2>
        <p className="mt-1 text-sm text-gray-500">
          {userRole === 'ProjectManager'
            ? 'Manage and verify team attendance'
            : 'Record your site attendance with geotag verification'}
        </p>
      </div>

      {message && (
        <div className={`p-4 mb-4 rounded-md ${messageType === "success"
          ? "bg-green-100 text-green-800"
          : "bg-red-100 text-red-800"
          }`}>
          <div className="flex items-center justify-between">
            <span>{message}</span>
            {messageType === "error" && (
              <button
                onClick={getCurrentLocation}
                className="ml-4 px-3 py-1 text-sm bg-white rounded-md hover:bg-gray-100"
                disabled={loading}
              >
                {loading ? 'Retrieving...' : 'Retry'}
              </button>
            )}
          </div>
        </div>
      )}

      {userRole === 'ProjectManager' ? (
        <ProjectManagerView />
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
          <MyAttendanceUI />
        </div>
      )}
    </div>
  );
}