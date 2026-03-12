"use client";

import { useEffect, useState, useRef } from "react";
import { 
  Camera, CheckCircle2, XCircle, Clock, MapPin, 
  Calendar, Clock as ClockIcon, Check, X, AlertCircle, 
  Plus, Search, Filter, ChevronRight, ArrowLeft, ArrowRight,
  Maximize2, RefreshCw, Smartphone, Map, ArrowUpRight, ArrowDownRight,
  Layers, Trash2, ChevronDown, ChevronRight as ChevronRightIcon
} from "lucide-react";

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

interface Site {
  _id: string;
  name: string;
  location: string;
}

export default function AttendancePage() {
  /* ---------------- STATE ---------------- */
  const [userRole, setUserRole] = useState<"Engineer" | "ProjectManager">("Engineer");
  const [pmTab, setPmTab] = useState<"my-attendance" | "verify">("my-attendance");
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceRecord[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<AttendanceRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [status, setStatus] = useState<AttendanceState>("idle");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  const [selectedSite, setSelectedSite] = useState("");
  const [sites, setSites] = useState<Site[]>([]);
  
  // Modal States
  const [isLogAttendanceOpen, setIsLogAttendanceOpen] = useState(false);
  const [photoViewerOpen, setPhotoViewerOpen] = useState(false);
  const [currentViewerPhotos, setCurrentViewerPhotos] = useState<{url: string, title: string, time: string, location: string, id: string, type: string}[]>([]);
  const [currentViewerIndex, setCurrentViewerIndex] = useState(0);
  
  // Camera States
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState("");
  const [cameraFacingMode, setCameraFacingMode] = useState<"user" | "environment">("user");

  // Filter States
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [siteFilter, setSiteFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [employeeName, setEmployeeName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [role, setRole] = useState("");

  /* ---------------- HANDLERS ---------------- */
  const loadAttendance = async () => {
    try {
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      
      // Try to find ANY unique identifier
      const id = user?.employeeId || user?.id || user?._id || localStorage.getItem("userId") || user?.email || "";
      const name = user?.name || localStorage.getItem("userName") || "";
      const userRoleStr = (user?.role === 'project_manager' || localStorage.getItem("userRole") === 'Project Manager' || user?.role === 'hr' || localStorage.getItem("userRole") === 'HR Manager') ? "ProjectManager" : "Engineer";
      
      setEmployeeId(id);
      setEmployeeName(name);
      setRole(userRoleStr);
      setUserRole(userRoleStr);
      if (userRoleStr === "ProjectManager") setPmTab("verify");

      const res = await fetch(`/api/attendance?employeeId=${id}`);
      const data = await res.json();
      setAttendanceLogs(data.attendanceLogs || []);

      // If PM, fetch all for verification
      if (userRoleStr === "ProjectManager") {
        const verifyRes = await fetch('/api/attendance?approvalStatus=pending');
        const verifyData = await verifyRes.json();
        setPendingApprovals(verifyData.attendanceLogs || []);
      }

      // Latest status
      const latest = (data.attendanceLogs || []).find((l: AttendanceRecord) => !l.checkOutTime);
      if (latest) {
        setStatus("checked-in");
        setSelectedSite(latest.site);
      } else {
        setStatus("idle");
      }
    } catch (error) {
      console.error("Error loading attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadSites = async () => {
    try {
      const res = await fetch('/api/sites');
      const data = await res.json();
      setSites(data);
    } catch (err) {
      console.error("Error loading sites:", err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const handleStartCamera = async (mode: "user" | "environment" = cameraFacingMode) => {
    stopCamera();
    setIsCameraActive(true);
    setCapturedPhoto(null);
    setCameraError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraError("Camera access denied or unavailable.");
    }
  };

  const toggleCamera = () => {
    const newMode = cameraFacingMode === "user" ? "environment" : "user";
    setCameraFacingMode(newMode);
    handleStartCamera(newMode);
  };

  const handleCameraCapture = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
      setCapturedPhoto(dataUrl);
      stopCamera();
      setIsCameraActive(false);
    }
  };

  const fetchCurrentLocation = async () => {
    return new Promise<{latitude: number, longitude: number, address: string}>((resolve) => {
      if (!navigator.geolocation) {
        resolve({ latitude: 0, longitude: 0, address: "Geolocation not supported" });
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            address: `Lat: ${pos.coords.latitude.toFixed(4)}, Lng: ${pos.coords.longitude.toFixed(4)}`
          });
        },
        () => {
          resolve({ latitude: 0, longitude: 0, address: "Location Permission Denied" });
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  };

  const handleAttendanceSubmit = async (action: "check-in" | "check-out") => {
    if (!employeeName || !employeeId || !role || !selectedSite || !capturedPhoto) {
        alert(`Missing required information:
            Name: ${employeeName || 'MISSING'}
            ID: ${employeeId || 'MISSING'}
            Role: ${role || 'MISSING'}
            Site: ${selectedSite || 'MISSING'}
            Photo: ${capturedPhoto ? 'Captured' : 'MISSING'}`);
        return;
    }

    setActionLoading(true);
    try {
      const location = await fetchCurrentLocation();
      
      // Upload to Cloudinary
      let finalPhotoUrl = capturedPhoto;
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

      if (cloudName && uploadPreset && capturedPhoto) {
          const formData = new FormData();
          formData.append("file", capturedPhoto);
          formData.append("upload_preset", uploadPreset);
          const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
              method: "POST",
              body: formData
          });
          if (uploadRes.ok) {
              const uploadData = await uploadRes.json();
              finalPhotoUrl = uploadData.secure_url;
          }
      }

      const res = await fetch("/api/attendance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
              action,
              employeeName,
              employeeId,
              role,
              site: selectedSite,
              photoUrl: finalPhotoUrl,
              location
          })
      });

      if (res.ok) {
          await loadAttendance();
          setIsLogAttendanceOpen(false);
          setCapturedPhoto(null);
      } else {
          const err = await res.json();
          alert(err.error || "Failed to submit attendance");
      }
    } catch (err) {
      console.error("Attendance submission error:", err);
      alert("An error occurred during submission.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReviewAction = async (id: string, action: 'approve' | 'reject') => {
    if (action === 'reject' && !rejectionReason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(`/api/attendance/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: action,
          ...(action === 'reject' && { rejectionReason })
        })
      });

      if (res.ok) {
        setSelectedRecord(null);
        setRejectionReason("");
        await loadAttendance();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update attendance');
      }
    } catch (err) {
      console.error("Review action error:", err);
    } finally {
      setActionLoading(false);
    }
  };
  const handleDeleteAttendance = async (id: string) => {
    if (!confirm("Are you sure you want to delete this attendance record? This action cannot be undone.")) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/attendance/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        await loadAttendance();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete attendance record');
      }
    } catch (err) {
      console.error("Delete action error:", err);
      alert("An error occurred while deleting the record.");
    } finally {
      setActionLoading(false);
    }
  };

  const openPhotoViewerFromRecord = (record: AttendanceRecord, type: 'in' | 'out') => {
    const photos: {url: string, title: string, time: string, location: string, id: string, type: string}[] = [];
    
    // Add check-in
    if (record.inTimePhoto) {
        photos.push({ 
            url: record.inTimePhoto, 
            title: `${record.employeeName} - Check In`, 
            time: new Date(record.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            location: record.location?.address || 'Geolocation Recorded',
            id: record._id, 
            type: 'in' 
        });
    }
    // Add check-out
    if (record.outTimePhoto && record.checkOutTime) {
        photos.push({ 
            url: record.outTimePhoto, 
            title: `${record.employeeName} - Check Out`, 
            time: new Date(record.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            location: record.location?.address || 'Geolocation Recorded',
            id: record._id, 
            type: 'out' 
        });
    }
    
    setCurrentViewerPhotos(photos);
    const index = photos.findIndex(p => p.type === type);
    setCurrentViewerIndex(index !== -1 ? index : 0);
    setPhotoViewerOpen(true);
  };

  /* ---------------- EFFECTS ---------------- */
  useEffect(() => {
    loadAttendance();
    loadSites();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (!photoViewerOpen) return;
        if (e.key === 'ArrowRight') {
            setCurrentViewerIndex(prev => (prev + 1) % currentViewerPhotos.length);
        } else if (e.key === 'ArrowLeft') {
            setCurrentViewerIndex(prev => (prev - 1 + currentViewerPhotos.length) % currentViewerPhotos.length);
        } else if (e.key === 'Escape') {
            setPhotoViewerOpen(false);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [photoViewerOpen, currentViewerPhotos]);

  /* ---------------- RENDER HELPERS ---------------- */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const filteredLogs = attendanceLogs.filter(log => {
    const matchesSearch = log.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          log.site.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDate = !dateFilter || log.checkInTime.startsWith(dateFilter);
    const matchesSite = !siteFilter || log.site === siteFilter;
    return matchesSearch && matchesDate && matchesSite;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-panel p-6 shadow-sm flex flex-col justify-between min-h-[150px] transition-all hover:border-gray-300 dark:hover:border-gray-700/50">
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/40">Monthly Presence</span>
          <div className="text-4xl font-bold text-foreground leading-none">
             {attendanceLogs.length}
          </div>
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary">All Logs</span>
        </div>

        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-panel p-6 shadow-sm flex flex-col justify-between min-h-[150px] transition-all hover:border-gray-300 dark:hover:border-gray-700/50">
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/40">Session Status</span>
          <div className="text-4xl font-bold text-foreground leading-none">
            {status.includes('checked-in') ? 'Active' : 'Idle'}
          </div>
          <span className={`text-[10px] uppercase tracking-[0.2em] font-bold ${status === 'checked-in' ? 'text-green-500' : 'text-muted-foreground/60'}`}>
            {status.replace('-', ' ')}
          </span>
        </div>

        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-panel p-6 shadow-sm flex flex-col justify-between min-h-[150px] transition-all hover:border-gray-300 dark:hover:border-gray-700/50">
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/40">Approved</span>
          <div className="text-4xl font-bold text-foreground leading-none">
            {attendanceLogs.filter(l => l.approvalStatus === 'approved').length}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-green-500 font-bold uppercase tracking-[0.2em]">
            <CheckCircle2 size={12} className="shrink-0" /> Verified
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-panel p-6 shadow-sm flex flex-col justify-between min-h-[150px] transition-all hover:border-gray-300 dark:hover:border-gray-700/50">
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/40">Not Approved</span>
          <div className="text-4xl font-bold text-foreground leading-none">
            {attendanceLogs.filter(l => l.approvalStatus !== 'approved').length}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-red-500 font-bold uppercase tracking-[0.2em]">
            <AlertCircle size={12} className="shrink-0" /> Pending / Rejected
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start xl:items-center xl:justify-between border-b border-gray-700 pb-4 mt-6">
        <h2 className="text-lg font-bold text-foreground uppercase tracking-wider hidden xl:block">
            ATTENDANCE ({(pmTab === "verify" ? pendingApprovals : filteredLogs).length})
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full xl:w-auto">
          {userRole === "ProjectManager" && (
            <div className="flex items-center gap-1 p-1 rounded-xl bg-surface border border-gray-700">
              <button 
                onClick={() => setPmTab("my-attendance")}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${pmTab === "my-attendance" ? "bg-background text-foreground shadow-sm" : "text-muted hover:text-foreground"}`}
              >
                My Log
              </button>
              <button 
                onClick={() => setPmTab("verify")}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${pmTab === "verify" ? "bg-background text-foreground shadow-sm" : "text-muted hover:text-foreground"}`}
              >
                Verification ({pendingApprovals.length})
              </button>
            </div>
          )}

          <div className="relative flex-1 min-w-[200px] max-w-sm w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <input 
              type="text" 
              placeholder="Search site or employee..."
              className="w-full rounded-lg border border-gray-700 bg-surface pl-10 pr-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto">
            <div className="flex items-center gap-1.5 text-xs text-muted pr-1">
                <Filter size={14} />
            </div>
            
            <div className="relative group">
              <Layers size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
              <select 
                className="rounded-lg border border-gray-700 bg-surface pl-9 pr-8 py-2 text-sm text-foreground focus:border-primary focus:outline-none appearance-none cursor-pointer flex-1 sm:flex-none max-w-[150px] truncate"
                value={siteFilter}
                onChange={(e) => setSiteFilter(e.target.value)}
              >
                <option value="">All Sites</option>
                {sites.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
            </div>

            <div className="flex items-center gap-2 bg-surface text-foreground border border-gray-700 rounded-lg px-3 py-2">
              <Calendar size={14} className="text-muted" />
              <input 
                type="date" 
                className="bg-transparent text-sm focus:outline-none uppercase"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
          </div>

        </div>
      </div>

      {/* Main Table Container */}
      <div className="overflow-x-auto rounded-xl border border-gray-700 bg-panel shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface text-muted border-b border-gray-700">
            <tr>
              <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest">Name</th>
              <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest">Site</th>
              <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest">Date</th>
              <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest">Check-In</th>
              <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest">Check-Out</th>
              <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest">Hours</th>
              <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {(pmTab === "verify" ? pendingApprovals : filteredLogs).map((log) => (
              <tr key={log._id} className="hover:bg-surface/50 transition-colors group">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                      {log.employeeName.charAt(0)}
                    </div>
                    <div>
                      <span className="block font-medium text-foreground">{log.employeeName}</span>
                      <span className="block text-[10px] text-muted font-bold uppercase tracking-widest mt-0.5">{log.role || 'Personnel'}</span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className="flex items-center gap-1.5 text-muted text-sm">
                      <MapPin size={13} className="shrink-0" />
                      {log.site}
                  </span>
                </td>
                <td className="px-4 py-4 text-muted">
                    {new Date(log.checkInTime).toLocaleDateString()}
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2 text-xs font-medium">
                    {log.inTimePhoto && (
                      <button 
                        onClick={() => openPhotoViewerFromRecord(log, 'in')}
                        className="relative group shrink-0"
                      >
                        <img src={log.inTimePhoto} alt="Check-In" className="w-8 h-8 rounded-full border border-primary/50 object-cover" />
                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Camera size={12} className="text-white" />
                        </div>
                      </button>
                    )}
                    <span className="text-green-500 flex items-center gap-1.5">
                      <Clock size={12} />
                      {new Date(log.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2 text-xs font-medium">
                    {log.outTimePhoto && (
                      <button 
                        onClick={() => openPhotoViewerFromRecord(log, 'out')}
                        className="relative group shrink-0"
                      >
                        <img src={log.outTimePhoto} alt="Check-Out" className="w-8 h-8 rounded-full border border-gray-500 object-cover" />
                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Camera size={12} className="text-white" />
                        </div>
                      </button>
                    )}
                    <span className={`${log.checkOutTime ? 'text-foreground' : 'text-blue-400 font-bold tracking-widest uppercase text-[10px]'} flex items-center gap-1.5`}>
                      {log.checkOutTime ? <Clock size={12} /> : null}
                      {log.checkOutTime ? new Date(log.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "ACTIVE"}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4 font-medium text-foreground">
                  {log.totalHours ? `${log.totalHours.toFixed(1)}h` : "—"}
                </td>
                <td className="px-4 py-4">
                  <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border border-zinc-200/50 bg-zinc-200 text-zinc-950`}>
                    {log.approvalStatus.charAt(0).toUpperCase() + log.approvalStatus.slice(1)}
                  </span>
                </td>
               <td className="px-4 py-4 text-right">
                  <div className="flex justify-end gap-2">
                      {pmTab === "verify" ? (
                          <button 
                              onClick={() => setSelectedRecord(log)}
                              className="p-2 hover:bg-primary/10 rounded-lg text-primary transition-colors border border-transparent hover:border-primary/20"
                          >
                              <ChevronRight className="w-5 h-5" />
                          </button>
                      ) : (
                        <>
                          <button 
                              onClick={() => log.approvalStatus !== 'approved' && handleDeleteAttendance(log._id)}
                              disabled={actionLoading || log.approvalStatus === 'approved'}
                              className={`p-2 rounded-lg transition-colors border border-transparent ${
                                log.approvalStatus === 'approved' 
                                  ? 'text-red-500/30 cursor-not-allowed' 
                                  : 'text-red-500 hover:bg-red-500/10 hover:border-red-500/20'
                              }`}
                          >
                              <Trash2 className="w-5 h-5" />
                          </button>
                        </>
                      )}
                  </div>
                </td>
              </tr>
            ))}
            {(pmTab === "verify" ? pendingApprovals : filteredLogs).length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-muted italic">
                  No attendance records found for this period.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    {/* Log Attendance Modal */}
    {isLogAttendanceOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
        <div className="bg-panel w-full max-w-lg rounded-2xl border border-gray-700 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="p-6 border-b border-gray-700 flex items-center justify-between bg-surface">
            <div>
              <h3 className="text-xl font-bold font-heading text-foreground uppercase tracking-tight">Transmission Entry</h3>
              <p className="text-[10px] text-muted font-bold tracking-widest uppercase mt-1">Logging as {employeeName} • {role}</p>
            </div>
            <button 
              onClick={() => {
                stopCamera();
                setIsLogAttendanceOpen(false);
                setIsCameraActive(false);
                setCapturedPhoto(null);
              }} 
              className="p-2 hover:bg-gray-700 rounded-full transition-colors text-muted"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Site Selection */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Site Assignment</label>
              <div className="relative group">
                <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-primary transition-colors" />
                <select 
                  className="w-full pl-10 pr-10 py-3 bg-surface border border-gray-700 rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-primary appearance-none disabled:opacity-50 tracking-widest uppercase"
                  value={selectedSite}
                  onChange={(e) => setSelectedSite(e.target.value)}
                  disabled={status === "checked-in"}
                >
                  <option value="">SCANNING LOCATIONS...</option>
                  {sites.map(s => <option key={s._id} value={s.name}>{s.name.toUpperCase()}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
              </div>
            </div>

            {/* Camera Section */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Visual Verification</label>
              <div className="relative aspect-video rounded-xl bg-black border border-gray-700 overflow-hidden group">
                {isCameraActive ? (
                  <>
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center pb-4">
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={handleCameraCapture}
                          className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all"
                        >
                          <div className="w-8 h-8 rounded-full border-2 border-black/10" />
                        </button>
                        <button 
                          onClick={toggleCamera}
                          className="h-10 w-10 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all flex items-center justify-center border border-white/10"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </>
                ) : capturedPhoto ? (
                  <div className="relative w-full h-full">
                    <img src={capturedPhoto} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/20" />
                    <button 
                      onClick={() => handleStartCamera()}
                      className="absolute top-4 right-4 bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white p-2 rounded-lg backdrop-blur-md transition-all border border-red-500/30"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-4 text-muted">
                    <Camera className="w-10 h-10 opacity-20" />
                    <button 
                      onClick={() => handleStartCamera()}
                      className="bg-surface hover:bg-gray-700 text-foreground border border-gray-700 px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all"
                    >
                      INITIALIZE BIOMETRICS
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Status Info */}
            <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 flex items-start gap-3">
              <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Geo-tagging Active</p>
                <p className="text-[9px] text-muted font-medium uppercase tracking-widest mt-0.5 leading-relaxed">Precision coordinates will be embedded in the transmission.</p>
              </div>
            </div>

            {/* Submit Buttons */}
            <button 
              onClick={() => handleAttendanceSubmit(status === "checked-in" ? "check-out" : "check-in")}
              disabled={actionLoading || !capturedPhoto || !selectedSite}
              className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase text-[10px] tracking-widest ${
                  status === "checked-in" 
                      ? "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white" 
                      : "bg-primary text-black shadow-lg shadow-primary/20 hover:bg-primary-hover"
              }`}
            >
              {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : (
                  <>
                      {status === "checked-in" ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      {status === "checked-in" ? "Finalize Session" : "Authorize Session"}
                  </>
              )}
            </button>
          </div>
        </div>
      </div>
    )}

      {/* Photo Viewer Carousel */}
      {photoViewerOpen && (
        <div className="fixed inset-0 z-[60] bg-black flex flex-col items-center justify-center p-6 backdrop-blur-3xl">
            <div className="absolute top-8 right-8 flex items-center gap-4">
                <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl backdrop-blur-md">
                    <p className="text-white text-[10px] font-black uppercase tracking-[0.2em]">{currentViewerIndex + 1} / {currentViewerPhotos.length} Proofs</p>
                </div>
                <button 
                    onClick={() => setPhotoViewerOpen(false)}
                    className="p-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl transition-all border border-white/10"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            <div className="relative w-full max-w-6xl h-full max-h-[75vh] flex items-center justify-center">
                <button 
                    onClick={() => setCurrentViewerIndex(prev => (prev - 1 + currentViewerPhotos.length) % currentViewerPhotos.length)}
                    className="absolute -left-4 md:-left-20 p-5 bg-white/5 hover:bg-white/10 text-white rounded-full transition-all z-10 border border-white/10 backdrop-blur-md"
                >
                    <ArrowLeft className="w-8 h-8 opacity-50 hover:opacity-100" />
                </button>

                <div className="w-full h-full relative group shadow-[0_0_100px_rgba(0,0,0,0.5)]">
                    <img 
                        src={currentViewerPhotos[currentViewerIndex].url}
                        className="w-full h-full object-contain rounded-[2rem]"
                        alt="Registry Evidence"
                    />
                    
                    {/* Floating Info Overlay */}
                    <div className="absolute bottom-10 left-10 right-10 p-8 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl animate-in slide-in-from-bottom-5 duration-300">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <h4 className="text-white text-xl font-serif font-bold uppercase tracking-tight flex items-center gap-3">
                                    {currentViewerPhotos[currentViewerIndex].type === 'in' ? <ArrowUpRight className="text-green-500 w-6 h-6" /> : <ArrowDownRight className="text-red-500 w-6 h-6" />}
                                    {currentViewerPhotos[currentViewerIndex].title}
                                </h4>
                                <div className="flex flex-wrap items-center gap-6 mt-4">
                                    <span className="flex items-center gap-3 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                                        <Clock className="w-4 h-4 text-primary" /> {currentViewerPhotos[currentViewerIndex].time}
                                    </span>
                                    <span className="flex items-center gap-3 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                                        <MapPin className="w-4 h-4 text-primary" /> {currentViewerPhotos[currentViewerIndex].location}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <a 
                                    href={currentViewerPhotos[currentViewerIndex].url} 
                                    target="_blank" 
                                    className="p-4 bg-primary text-black rounded-2xl transition-all hover:scale-105 shadow-accent"
                                >
                                    <Maximize2 className="w-5 h-5 font-black" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <button 
                    onClick={() => setCurrentViewerIndex(prev => (prev + 1) % currentViewerPhotos.length)}
                    className="absolute -right-4 md:-right-20 p-5 bg-white/5 hover:bg-white/10 text-white rounded-full transition-all z-10 border border-white/10 backdrop-blur-md"
                >
                    <ArrowRight className="w-8 h-8 opacity-50 hover:opacity-100" />
                </button>
            </div>
            
            <div className="mt-12 flex justify-center gap-4 overflow-x-auto p-4 w-full max-w-4xl no-scrollbar">
                {currentViewerPhotos.map((p, i) => (
                    <button 
                        key={`${p.id}-${p.type}`}
                        onClick={() => setCurrentViewerIndex(i)}
                        className={`relative h-20 w-32 rounded-2xl overflow-hidden flex-shrink-0 transition-all border-2 ${currentViewerIndex === i ? 'border-primary shadow-accent scale-110' : 'border-white/5 opacity-40 hover:opacity-100'}`}
                    >
                        <img src={p.url} className="w-full h-full object-cover" />
                        <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2 text-[8px] text-white font-black uppercase text-center tracking-widest">
                            {p.type === 'in' ? 'Check In' : 'Check Out'}
                        </div>
                    </button>
                ))}
            </div>
        </div>
      )}

      {/* Review Record Sidebar/Modal */}
      {selectedRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
              <div className="bg-panel w-full max-w-2xl rounded-2xl border border-gray-700 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                  <div className="p-6 border-b border-gray-700 flex items-center justify-between bg-surface">
                      <div>
                        <h3 className="text-xl font-bold font-heading text-foreground uppercase tracking-tight">Audit Proceeding</h3>
                        <p className="text-xs text-muted font-bold tracking-widest uppercase mt-1">Verifying Workforce Transmission</p>
                      </div>
                      <button onClick={() => setSelectedRecord(null)} className="p-2 hover:bg-gray-700 rounded-full transition-colors text-muted">
                        <X className="w-5 h-5" />
                      </button>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 gap-4">
                            <div className="p-4 bg-surface rounded-xl border border-gray-700 flex items-center justify-between">
                                <div>
                                   <p className="text-[10px] text-muted uppercase font-bold tracking-widest mb-1">Subject Member</p>
                                   <p className="text-sm font-bold text-foreground tracking-widest uppercase">{selectedRecord.employeeName}</p>
                                </div>
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                   {selectedRecord.employeeName.charAt(0)}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                               <div className="p-4 bg-surface rounded-xl border border-gray-700">
                                   <p className="text-[10px] text-muted uppercase font-bold tracking-widest mb-1">Assigned Unit</p>
                                   <p className="text-xs font-semibold text-foreground uppercase truncate">{selectedRecord.site}</p>
                               </div>
                               <div className="p-4 bg-surface rounded-xl border border-gray-700">
                                   <p className="text-[10px] text-muted uppercase font-bold tracking-widest mb-1">Registry Date</p>
                                   <p className="text-xs font-semibold text-foreground whitespace-nowrap">{new Date(selectedRecord.checkInTime).toLocaleDateString()}</p>
                               </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Audit Findings / Feedback</label>
                            <textarea 
                                className="w-full p-4 bg-surface border border-gray-700 rounded-xl text-sm text-foreground focus:outline-none focus:border-primary min-h-[100px] resize-none leading-relaxed"
                                placeholder="Enter verification notes..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-4 pt-2">
                            <button 
                                onClick={() => handleReviewAction(selectedRecord._id, 'reject')}
                                disabled={actionLoading}
                                className="flex-1 py-3 bg-red-500/10 text-red-500 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                            >
                                Decline
                            </button>
                            <button 
                                onClick={() => handleReviewAction(selectedRecord._id, 'approve')}
                                disabled={actionLoading}
                                className="flex-[2] py-3 bg-primary text-black rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-primary-hover transition-all shadow-lg shadow-primary/20"
                            >
                                {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin mx-auto" /> : "Authorize Entry"}
                            </button>
                        </div>
                      </div>

                      <div className="space-y-4">
                          <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Evidence Registry</p>
                          <div className="grid grid-cols-1 gap-4">
                              {selectedRecord.inTimePhoto && (
                                  <div className="relative group cursor-pointer overflow-hidden rounded-2xl border border-gray-700 shadow-xl aspect-video" onClick={() => openPhotoViewerFromRecord(selectedRecord, 'in')}>
                                      <img src={selectedRecord.inTimePhoto} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                                          <div className="bg-background/80 border border-white/10 px-4 py-1.5 rounded-lg text-[10px] font-bold text-white uppercase tracking-widest">
                                             Check In Proof
                                          </div>
                                      </div>
                                  </div>
                              )}
                              {selectedRecord.outTimePhoto && (
                                  <div className="relative group cursor-pointer overflow-hidden rounded-2xl border border-gray-700 shadow-xl aspect-video" onClick={() => openPhotoViewerFromRecord(selectedRecord, 'out')}>
                                      <img src={selectedRecord.outTimePhoto} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                                          <div className="bg-background/80 border border-white/10 px-4 py-1.5 rounded-lg text-[10px] font-bold text-white uppercase tracking-widest">
                                             Check Out Proof
                                          </div>
                                      </div>
                                  </div>
                              )}
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}