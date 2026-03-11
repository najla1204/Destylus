"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, MapPin, Users, Package, Calendar, HardHat, FileText, Plus, X, AlertTriangle, IndianRupee, Phone, UserCheck, Wallet, ArrowUpRight, ArrowDownRight, ChevronDown, ChevronRight, Clock, Filter, Check, Trash2, Camera, CheckCircle, XCircle } from "lucide-react";
import { useEffect, useState, use, useRef, Fragment } from "react";
import { useRouter } from "next/navigation";

// --- Types ---
interface SiteData {
    _id: string;
    name: string;
    locationName: string;
    locationLink: string;
    status: "Active" | "Completed" | "Planning" | "Pending";
    budget: number;
    managers: string[];
    engineers: string[];
    labourCount: number;
    materialCount: number;
    issueCount: number;
}

interface Labour {
    _id: string;
    name: string;
    mobile?: string;
    workerType: string;
    createdAt: string;
}

interface LabourEntry {
    workerType: string;
    count: number | string;
    photo?: string;
    name?: string;
    notes?: string;
    addNamesToggle?: boolean;
    individuals?: { name: string; photo: string; notes?: string }[];
}

interface AggregateLabourLog {
    _id: string;
    date: string;
    skilledCount: number;
    unskilledCount: number;
    supervisorCount: number;
    entries: LabourEntry[];
    totalCount: number;
    loggedBy: string;
    notes?: string;
    createdAt: string;
}

interface Material {
    _id: string;
    item: string;
    quantity: number;
    unit: string;
    photo?: string;
    lorryNo?: string;
    lorryMeasurements?: string;
    status: 'Pending' | 'Approved';
    addedBy?: string;
    createdAt: string;
    updatedAt: string;
}

interface Issue {
    _id: string;
    title: string;
    description?: string;
    status: "Open" | "In Progress" | "Resolved";
    priority: "Low" | "Medium" | "High" | "Critical";
    raisedBy?: string;
    createdAt: string;
    sentTo?: string[];
}

interface PettyCashTransaction {
    _id: string;
    title: string;
    amount: number;
    type: "Allocation" | "Expense";
    loggedBy: string;
    date: string;
}

interface PettyCashSummary {
    allocated: number;
    spent: number;
    balance: number;
}

interface StockRefundRequest {
    _id: string;
    materialName: string;
    quantity: number;
    unit: string;
    reason: string;
    requestedBy: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    createdAt: string;
}

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
    location?: {
        latitude: number;
        longitude: number;
        address?: string;
    };
    totalHours?: number;
}

export default function SiteDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const siteId = resolvedParams.id;

    const [site, setSite] = useState<SiteData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"Labour Attendance" | "Materials" | "Issues" | "Petty Cash" | "Staff Attendance" | "Report">("Labour Attendance");
    const [materialsSubTab, setMaterialsSubTab] = useState<"Available" | "Refunds">("Available");
    const [reportSubTab, setReportSubTab] = useState<"Labour" | "Material" | "Petty Cash">("Labour");
    const [userRole, setUserRole] = useState<string>("");
    const [userName, setUserName] = useState<string>("");

    // Report States
    const [reportFromDate, setReportFromDate] = useState(() => {
        const d = new Date(); d.setDate(d.getDate() - 7);
        return d.toISOString().split('T')[0];
    });
    const [reportToDate, setReportToDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [reportRates, setReportRates] = useState<Record<string, number>>({});

    // Data States
    const [labours, setLabours] = useState<Labour[]>([]);
    const [aggregateLabourLogs, setAggregateLabourLogs] = useState<AggregateLabourLog[]>([]);
    const [materials, setMaterials] = useState<Material[]>([]);
    const [refundRequests, setRefundRequests] = useState<StockRefundRequest[]>([]);
    const [issues, setIssues] = useState<Issue[]>([]);
    const [pettyCashTransactions, setPettyCashTransactions] = useState<PettyCashTransaction[]>([]);
    const [pettyCashSummary, setPettyCashSummary] = useState<PettyCashSummary | null>(null);
    const [tabLoading, setTabLoading] = useState(false);

    // Attendance states
    const [engineerAttendance, setEngineerAttendance] = useState<AttendanceRecord[]>([]);
    const [labourAttendance, setLabourAttendance] = useState<AttendanceRecord[]>([]);
    const [attendanceFromDate, setAttendanceFromDate] = useState(() => {
        const d = new Date(); d.setDate(d.getDate() - 7);
        return d.toISOString().split('T')[0];
    });
    const [attendanceToDate, setAttendanceToDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [expandedEngineerId, setExpandedEngineerId] = useState<string | null>(null);
    const [expandedLabourLogId, setExpandedLabourLogId] = useState<string | null>(null);

    // Get current user's check-in status
    const userStr = typeof window !== 'undefined' ? localStorage.getItem("user") : null;
    const user = userStr ? JSON.parse(userStr) : null;
    const myUserId = user?.employeeId || user?.id || user?._id || user?.email || (typeof window !== 'undefined' ? localStorage.getItem('userId') || userName : userName);
    const myLatestRecord = engineerAttendance.find(a => a.employeeId === myUserId || a.employeeName === userName);
    const isCurrentlyCheckedIn = myLatestRecord && !myLatestRecord.checkOutTime;
    const todayStr = new Date().toISOString().split('T')[0];
    const hasLoggedInToday = engineerAttendance.some(a => 
        (a.employeeId === myUserId || a.employeeName === userName) && 
        a.checkInTime.startsWith(todayStr)
    );
    const [todayLabourAttendance, setTodayLabourAttendance] = useState<AttendanceRecord[]>([]);
    const [attendanceStatusFilter, setAttendanceStatusFilter] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');

    // Camera States
    const [isLogAttendanceOpen, setIsLogAttendanceOpen] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [cameraError, setCameraError] = useState("");
    const [isSubmittingAttendance, setIsSubmittingAttendance] = useState(false);

    // Photo Viewer States
    const [photoViewerOpen, setPhotoViewerOpen] = useState(false);
    const [currentViewerPhotos, setCurrentViewerPhotos] = useState<{url: string, title: string, time: string, location: string, id: string, type: string}[]>([]);
    const [currentViewerIndex, setCurrentViewerIndex] = useState(0);

    // Camera Modes
    const [cameraFacingMode, setCameraFacingMode] = useState<"user" | "environment">("user");

    // Modal States
    const [isAddLabourOpen, setIsAddLabourOpen] = useState(false);
    const [isAddMaterialOpen, setIsAddMaterialOpen] = useState(false);
    const [isRequestRefundOpen, setIsRequestRefundOpen] = useState(false);
    const [isAllocatePettyCashOpen, setIsAllocatePettyCashOpen] = useState(false);
    const [isLogPettyCashExpenseOpen, setIsLogPettyCashExpenseOpen] = useState(false);
    const [isReportIssueOpen, setIsReportIssueOpen] = useState(false);

    // Form States
    const [newLabour, setNewLabour] = useState({ name: "", mobile: "", workerType: "" });
    const [newAggregate, setNewAggregate] = useState<{ date: string; notes: string; entries: LabourEntry[] }>({ 
        date: new Date().toISOString().split('T')[0], 
        entries: [{ workerType: "", count: "", individuals: [], addNamesToggle: false, notes: "" }],
        notes: "" 
    });
    const [newMaterial, setNewMaterial] = useState<{
        item: string; 
        quantity: string; 
        unit: string;
        photo?: string;
        lorryNo?: string;
        lorryMeasurements?: string;
    }>({ item: "", quantity: "", unit: "Nos" });
    const [newRefundRequest, setNewRefundRequest] = useState({ materialName: "", quantity: "", unit: "Nos", reason: "" });
    const [newPettyCash, setNewPettyCash] = useState({ title: "", amount: "" });
    const [newIssue, setNewIssue] = useState({ title: "", description: "", priority: "Medium" as "Low" | "Medium" | "High" | "Critical", sentTo: [] as string[] });

    // Fetch user data from localStorage
    useEffect(() => {
        const userStr = localStorage.getItem("user");
        const user = userStr ? JSON.parse(userStr) : null;
        
        const role = user?.role || localStorage.getItem("userRole") || "";
        const name = user?.name || localStorage.getItem("userName") || "";
        
        // Map role to display format if needed
        const roleMap: Record<string, string> = {
            'project_manager': 'Project Manager',
            'engineer': 'Site Engineer',
            'hr': 'HR Manager'
        };
        
        setUserRole(roleMap[role] || role);
        setUserName(name);
    }, []);

    const isSiteEngineer = userRole === "Engineer" || userRole === "engineer" || userRole === "site_engineer" || userRole === "Site Engineer";
    const isProjectManager = userRole === "Project Manager" || userRole === "project_manager";
    const isHRManager = userRole === "HR Manager" || userRole === "hr";

    // Fetch site data
    useEffect(() => {
        const fetchSite = async () => {
            try {
                const res = await fetch(`/api/sites/${siteId}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data && data._id) {
                        setSite(data);
                        setLoading(false);
                        return;
                    }
                }
            } catch (err) {
                console.error("Failed to fetch site from API:", err);
            }
            
            // Fallback: try localStorage
            try {
                const savedSites = localStorage.getItem("destylus_dashboard_sites_v4");
                if (savedSites) {
                    const parsed = JSON.parse(savedSites);
                    const found = parsed.find((s: any) => s._id === siteId || s.id === siteId);
                    if (found) {
                        setSite({
                            _id: found._id || found.id,
                            name: found.name,
                            locationName: found.locationName || '',
                            locationLink: found.locationLink || '',
                            status: found.status || 'Active',
                            budget: found.budget || 0,
                            managers: found.managers || [],
                            engineers: found.engineers || [],
                            labourCount: 0,
                            materialCount: 0,
                            issueCount: 0
                        });
                        setLoading(false);
                        return;
                    }
                }
            } catch (lsErr) {
                console.error("Failed localStorage fallback:", lsErr);
            }
            
            setLoading(false);
        };
        fetchSite();
    }, [siteId, router]);

    // Fetch tab data when tab changes
    useEffect(() => {
        const fetchTabData = async () => {
            setTabLoading(true);
            try {
                if (activeTab === "Labour Attendance") {
                    // Fetch aggregate logs
                    const aggRes = await fetch(`/api/sites/${siteId}/labours?type=aggregate`);
                    const aggData = await aggRes.json();
                    setAggregateLabourLogs(aggData);
                    // Also fetch individual labours for backward compatibility
                    const res = await fetch(`/api/sites/${siteId}/labours`);
                    const data = await res.json();
                    setLabours(data);
                } else if (activeTab === "Report") {
                    // Fetch aggregate logs for report
                    const aggRes = await fetch(`/api/sites/${siteId}/labours?type=aggregate`);
                    const aggData = await aggRes.json();
                    setAggregateLabourLogs(aggData);
                    
                    // Fetch materials for material report
                    const res = await fetch(`/api/sites/${siteId}/materials`);
                    const data = await res.json();
                    setMaterials(data);
                } else if (activeTab === "Materials") {
                    const res = await fetch(`/api/sites/${siteId}/materials`);
                    const data = await res.json();
                    setMaterials(data);
                    
                    // Also fetch refund requests
                    const refRes = await fetch(`/api/sites/${siteId}/stock-refund-requests`);
                    if (refRes.ok) {
                        const refData = await refRes.json();
                        setRefundRequests(refData);
                    }
                } else if (activeTab === "Issues") {
                    const res = await fetch(`/api/sites/${siteId}/issues`);
                    const data = await res.json();
                    setIssues(data);
                } else if (activeTab === "Petty Cash") {
                    const res = await fetch(`/api/sites/${siteId}/petty-cash`);
                    const data = await res.json();
                    if (data.transactions) setPettyCashTransactions(data.transactions);
                    if (data.summary) setPettyCashSummary(data.summary);
                } else if (activeTab === "Staff Attendance") {
                    // Always try to fetch from API, but be aware it might fail if the endpoint isn't fully set up yet.
                    const res = await fetch(`/api/sites/${siteId}/attendance`);
                    if (res.ok) {
                        const data = await res.json();
                        setEngineerAttendance(data.engineerRecords || []);
                        setLabourAttendance(data.labourRecords || []);
                        
                        // Set today's labour attendance
                        const today = new Date().toISOString().split('T')[0];
                        const todayRecords = (data.labourRecords || []).filter((r: any) => 
                            r.checkInTime.startsWith(today)
                        );
                        setTodayLabourAttendance(todayRecords);
                    }
                }
            } catch (err) {
                console.error(`Failed to fetch tab data for ${activeTab}:`, err);
            } finally {
                setTabLoading(false);
            }
        };

        if (siteId) {
            fetchTabData();
        }
    }, [activeTab, siteId, materialsSubTab]); // added materialsSubTab to re-fetch if needed

    // Photo Viewer Keyboard Navigation
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

    // Submit handlers
    const handlePhotoUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const updatedEntries = [...newAggregate.entries];
                updatedEntries[index].photo = reader.result as string;
                setNewAggregate({ ...newAggregate, entries: updatedEntries });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleMaterialPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewMaterial(prev => ({ ...prev, photo: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleIndividualPhotoUpload = async (entryIndex: number, indIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            updateEntry(entryIndex, 'individuals_photo', { indIndex, val: reader.result as string });
        };
        reader.readAsDataURL(file);
    };

    const addEntry = () => {
        setNewAggregate({
            ...newAggregate,
            entries: [...newAggregate.entries, { workerType: "", count: "", individuals: [], addNamesToggle: false }]
        });
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
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: mode } });
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
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL("image/jpeg");
            setCapturedPhoto(dataUrl);
            stopCamera();
        }
    };

    const closeAttendanceModal = () => {
        stopCamera();
        setIsLogAttendanceOpen(false);
        setCapturedPhoto(null);
        setCameraError("");
        setIsCameraActive(false);
    };

    const submitAttendance = async (action: 'check-in' | 'check-out') => {
        if (!capturedPhoto) {
            alert("Please capture a photo first.");
            return;
        }
        setIsSubmittingAttendance(true);
        try {
            // Setup geolocation
            let locationData = { latitude: 0, longitude: 0, address: "Unknown" };
            try {
                const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
                });
                locationData = {
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude,
                    address: `Lat: ${pos.coords.latitude.toFixed(4)}, Lng: ${pos.coords.longitude.toFixed(4)}`
                };
            } catch (geoErr) {
                console.warn("Geolocation failed, using default");
            }

            // Upload photo to Cloudinary
            let photoUrl = capturedPhoto; 
            const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
            const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

            if (cloudName && uploadPreset) {
                const formData = new FormData();
                formData.append("file", capturedPhoto);
                formData.append("upload_preset", uploadPreset);

                const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                    method: "POST",
                    body: formData,
                });
                if (uploadRes.ok) {
                    const uploadData = await uploadRes.json();
                    photoUrl = uploadData.secure_url;
                }
            }

            // Call API
            const userStr = localStorage.getItem("user");
            const user = userStr ? JSON.parse(userStr) : null;
            const employeeId = user?.employeeId || user?.id || user?._id || user?.email || localStorage.getItem('userId') || userName;

            const res = await fetch('/api/attendance', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action,
                    employeeName: userName,
                    employeeId, 
                    role: userRole,
                    site: site?.name || siteId,
                    photoUrl,
                    location: locationData
                })
            });

            if (res.ok) {
                const data = await res.json();
                if (action === 'check-in') {
                    setEngineerAttendance([data.attendance, ...engineerAttendance]);
                } else {
                    setEngineerAttendance(engineerAttendance.map(a => a._id === data.attendance._id ? data.attendance : a));
                }
                closeAttendanceModal();
            } else {
                const errData = await res.json();
                alert(`Error: ${errData.error}`);
            }

        } catch (err) {
            console.error("Attendance submit failed", err);
            alert("Failed to submit attendance.");
        } finally {
            setIsSubmittingAttendance(false);
        }
    };
    const handleDeleteAttendance = async (id: string) => {
        if (!confirm("Are you sure you want to delete this attendance record? This action cannot be undone.")) return;

        setIsSubmittingAttendance(true);
        try {
            const res = await fetch(`/api/attendance/${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                setEngineerAttendance(engineerAttendance.filter(a => a._id !== id));
            } else {
                const err = await res.json();
                alert(err.error || 'Failed to delete attendance record');
            }
        } catch (err) {
            console.error("Delete action error:", err);
            alert("An error occurred while deleting the record.");
        } finally {
            setIsSubmittingAttendance(false);
        }
    };

    const handleConfirmAttendance = async (id: string, action: 'approve' | 'reject') => {
        if (action === 'reject' && !confirm("Are you sure you want to reject this attendance record?")) return;
        setIsSubmittingAttendance(true);
        try {
            const res = await fetch(`/api/attendance/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: action })
            });
            if (res.ok) {
                const updated = await res.json();
                setEngineerAttendance(prev => prev.map(a => a._id === id ? { ...a, approvalStatus: action === 'approve' ? 'approved' : 'rejected' } : a));
            } else {
                const err = await res.json();
                alert(err.error || `Failed to ${action} attendance`);
            }
        } catch (err) {
            console.error(`Attendance ${action} error:`, err);
        } finally {
            setIsSubmittingAttendance(false);
        }
    };

    const openPhotoViewer = (recordId: string, type: 'in' | 'out', records: AttendanceRecord[]) => {
        const photos: {url: string, title: string, time: string, location: string, id: string, type: string}[] = [];
        // Extract all photos from currently filtered engineers
        records.forEach((r: AttendanceRecord) => {
            if (r.inTimePhoto) {
                photos.push({ 
                    url: r.inTimePhoto, 
                    title: `${r.employeeName} - Check In`, 
                    time: new Date(r.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    location: r.location?.address || 'Geolocation Recorded',
                    id: r._id, 
                    type: 'in' 
                });
            }
            if (r.outTimePhoto && r.checkOutTime) {
                photos.push({ 
                    url: r.outTimePhoto, 
                    title: `${r.employeeName} - Check Out`, 
                    time: new Date(r.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    location: r.location?.address || 'Geolocation Recorded',
                    id: r._id, 
                    type: 'out' 
                });
            }
        });
        
        setCurrentViewerPhotos(photos);
        const index = photos.findIndex(p => p.id === recordId && p.type === type);
        setCurrentViewerIndex(index !== -1 ? index : 0);
        setPhotoViewerOpen(true);
    };

    const openLabourPhotosViewer = (logId: string) => {
        const log = aggregateLabourLogs.find(l => l._id === logId);
        if (!log || !log.entries) return;

        const photos: {url: string, title: string, time: string, location: string, id: string, type: string}[] = [];
        log.entries.forEach((entry, idx) => {
            if (entry.photo) {
                photos.push({
                    url: entry.photo,
                    title: `${entry.name || entry.workerType} Profile`,
                    time: `Count: ${entry.count}`,
                    location: `Logged By: ${log.loggedBy}`,
                    id: `${logId}-${idx}`,
                    type: 'in' // default to 'in' icon (ArrowDownRight) to match design
                });
            }
        });

        if (photos.length > 0) {
            setCurrentViewerPhotos(photos);
            setCurrentViewerIndex(0);
            setPhotoViewerOpen(true);
        }
    };

    const removeEntry = (index: number) => {
        if (newAggregate.entries.length <= 1) return;
        const updatedEntries = [...newAggregate.entries];
        updatedEntries.splice(index, 1);
        setNewAggregate({ ...newAggregate, entries: updatedEntries });
    };

    const updateEntry = (index: number, field: string, value: any) => {
        setNewAggregate(prev => {
            const newEntries = [...prev.entries];
            if (field === 'individuals_name' || field === 'individuals_photo' || field === 'individuals_notes') {
                const { indIndex, val } = value;
                const fieldName = field.split('_')[1];
                const newInds = [...(newEntries[index].individuals || [])];
                newInds[indIndex] = { ...newInds[indIndex], [fieldName]: val };
                newEntries[index].individuals = newInds;
            } else {
                newEntries[index] = { ...newEntries[index], [field]: value };
                if (field === 'count') {
                    const countNum = Number(value) || 0;
                    let inds = newEntries[index].individuals || [];
                    if (inds.length < countNum) {
                        const toAdd = countNum - inds.length;
                        inds = [...inds, ...Array(toAdd).fill({ name: "", photo: "", notes: "" })];
                    } else if (inds.length > countNum) {
                        inds = inds.slice(0, countNum);
                    }
                    newEntries[index].individuals = inds;
                }
            }
            return { ...prev, entries: newEntries };
        });
    };

    const handleAddLabour = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const userName = localStorage.getItem("userName") || "Site Engineer";
            const finalEntries: any[] = [];
            
            const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
            const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

            for (const entry of newAggregate.entries) {
                const countNum = Number(entry.count) || 0;
                
                // Upload entry-level photo if exists
                let entryPhotoUrl = entry.photo;
                if (entryPhotoUrl && entryPhotoUrl.startsWith('data:image') && cloudName && uploadPreset) {
                    const formData = new FormData();
                    formData.append("file", entryPhotoUrl);
                    formData.append("upload_preset", uploadPreset);
                    const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                        method: "POST",
                        body: formData,
                    });
                    if (uploadRes.ok) {
                        const uploadData = await uploadRes.json();
                        entryPhotoUrl = uploadData.secure_url;
                    }
                }

                if (entry.addNamesToggle && entry.individuals && entry.individuals.length > 0) {
                    const processedIndividuals = [];
                    for (const ind of entry.individuals) {
                        let indPhotoUrl = ind.photo;
                        // Upload individual photo if exists
                        if (indPhotoUrl && indPhotoUrl.startsWith('data:image') && cloudName && uploadPreset) {
                            const formData = new FormData();
                            formData.append("file", indPhotoUrl);
                            formData.append("upload_preset", uploadPreset);
                            const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                                method: "POST",
                                body: formData,
                            });
                            if (uploadRes.ok) {
                                const uploadData = await uploadRes.json();
                                indPhotoUrl = uploadData.secure_url;
                            }
                        }
                        processedIndividuals.push({
                            workerType: entry.workerType,
                            count: 1,
                            name: ind.name,
                            photo: indPhotoUrl,
                            notes: ind.notes
                        });
                    }
                    finalEntries.push(...processedIndividuals);
                } else {
                    finalEntries.push({
                        workerType: entry.workerType,
                        count: countNum,
                        name: entry.name,
                        photo: entryPhotoUrl,
                        notes: entry.notes
                    });
                }
            }

            const res = await fetch(`/api/sites/${siteId}/labours`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: 'aggregate',
                    date: newAggregate.date,
                    entries: finalEntries,
                    loggedBy: userName,
                    notes: newAggregate.notes
                })
            });
            if (res.ok) {
                const created = await res.json();
                setAggregateLabourLogs(prev => [created, ...prev]);
                setSite(prev => prev ? { ...prev, labourCount: prev.labourCount + created.totalCount } : prev);
                setIsAddLabourOpen(false);
                setNewAggregate({ 
                    date: new Date().toISOString().split('T')[0], 
                    entries: [{ workerType: "", count: "", individuals: [], addNamesToggle: false, notes: "" }],
                    notes: "" 
                });
            }
        } catch (err) {
            console.error("Failed to log labour attendance:", err);
        }
    };

    const handleDeleteLabourLog = async (logId: string) => {
        if (!confirm("Are you sure you want to delete this labour log?")) return;
        try {
            const res = await fetch(`/api/aggregate-labour/${logId}`, { method: "DELETE" });
            if (res.ok) {
                setAggregateLabourLogs(prev => prev.filter(l => l._id !== logId));
            }
        } catch (err) {
            console.error("Failed to delete labour log:", err);
        }
    };

    const handleAddMaterial = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const name = localStorage.getItem("userName") || (isProjectManager ? "Project Manager" : "Engineer");
            
            // Upload to Cloudinary
            let finalPhotoUrl = newMaterial.photo;
            const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
            const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

            if (finalPhotoUrl && finalPhotoUrl.startsWith('data:image') && cloudName && uploadPreset) {
                const formData = new FormData();
                formData.append("file", finalPhotoUrl);
                formData.append("upload_preset", uploadPreset);
                const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                    method: "POST",
                    body: formData,
                });
                if (uploadRes.ok) {
                    const uploadData = await uploadRes.json();
                    finalPhotoUrl = uploadData.secure_url;
                }
            }

            const res = await fetch(`/api/sites/${siteId}/materials`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    item: newMaterial.item,
                    quantity: Number(newMaterial.quantity),
                    unit: newMaterial.unit,
                    photo: finalPhotoUrl,
                    lorryNo: newMaterial.lorryNo || "",
                    lorryMeasurements: newMaterial.lorryMeasurements || "",
                    status: 'Approved',
                    addedBy: name,
                    approvedBy: name,
                    approvedAt: new Date().toISOString()
                })
            });
            if (res.ok) {
                const created = await res.json();
                setMaterials(prev => [created, ...prev]);
                setSite(prev => prev ? { ...prev, materialCount: prev.materialCount + 1 } : prev);
                setIsAddMaterialOpen(false);
                setNewMaterial({ item: "", quantity: "", unit: "Nos", photo: "", lorryNo: "", lorryMeasurements: "" });
            }
        } catch (err) {
            console.error("Failed to add material:", err);
        }
    };

    const handleDeleteIssue = async (issueId: string) => {
        if (!confirm("Are you sure you want to delete this issue?")) return;
        try {
            const res = await fetch(`/api/issues/${issueId}`, {
                method: "DELETE"
            });
            if (res.ok) {
                setIssues(prev => prev.filter(i => i._id !== issueId));
                setSite(prev => prev ? { ...prev, issueCount: prev.issueCount - 1 } : prev);
            }
        } catch (err) {
            console.error("Failed to delete issue:", err);
        }
    };

    const handleApproveMaterial = async (materialId: string) => {
        try {
            const userName = localStorage.getItem("userName") || "Project Manager";
            const res = await fetch(`/api/materials/${materialId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status: 'Approved',
                    approvedBy: userName,
                    approvedAt: new Date().toISOString()
                })
            });
            if (res.ok) {
                const updated = await res.json();
                setMaterials(prev => prev.map(m => m._id === materialId ? updated : m));
            }
        } catch (err) {
            console.error("Failed to approve material:", err);
        }
    };

    const handleDeleteMaterial = async (materialId: string) => {
        if (!confirm("Are you sure you want to delete this material request?")) return;
        try {
            const res = await fetch(`/api/materials/${materialId}`, {
                method: "DELETE"
            });
            if (res.ok) {
                setMaterials(prev => prev.filter(m => m._id !== materialId));
                setSite(prev => prev ? { ...prev, materialCount: prev.materialCount - 1 } : prev);
            }
        } catch (err) {
            console.error("Failed to delete material:", err);
        }
    };

    const handleRequestRefund = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`/api/sites/${siteId}/stock-refund-requests`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...newRefundRequest,
                    quantity: Number(newRefundRequest.quantity),
                    requestedBy: localStorage.getItem("userName") || "Engineer"
                })
            });
            if (res.ok) {
                const created = await res.json();
                setRefundRequests(prev => [created, ...prev]);
                setIsRequestRefundOpen(false);
                setNewRefundRequest({ materialName: "", quantity: "", unit: "Nos", reason: "" });
            }
        } catch (err) {
            console.error("Failed to request refund:", err);
        }
    };

    const handlePettyCashSubmit = async (e: React.FormEvent, type: "Allocation" | "Expense") => {
        e.preventDefault();
        
        const amount = Number(newPettyCash.amount);
        
        // Safety check for expenses
        if (type === "Expense" && pettyCashSummary && amount > pettyCashSummary.balance) {
            alert(`Insufficient funds! Current balance is ₹${pettyCashSummary.balance.toLocaleString('en-IN')}. Please log an expense within the allocated amount.`);
            return;
        }

        try {
            const userName = localStorage.getItem("userName") || "User";
            const res = await fetch(`/api/sites/${siteId}/petty-cash`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: newPettyCash.title,
                    amount: amount,
                    type,
                    loggedBy: userName
                })
            });
            if (res.ok) {
                const created = await res.json();
                setPettyCashTransactions(prev => [created, ...prev]);
                
                // Update summary locally to avoid immediate refetch
                setPettyCashSummary(prev => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        allocated: type === "Allocation" ? prev.allocated + created.amount : prev.allocated,
                        spent: type === "Expense" ? prev.spent + created.amount : prev.spent,
                        balance: type === "Allocation" ? prev.balance + created.amount : prev.balance - created.amount
                    };
                });

                if (type === "Allocation") {
                    setSite(prev => prev ? { ...prev, budget: prev.budget + created.amount } : prev);
                }
                
                setIsAllocatePettyCashOpen(false);
                setIsLogPettyCashExpenseOpen(false);
                setNewPettyCash({ title: "", amount: "" });
            }
        } catch (err) {
            console.error(`Failed to log petty cash ${type.toLowerCase()}:`, err);
        }
    };

    const handleReportIssue = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const userName = localStorage.getItem("userName") || "User";
            const res = await fetch(`/api/sites/${siteId}/issues`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...newIssue,
                    raisedBy: userName,
                    raisedByRole: userRole
                })
            });
            if (res.ok) {
                const created = await res.json();
                setIssues(prev => [created, ...prev]);
                setSite(prev => prev ? { ...prev, issueCount: prev.issueCount + 1 } : prev);
                setIsReportIssueOpen(false);
                setNewIssue({ title: "", description: "", priority: "Medium", sentTo: [] });
            }
        } catch (err) {
            console.error("Failed to report issue:", err);
        }
    };

    const handleRefundAction = async (requestId: string, status: string) => {
        try {
            const userName = localStorage.getItem("userName") || "Project Manager";
            const res = await fetch(`/api/sites/${siteId}/stock-refund-requests/${requestId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status, reviewedBy: userName })
            });
            if (res.ok) {
                const updated = await res.json();
                setRefundRequests(prev => prev.map(r => r._id === requestId ? updated : r));
            }
        } catch (err) {
            console.error("Failed to update refund request status:", err);
        }
    };

    const handleUpdateIssueStatus = async (issueId: string, status: string) => {
        try {
            const res = await fetch(`/api/issues/${issueId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status })
            });
            if (res.ok) {
                const updated = await res.json();
                setIssues(prev => prev.map(i => i._id === issueId ? updated : i));
            }
        } catch (err) {
            console.error("Failed to update issue status:", err);
        }
    };

    if (loading) {
        return (
            <div className="p-8 text-center">
                <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-muted mt-4 text-sm">Loading Site Details...</p>
            </div>
        );
    }

    if (!site) {
        return <div className="p-8 text-center text-muted">Site not found.</div>;
    }

    return (
        <div className="space-y-6">
            {/* Back & Header */}
            {/* Navigation & Status */}
            <div className="flex items-center justify-between gap-4">
                <Link href="/sites" className="flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors w-fit group">
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Sites
                </Link>
            </div>



            {/* Sub-Navigation Tabs */}
            <div className="flex items-center gap-2 mt-4 overflow-x-auto py-2">
                {(["Labour Attendance", "Materials", "Issues", "Petty Cash", "Staff Attendance", "Report"] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-5 py-2.5 font-bold text-[11px] uppercase tracking-widest transition-all whitespace-nowrap rounded-full ${
                            activeTab === tab
                            ? "bg-[#1A1D24] text-primary"
                            : "text-muted hover:text-foreground hover:bg-white/[0.02]"
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Tab Loading */}
            {tabLoading && (
                <div className="flex justify-center py-8">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

            {/* TAB: LABOUR ATTENDANCE */}
            {!tabLoading && activeTab === "Labour Attendance" && (
                <div className="flex flex-col gap-4">
                    {/* Aggregate Summary Cards */}
                    {(() => {
                        const totalWorkers = aggregateLabourLogs.reduce((s, l) => s + l.skilledCount + l.unskilledCount, 0);
                        const totalSupervisors = aggregateLabourLogs.reduce((s, l) => s + l.supervisorCount, 0);
                        return (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                                <div className="rounded-2xl border border-gray-800 bg-[#0B0D11] p-6 shadow-sm flex flex-col justify-between min-h-[150px] transition-all hover:border-gray-700/50">
                                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/40">Total Entries</span>
                                    <div className="text-4xl font-bold text-white leading-none">{aggregateLabourLogs.length}</div>
                                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary">All Logs</span>
                                </div>
                                <div className="rounded-2xl border border-gray-800 bg-[#0B0D11] p-6 shadow-sm flex flex-col justify-between min-h-[150px] transition-all hover:border-gray-700/50">
                                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/40">Workers</span>
                                    <div className="text-4xl font-bold text-white leading-none">{totalWorkers}</div>
                                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-blue-500">Total Workers</span>
                                </div>
                                <div className="rounded-2xl border border-gray-800 bg-[#0B0D11] p-6 shadow-sm flex flex-col justify-between min-h-[150px] transition-all hover:border-gray-700/50">
                                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/40">Supervisors</span>
                                    <div className="text-4xl font-bold text-white leading-none">{totalSupervisors}</div>
                                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary">Total Supervisors</span>
                                </div>
                            </div>
                        );
                    })()}

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-8 mb-4">
                        <h2 className="text-lg font-bold text-foreground uppercase tracking-wider">LABOUR LOGS ({aggregateLabourLogs.length})</h2>
                        {(isSiteEngineer || isProjectManager) && (
                            <div className="relative group mt-3 sm:mt-0">
                                <button
                                    onClick={() => isCurrentlyCheckedIn && setIsAddLabourOpen(true)}
                                    disabled={!isCurrentlyCheckedIn}
                                    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors shadow-sm ${
                                        isCurrentlyCheckedIn 
                                            ? "bg-primary text-black hover:bg-primary-hover" 
                                            : "bg-surface border border-gray-700 text-muted cursor-not-allowed"
                                    }`}
                                >
                                    <Plus size={16} /> Log Labour Attendance
                                </button>
                                {!isCurrentlyCheckedIn && (
                                    <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 hidden group-hover:block bg-black text-xs text-white px-3 py-2 rounded shadow-lg whitespace-nowrap z-50 border border-gray-700">
                                        You must be checked in (and not checked out)<br/>first before logging labours.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Attendance Log Table */}
                    <div className="overflow-x-auto rounded-xl border border-gray-700 bg-panel shadow-sm mt-2">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-surface text-muted border-b border-gray-700">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest">Date</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest text-center">Workers</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest text-center">Supervisor</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest text-center">Total</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest">Logged By</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest">Notes</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {aggregateLabourLogs.length === 0 ? (
                                    <tr><td colSpan={7} className="px-6 py-8 text-center text-muted">No labour attendance logged for this site yet.</td></tr>
                                ) : (
                                    aggregateLabourLogs.map((log) => (
                                        <Fragment key={log._id}>
                                            <tr 
                                                className="hover:bg-surface/50 transition-colors"
                                            >
                                                <td className="px-4 py-3 font-medium text-foreground">{new Date(log.date).toLocaleDateString()}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                                        {log.skilledCount + log.unskilledCount}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                                                        {log.supervisorCount}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className="text-lg font-black text-foreground">{log.totalCount}</span>
                                                </td>
                                                <td className="px-4 py-3 text-muted text-sm">{log.loggedBy}</td>
                                                <td className="px-4 py-3 text-muted text-xs max-w-[200px] truncate">{log.notes || '—'}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); setExpandedLabourLogId(expandedLabourLogId === log._id ? null : log._id); }}
                                                            className="text-muted hover:text-primary transition-colors flex items-center gap-1 p-1 rounded hover:bg-surface"
                                                            title="View Entities"
                                                        >
                                                            {expandedLabourLogId === log._id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                                            <span className="text-xs font-medium">View</span>
                                                        </button>
                                                        {(log.loggedBy === userName || isProjectManager) && (
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); handleDeleteLabourLog(log._id); }}
                                                                className="text-red-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-500/10"
                                                                title="Delete Log"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                            {expandedLabourLogId === log._id && (
                                                <tr>
                                                    <td colSpan={7} className="p-0 border-b border-gray-700 bg-surface/30">
                                                        <div className="p-4 space-y-4">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <Users size={16} className="text-primary" />
                                                                <h4 className="text-sm font-bold text-foreground">Detailed Worker breakdown</h4>
                                                            </div>
                                                            <div className="overflow-x-auto rounded-lg border border-gray-700 bg-surface/50">
                                                                <table className="w-full text-left text-sm">
                                                                    <thead className="bg-surface text-muted text-xs uppercase tracking-wider border-b border-gray-700">
                                                                        <tr>
                                                                            <th className="px-4 py-2 font-semibold w-16 text-center">Photo</th>
                                                                            <th className="px-4 py-2 font-semibold">Name / Type</th>
                                                                            <th className="px-4 py-2 font-semibold text-center w-24">Count</th>
                                                                            <th className="px-4 py-2 font-semibold">Notes</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody className="divide-y divide-gray-700/50">
                                                                        {log.entries.map((ent: any, eIdx: number) => (
                                                                            <tr key={eIdx} className="hover:bg-surface/80 transition-colors">
                                                                                <td className="px-4 py-2 text-center flex justify-center">
                                                                                    {ent.photo ? (
                                                                                        <img 
                                                                                            src={ent.photo} 
                                                                                            alt={ent.name || ent.workerType} 
                                                                                            onClick={(e) => { e.stopPropagation(); openLabourPhotosViewer(log._id); }}
                                                                                            className="h-10 w-10 border border-gray-600 rounded cursor-pointer hover:opacity-80 transition-opacity object-cover inline-block" 
                                                                                        />
                                                                                    ) : (
                                                                                        <div className="h-10 w-10 rounded bg-surface border border-gray-700 flex items-center justify-center text-muted mx-auto">
                                                                                            <Camera size={16} />
                                                                                        </div>
                                                                                    )}
                                                                                </td>
                                                                                <td className="px-4 py-2 font-medium text-foreground">{ent.name || ent.workerType}</td>
                                                                                <td className="px-4 py-2 text-center">
                                                                                    <span className="px-2 py-0.5 rounded bg-surface border border-gray-700 text-xs font-bold">{ent.count}</span>
                                                                                </td>
                                                                                <td className="px-4 py-2 text-xs text-muted max-w-[200px]">{ent.notes || '—'}</td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </Fragment>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB: REPORT */}
            {!tabLoading && activeTab === "Report" && (
                <div className="flex flex-col gap-6 mt-6">
                    <div className="flex items-center gap-4 overflow-x-auto w-full mb-6 pb-2">
                        <button
                            onClick={() => setReportSubTab("Labour")}
                            className={`px-5 py-2.5 text-xs font-black tracking-widest uppercase transition-all whitespace-nowrap rounded-full shrink-0 ${
                                reportSubTab === "Labour"
                                ? "bg-[#1A1D24] text-primary shadow-sm"
                                : "text-muted hover:text-foreground hover:bg-surface/50"
                            }`}
                        >
                            Labour
                        </button>
                        <button
                            onClick={() => setReportSubTab("Material")}
                            className={`px-5 py-2.5 text-xs font-black tracking-widest uppercase transition-all whitespace-nowrap rounded-full shrink-0 ${
                                reportSubTab === "Material"
                                ? "bg-[#1A1D24] text-primary shadow-sm"
                                : "text-muted hover:text-foreground hover:bg-surface/50"
                            }`}
                        >
                            Material
                        </button>
                        <button
                            onClick={() => setReportSubTab("Petty Cash")}
                            className={`px-5 py-2.5 text-xs font-black tracking-widest uppercase transition-all whitespace-nowrap rounded-full shrink-0 ${
                                reportSubTab === "Petty Cash"
                                ? "bg-[#1A1D24] text-primary shadow-sm"
                                : "text-muted hover:text-foreground hover:bg-surface/50"
                            }`}
                        >
                            Petty Cash
                        </button>
                    </div>

                    <div className="flex justify-end mb-4 print:hidden">
                        <button 
                            onClick={() => window.print()}
                            className="flex items-center gap-2 bg-primary text-black px-4 py-2 rounded-lg font-bold text-sm hover:bg-primary/90 transition-colors"
                        >
                            <FileText size={16} /> Export PDF
                        </button>
                    </div>

                    {reportSubTab === "Labour" ? (
                        <div className="bg-white border text-black rounded-xl p-6 shadow-sm font-serif">
                            <h2 className="text-2xl font-bold text-center mb-2 border-b-2 border-black pb-2 uppercase tracking-wide">Labour Payment Details</h2>
                            <div className="text-center font-bold uppercase mb-6 text-sm tracking-wider">
                                Site: {site.name} | Engineer: {userName}
                            </div>
                            
                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-gray-600 uppercase tracking-wider font-semibold">From</label>
                                    <input
                                        type="date"
                                        value={reportFromDate}
                                        onChange={e => setReportFromDate(e.target.value)}
                                        className="rounded border border-gray-400 bg-gray-50 px-3 py-1 text-sm text-black focus:border-black focus:outline-none font-sans"
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-gray-600 uppercase tracking-wider font-semibold">To</label>
                                    <input
                                        type="date"
                                        value={reportToDate}
                                        onChange={e => setReportToDate(e.target.value)}
                                        className="rounded border border-gray-400 bg-gray-50 px-3 py-1 text-sm text-black focus:border-black focus:outline-none font-sans"
                                    />
                                </div>
                            </div>
                            
                            <div className="overflow-x-auto border-2 border-black w-full">
                                {(() => {
                                    const start = new Date(reportFromDate);
                                    const end = new Date(reportToDate);
                                    const dates: string[] = [];
                                    const dateLabels: string[] = [];
                                    
                                    // Limit date range to prevent extreme memory use if users select huge ranges
                                    const maxDays = 31;
                                    let dayCount = 0;
                                    
                                    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                                        if (dayCount++ >= maxDays) break;
                                        dates.push(new Date(d).toISOString().split('T')[0]);
                                        dateLabels.push(new Date(d).toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase());
                                    }

                                    const logsInRange = aggregateLabourLogs.filter(l => {
                                        const lDate = l.date.split('T')[0];
                                        return lDate >= reportFromDate && lDate <= reportToDate;
                                    });

                                    const typesSet = new Set<string>();
                                    logsInRange.forEach(log => {
                                        log.entries.forEach(e => typesSet.add(e.workerType));
                                    });
                                    const workerTypes = Array.from(typesSet).sort();

                                    let grandTotal = 0;

                                    return (
                                        <table className="w-full text-center border-collapse text-sm">
                                            <thead className="font-bold border-b-2 border-black tracking-wide">
                                                <tr>
                                                    <th className="border-r-2 border-black px-4 py-3 uppercase w-40">Worker Type</th>
                                                    {dateLabels.map((dl, i) => (
                                                        <th key={i} className="border-r-2 border-black px-2 py-3 uppercase" title={dates[i]}>
                                                            {dl}
                                                        </th>
                                                    ))}
                                                    <th className="border-r-2 border-black px-4 py-3 uppercase">T-Days</th>
                                                    <th className="border-r-2 border-black px-4 py-3 uppercase w-28">Rate (₹)</th>
                                                    <th className="border-black px-4 py-3 uppercase">T-Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {workerTypes.length === 0 ? (
                                                    <tr>
                                                        <td className="border-r-2 border-b-2 border-black px-4 py-6"></td>
                                                        <td colSpan={dateLabels.length + 3} className="border-b-2 border-black px-4 py-6 font-bold uppercase tracking-widest text-gray-500">No labour data found for selected period</td>
                                                    </tr>
                                                ) : (
                                                    workerTypes.map(wt => {
                                                        const counts = dates.map(d => {
                                                            const log = logsInRange.find(l => l.date.split('T')[0] === d);
                                                            if (!log) return 0;
                                                            return log.entries
                                                                .filter(e => e.workerType === wt)
                                                                .reduce((sum, e) => sum + (Number(e.count) || 0), 0);
                                                        });
                                                        const totalDays = counts.reduce((a, b) => a + b, 0);
                                                        const rate = reportRates[wt] || 0;
                                                        const totalAmount = totalDays * rate;
                                                        grandTotal += totalAmount;

                                                        return (
                                                            <tr key={wt}>
                                                                <td className="border-r-2 border-b-2 border-black px-4 py-3 font-semibold uppercase">{wt}</td>
                                                                {counts.map((c, i) => (
                                                                    <td key={i} className="border-r-2 border-b-2 border-black px-2 py-3 font-semibold">
                                                                        {c > 0 ? c : '—'}
                                                                    </td>
                                                                ))}
                                                                <td className="border-r-2 border-b-2 border-black px-4 py-3 font-bold text-blue-600">
                                                                    {totalDays}
                                                                </td>
                                                                <td className="border-r-2 border-b-2 border-black px-2 py-2">
                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        value={reportRates[wt] || ''}
                                                                        onChange={(e) => setReportRates(prev => ({ ...prev, [wt]: Number(e.target.value) }))}
                                                                        className="w-full text-center rounded border border-gray-400 bg-gray-50 px-2 py-1 text-sm font-bold text-black focus:border-black focus:outline-none font-sans"
                                                                        placeholder="0"
                                                                    />
                                                                </td>
                                                                <td className="border-b-2 border-black px-4 py-3 font-bold text-red-600">
                                                                    {totalAmount > 0 ? totalAmount.toLocaleString('en-IN') : '—'}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                                )}
                                                {/* Add empty rows like a printed register */}
                                                {Array.from({ length: Math.max(0, 5 - workerTypes.length) }).map((_, i) => (
                                                    <tr key={`empty-${i}`}>
                                                        <td className="border-r-2 border-b-2 border-black px-4 py-6"></td>
                                                        {dateLabels.map((_, i) => (
                                                            <td key={i} className="border-r-2 border-b-2 border-black px-2 py-6"></td>
                                                        ))}
                                                        <td className="border-r-2 border-b-2 border-black px-4 py-6"></td>
                                                        <td className="border-r-2 border-b-2 border-black px-4 py-6"></td>
                                                        <td className="border-b-2 border-black px-4 py-6"></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            {workerTypes.length > 0 && (
                                                <tfoot>
                                                    <tr>
                                                        <td className="border-b-2 border-black"></td>
                                                        <td colSpan={dateLabels.length + 2} className="border-b-2 border-black px-4 py-4 text-right uppercase tracking-wider font-bold">
                                                            Total Amount
                                                        </td>
                                                        <td className="border-b-2 border-black px-4 py-4 font-bold text-lg text-red-600 border-l-2">
                                                            ₹ {grandTotal.toLocaleString('en-IN')}
                                                        </td>
                                                    </tr>
                                                </tfoot>
                                            )}
                                        </table>
                                    );
                                })()}
                            </div>
                        </div>
                    ) : reportSubTab === "Material" ? (
                        <div className="bg-white border text-black rounded-xl p-6 shadow-sm font-serif">
                            {/* Materials Report Layout exactly like Image 2 */}
                            <h2 className="text-2xl font-bold text-center mb-2 border-b-2 border-black pb-2 uppercase tracking-wide">Received Material Details</h2>
                            <div className="text-center font-bold uppercase mb-6 text-sm tracking-wider">
                                Site: {site.name} | Engineer: {userName}
                            </div>
                            
                            {/* Filter Section for Material Report - Optional context but helpful */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-gray-600 uppercase tracking-wider font-semibold">From</label>
                                    <input
                                        type="date"
                                        value={reportFromDate}
                                        onChange={e => setReportFromDate(e.target.value)}
                                        className="rounded border border-gray-400 bg-gray-50 px-3 py-1 text-sm text-black focus:border-black focus:outline-none font-sans"
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-gray-600 uppercase tracking-wider font-semibold">To</label>
                                    <input
                                        type="date"
                                        value={reportToDate}
                                        onChange={e => setReportToDate(e.target.value)}
                                        className="rounded border border-gray-400 bg-gray-50 px-3 py-1 text-sm text-black focus:border-black focus:outline-none font-sans"
                                    />
                                </div>
                            </div>
                            

                            {/* Second Table: Received Logs */}
                            <div className="overflow-x-auto border-2 border-black w-full">
                                <table className="w-full text-center border-collapse text-sm">
                                    <thead className="font-bold border-b-2 border-black tracking-wide">
                                        <tr>
                                            <th className="border-r-2 border-black px-4 py-3 uppercase">Date</th>
                                            <th className="border-r-2 border-black px-4 py-3 uppercase">Material</th>
                                            <th className="border-r-2 border-black px-4 py-3 uppercase">Lorry No.</th>
                                            <th className="border-r-2 border-black px-4 py-3 uppercase">Lorry Measurement</th>
                                            <th className="border-black px-4 py-3 uppercase">Total Quantity</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {materials.filter(m => {
                                            const mDate = new Date(m.createdAt).toISOString().split('T')[0];
                                            return mDate >= reportFromDate && mDate <= reportToDate;
                                        }).length === 0 ? (
                                            <tr>
                                                <td className="border-r-2 border-b-2 border-black px-4 py-6 font-bold uppercase tracking-widest text-gray-500"></td>
                                                <td colSpan={4} className="border-b-2 border-black px-4 py-6 text-gray-500 font-bold tracking-widest uppercase">No materials found for selected period</td>
                                            </tr>
                                        ) : (
                                            materials.filter(m => {
                                                const mDate = new Date(m.createdAt).toISOString().split('T')[0];
                                                return mDate >= reportFromDate && mDate <= reportToDate;
                                            }).map((m) => (
                                                <tr key={m._id}>
                                                    <td className="border-r-2 border-b-2 border-black px-4 py-3 font-semibold">{new Date(m.createdAt).toLocaleDateString()}</td>
                                                    <td className="border-r-2 border-b-2 border-black px-4 py-3 font-semibold uppercase">{m.item}</td>
                                                    <td className="border-r-2 border-b-2 border-black px-4 py-3 font-semibold uppercase">{m.lorryNo || '—'}</td>
                                                    <td className="border-r-2 border-b-2 border-black px-4 py-3 font-semibold uppercase">{m.lorryMeasurements || '—'}</td>
                                                    <td className="border-b-2 border-black px-4 py-3 font-bold">{m.quantity} {m.unit}</td>
                                                </tr>
                                            ))
                                        )}
                                        {/* Create some empty rows to make it look like a printed book / register */}
                                        {Array.from({ length: Math.max(0, 5 - materials.filter(m => {
                                            const mDate = new Date(m.createdAt).toISOString().split('T')[0];
                                            return mDate >= reportFromDate && mDate <= reportToDate;
                                        }).length) }).map((_, i) => (
                                            <tr key={`empty-${i}`}>
                                                <td className="border-r-2 border-b-2 border-black px-4 py-6"></td>
                                                <td className="border-r-2 border-b-2 border-black px-4 py-6"></td>
                                                <td className="border-r-2 border-b-2 border-black px-4 py-6"></td>
                                                <td className="border-r-2 border-b-2 border-black px-4 py-6"></td>
                                                <td className="border-b-2 border-black px-4 py-6"></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : reportSubTab === "Petty Cash" ? (
                        <div className="bg-white border text-black rounded-xl p-6 shadow-sm font-serif">
                            <h2 className="text-2xl font-bold text-center mb-2 border-b-2 border-black pb-2 uppercase tracking-wide">Petty Cash Transactions</h2>
                            <div className="text-center font-bold uppercase mb-6 text-sm tracking-wider">
                                Site: {site.name} | Engineer: {userName}
                            </div>
                            
                            <div className="flex items-center gap-4 mb-6 print:hidden">
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-gray-600 uppercase tracking-wider font-semibold">From</label>
                                    <input
                                        type="date"
                                        value={reportFromDate}
                                        onChange={e => setReportFromDate(e.target.value)}
                                        className="rounded border border-gray-400 bg-gray-50 px-3 py-1 text-sm text-black focus:border-black focus:outline-none font-sans"
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-gray-600 uppercase tracking-wider font-semibold">To</label>
                                    <input
                                        type="date"
                                        value={reportToDate}
                                        onChange={e => setReportToDate(e.target.value)}
                                        className="rounded border border-gray-400 bg-gray-50 px-3 py-1 text-sm text-black focus:border-black focus:outline-none font-sans"
                                    />
                                </div>
                            </div>

                            <div className="overflow-x-auto border-2 border-black w-full">
                                <table className="w-full text-center border-collapse text-sm">
                                    <thead className="font-bold border-b-2 border-black tracking-wide">
                                        <tr>
                                            <th className="border-r-2 border-black px-4 py-3 uppercase">Date</th>
                                            <th className="border-r-2 border-black px-4 py-3 uppercase">Title</th>
                                            <th className="border-r-2 border-black px-4 py-3 uppercase">Type</th>
                                            <th className="border-r-2 border-black px-4 py-3 uppercase">Logged By</th>
                                            <th className="border-black px-4 py-3 uppercase">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pettyCashTransactions.filter(p => {
                                            const pDate = new Date(p.date).toISOString().split('T')[0];
                                            return pDate >= reportFromDate && pDate <= reportToDate;
                                        }).length === 0 ? (
                                            <tr>
                                                <td className="border-r-2 border-b-2 border-black px-4 py-6 font-bold uppercase tracking-widest text-gray-500"></td>
                                                <td colSpan={4} className="border-b-2 border-black px-4 py-6 text-gray-500 font-bold tracking-widest uppercase">No transactions found for selected period</td>
                                            </tr>
                                        ) : (
                                            pettyCashTransactions.filter(p => {
                                                const pDate = new Date(p.date).toISOString().split('T')[0];
                                                return pDate >= reportFromDate && pDate <= reportToDate;
                                            }).map((p) => (
                                                <tr key={p._id}>
                                                    <td className="border-r-2 border-b-2 border-black px-4 py-3 font-semibold">{new Date(p.date).toLocaleDateString()}</td>
                                                    <td className="border-r-2 border-b-2 border-black px-4 py-3 font-semibold uppercase">{p.title}</td>
                                                    <td className="border-r-2 border-b-2 border-black px-4 py-3 font-semibold uppercase">{p.type}</td>
                                                    <td className="border-r-2 border-b-2 border-black px-4 py-3 font-semibold uppercase">{p.loggedBy}</td>
                                                    <td className={`border-b-2 border-black px-4 py-3 font-bold ${p.type === 'Allocation' ? 'text-green-600' : 'text-red-600'}`}>
                                                        ₹ {p.amount.toLocaleString('en-IN')}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                        {Array.from({ length: Math.max(0, 5 - pettyCashTransactions.filter(p => {
                                            const pDate = new Date(p.date).toISOString().split('T')[0];
                                            return pDate >= reportFromDate && pDate <= reportToDate;
                                        }).length) }).map((_, i) => (
                                            <tr key={`empty-${i}`}>
                                                <td className="border-r-2 border-b-2 border-black px-4 py-6"></td>
                                                <td className="border-r-2 border-b-2 border-black px-4 py-6"></td>
                                                <td className="border-r-2 border-b-2 border-black px-4 py-6"></td>
                                                <td className="border-r-2 border-b-2 border-black px-4 py-6"></td>
                                                <td className="border-b-2 border-black px-4 py-6"></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td className="border-r-2 border-t-2 border-black px-4 py-4 uppercase font-bold text-right" colSpan={4}>Net Balance In Period</td>
                                            <td className="border-t-2 border-black px-4 py-4 font-bold text-lg text-blue-600">
                                                ₹ {pettyCashTransactions.filter(p => {
                                                    const pDate = new Date(p.date).toISOString().split('T')[0];
                                                    return pDate >= reportFromDate && pDate <= reportToDate;
                                                }).reduce((acc, p) => p.type === "Allocation" ? acc + p.amount : acc - p.amount, 0).toLocaleString('en-IN')}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    ) : null}
                </div>
            )}

            {/* TAB: MATERIALS */}
            {!tabLoading && activeTab === "Materials" && (
                <div className="flex flex-col gap-6">
                    {/* Materials Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                        <div className="rounded-2xl border border-gray-800 bg-[#0B0D11] p-6 shadow-sm flex flex-col justify-between min-h-[150px] transition-all hover:border-gray-700/50">
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/40">Total Materials</span>
                            <div className="text-4xl font-bold text-white leading-none">{materials.length}</div>
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary">All Requests</span>
                        </div>
                        <div className="rounded-2xl border border-gray-800 bg-[#0B0D11] p-6 shadow-sm flex flex-col justify-between min-h-[150px] transition-all hover:border-gray-700/50">
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/40">Approved</span>
                            <div className="text-4xl font-bold text-white leading-none">{materials.filter(m => m.status === 'Approved').length}</div>
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-green-500">Approved Items</span>
                        </div>
                        <div className="rounded-2xl border border-gray-800 bg-[#0B0D11] p-6 shadow-sm flex flex-col justify-between min-h-[150px] transition-all hover:border-gray-700/50">
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/40">Pending Approval</span>
                            <div className="text-4xl font-bold text-white leading-none">{materials.filter(m => m.status === 'Pending').length}</div>
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-yellow-500">Awaiting Manager</span>
                        </div>
                        <div className="rounded-2xl border border-gray-800 bg-[#0B0D11] p-6 shadow-sm flex flex-col justify-between min-h-[150px] transition-all hover:border-gray-700/50">
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/40">Refund Requests</span>
                            <div className="text-4xl font-bold text-white leading-none">{refundRequests.length}</div>
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-orange-500">Stock Returns</span>
                        </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-4 overflow-x-auto pb-1 sm:pb-0">
                            <button
                                onClick={() => setMaterialsSubTab("Available")}
                                className={`px-5 py-2.5 text-xs font-black tracking-widest uppercase transition-all whitespace-nowrap rounded-full shrink-0 ${
                                    materialsSubTab === "Available"
                                    ? "bg-[#1A1D24] text-primary shadow-sm"
                                    : "text-muted hover:text-foreground hover:bg-surface/50"
                                }`}
                            >
                                Materials Available
                            </button>
                            <button
                                onClick={() => setMaterialsSubTab("Refunds")}
                                className={`px-5 py-2.5 text-xs font-black tracking-widest uppercase transition-all whitespace-nowrap rounded-full shrink-0 ${
                                    materialsSubTab === "Refunds"
                                    ? "bg-[#1A1D24] text-primary shadow-sm"
                                    : "text-muted hover:text-foreground hover:bg-surface/50"
                                }`}
                            >
                                Stock Refund Requests
                            </button>
                        </div>
                        
                        <div>
                            {materialsSubTab === "Available" && (isProjectManager || isSiteEngineer) ? (
                                <button
                                    onClick={() => setIsAddMaterialOpen(true)}
                                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                                >
                                    <Plus size={16} /> Add Material
                                </button>
                            ) : materialsSubTab === "Refunds" && (isSiteEngineer || isProjectManager) ? (
                                <button
                                    onClick={() => setIsRequestRefundOpen(true)}
                                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                                >
                                    <Plus size={16} /> Send Refund Request
                                </button>
                            ) : null}
                        </div>
                    </div>

                    {materialsSubTab === "Available" ? (() => {
                        const visibleMaterials = materials.filter(m => isHRManager ? m.status === 'Approved' : true);
                        const hasActionableItems = visibleMaterials.some(m => m.status === 'Pending' && (isProjectManager || isSiteEngineer));
                        
                        return (
                        <div className="overflow-x-auto rounded-xl border border-gray-700 bg-panel shadow-sm">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-surface text-muted border-b border-gray-700">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest">Item Name</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest">Quantity</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest">Lorry Info</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest">Added By</th>
                                        {(isSiteEngineer || isProjectManager) && <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest text-right">Actions</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {visibleMaterials.length === 0 ? (
                                        <tr><td colSpan={hasActionableItems ? 6 : 5} className="px-6 py-8 text-center text-muted">No materials recorded at this site.</td></tr>
                                    ) : (
                                        visibleMaterials.map(m => (
                                            <tr key={m._id} className="hover:bg-surface/50 transition-colors">
                                                <td className="px-4 py-3 font-medium text-foreground">
                                                    <div className="flex items-center gap-2">
                                                        {m.photo && (
                                                            <div className="group relative shrink-0">
                                                                <img src={m.photo} className="h-8 w-8 rounded overflow-hidden border border-gray-600 object-cover cursor-help" />
                                                                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hidden group-hover:block z-50 p-2 bg-panel border border-gray-700 rounded-xl shadow-2xl">
                                                                     <img src={m.photo} className="max-w-[80vw] max-h-[80vh] object-contain rounded-lg" />
                                                                </div>
                                                            </div>
                                                        )}
                                                        {m.item}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-primary font-mono font-bold">{m.quantity} <span className="text-muted text-xs font-normal">{m.unit}</span></td>
                                                <td className="px-4 py-3 text-muted">
                                                    {m.lorryNo || m.lorryMeasurements ? (
                                                        <div className="flex flex-col gap-0.5 text-xs">
                                                            {m.lorryNo && <span className="font-mono text-foreground">{m.lorryNo}</span>}
                                                            {m.lorryMeasurements && <span>{m.lorryMeasurements}</span>}
                                                        </div>
                                                    ) : '—'}
                                                </td>
                                                <td className="px-4 py-3 text-muted text-sm">{m.addedBy || '—'}</td>
                                                {/* Status column removed as per request */}
                                                {(isSiteEngineer || isProjectManager) && (
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="flex items-center justify-end gap-3">
                                                            <button 
                                                                onClick={() => handleDeleteMaterial(m._id)}
                                                                className="text-xs font-bold text-red-500 hover:text-red-400 transition-colors flex items-center gap-1"
                                                                title="Delete Material"
                                                            >
                                                                <Trash2 size={14} /> Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )})() : materialsSubTab === "Refunds" ? (
                        <div className="overflow-x-auto rounded-xl border border-gray-700 bg-panel shadow-sm">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-surface text-muted border-b border-gray-700">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest">Material Name</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest">Quantity</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest">Requested By</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest">Reason</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest">Date</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest text-right">Status / Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {refundRequests.length === 0 ? (
                                        <tr><td colSpan={6} className="px-6 py-8 text-center text-muted">No refund requests found.</td></tr>
                                    ) : (
                                        refundRequests.map(req => (
                                            <tr key={req._id} className="hover:bg-surface/50 transition-colors">
                                                <td className="px-4 py-3 font-medium text-foreground">{req.materialName}</td>
                                                <td className="px-4 py-3 text-foreground font-mono font-bold">{req.quantity} {req.unit}</td>
                                                <td className="px-4 py-3 text-muted">{req.requestedBy}</td>
                                                <td className="px-4 py-3 text-muted text-xs max-w-[200px] truncate" title={req.reason}>{req.reason}</td>
                                                <td className="px-4 py-3 text-muted text-xs">{new Date(req.createdAt).toLocaleDateString()}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-0.5 rounded-lg text-xs font-medium border ${
                                                        req.status === 'Approved' ? 'bg-success/10 text-success border-success/20' :
                                                        req.status === 'Rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                                        'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                                    }`}>
                                                        {req.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    {isProjectManager && req.status === 'Pending' && (
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() => handleRefundAction(req._id, 'Approved')}
                                                                className="p-1 px-2 bg-success text-black text-[10px] font-bold rounded hover:bg-success/90 transition-colors uppercase"
                                                                title="Approve Refund"
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() => handleRefundAction(req._id, 'Rejected')}
                                                                className="p-1 px-2 bg-red-500 text-white text-[10px] font-bold rounded hover:bg-red-600 transition-colors uppercase"
                                                                title="Reject Refund"
                                                            >
                                                                Reject
                                                            </button>
                                                        </div>
                                                    )}
                                                    {(isProjectManager || isSiteEngineer) && req.status === 'Approved' && (
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={async () => {
                                                                    if (!confirm("Are you sure you want to delete this approved refund request?")) return;
                                                                    try {
                                                                        const res = await fetch(`/api/sites/${siteId}/stock-refund-requests/${req._id}`, {
                                                                            method: "DELETE"
                                                                        });
                                                                        if (res.ok) {
                                                                            setRefundRequests(prev => prev.filter(r => r._id !== req._id));
                                                                        }
                                                                    } catch (err) {
                                                                        console.error("Failed to delete refund request:", err);
                                                                    }
                                                                }}
                                                                className="p-1 px-2 bg-red-500/10 text-red-500 text-[10px] font-bold rounded hover:bg-red-500/20 border border-red-500/20 transition-colors uppercase flex items-center gap-1"
                                                                title="Delete Approved Refund"
                                                            >
                                                                <Trash2 size={12} /> Delete
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : null}
                </div>
            )}

            {/* TAB: ISSUES */}
            {!tabLoading && activeTab === "Issues" && (
                <div className="flex flex-col gap-4">
                    {/* Issues Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                        <div className="rounded-2xl border border-gray-800 bg-[#0B0D11] p-6 shadow-sm flex flex-col justify-between min-h-[150px] transition-all hover:border-gray-700/50">
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/40">Total Issues</span>
                            <div className="text-4xl font-bold text-white leading-none">{issues.length}</div>
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary">Reported Issues</span>
                        </div>
                        <div className="rounded-2xl border border-gray-800 bg-[#0B0D11] p-6 shadow-sm flex flex-col justify-between min-h-[150px] transition-all hover:border-gray-700/50">
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/40">Critical</span>
                            <div className="text-4xl font-bold text-white leading-none">{issues.filter(i => i.priority === 'Critical').length}</div>
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-red-500">High Priority</span>
                        </div>
                        <div className="rounded-2xl border border-gray-800 bg-[#0B0D11] p-6 shadow-sm flex flex-col justify-between min-h-[150px] transition-all hover:border-gray-700/50">
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/40">In Progress</span>
                            <div className="text-4xl font-bold text-white leading-none">{issues.filter(i => i.status === 'In Progress').length}</div>
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-blue-500">Being Fixed</span>
                        </div>
                        <div className="rounded-2xl border border-gray-800 bg-[#0B0D11] p-6 shadow-sm flex flex-col justify-between min-h-[150px] transition-all hover:border-gray-700/50">
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/40">Resolved</span>
                            <div className="text-4xl font-bold text-white leading-none">{issues.filter(i => i.status === 'Resolved').length}</div>
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-green-500">Fixed Issues</span>
                        </div>
                    </div>

                    <div className="flex justify-between items-center mt-4">
                        <h2 className="text-xl font-bold text-foreground">Site Issues</h2>
                        {(isSiteEngineer || isProjectManager) && (
                            <button
                                onClick={() => setIsReportIssueOpen(true)}
                                className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
                            >
                                <AlertTriangle size={16} /> Report Issue
                            </button>
                        )}
                    </div>
                    <div className="overflow-x-auto rounded-xl border border-gray-700 bg-panel shadow-sm">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-surface text-muted border-b border-gray-700">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest">Title</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest">Description</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest">Priority</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest">Reported</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {issues.length === 0 ? (
                                    <tr><td colSpan={5} className="px-6 py-8 text-center text-muted">No issues reported for this site.</td></tr>
                                ) : (
                                    issues.map(i => (
                                        <tr key={i._id} className="hover:bg-surface/50 transition-colors">
                                            <td className="px-4 py-3 font-medium text-foreground">{i.title}</td>
                                            <td className="px-4 py-3 text-muted max-w-[300px] truncate">
                                                <div className="truncate">{i.description || "—"}</div>
                                                {i.sentTo && i.sentTo.length > 0 && (
                                                    <div className="text-[10px] mt-1 text-primary/80 font-medium">Sent to: {i.sentTo.join(', ')}</div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-0.5 rounded-lg text-xs font-medium border ${
                                                    i.priority === 'Critical' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                                    i.priority === 'High' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                                                    i.priority === 'Medium' ? 'bg-primary/10 text-primary border-primary/20' :
                                                    'bg-surface text-muted border-gray-700'
                                                }`}>
                                                    {i.priority}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {isSiteEngineer || isProjectManager ? (
                                                    <select
                                                        value={i.status}
                                                        onChange={(e) => handleUpdateIssueStatus(i._id, e.target.value)}
                                                        className={`px-2 py-1 rounded-lg text-xs font-medium border appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary ${
                                                            i.status === 'Open' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                            i.status === 'In Progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                            'bg-success/10 text-success border-success/20'
                                                        }`}
                                                    >
                                                        <option value="Open" className="bg-panel text-foreground">Open</option>
                                                        <option value="In Progress" className="bg-panel text-foreground">In Progress</option>
                                                        <option value="Resolved" className="bg-panel text-foreground">Resolved</option>
                                                    </select>
                                                ) : (
                                                    <span className={`px-2 py-0.5 rounded-lg text-xs font-medium border ${
                                                        i.status === 'Open' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                        i.status === 'In Progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                        'bg-success/10 text-success border-success/20'
                                                    }`}>
                                                        {i.status}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-muted text-xs">{new Date(i.createdAt).toLocaleDateString()}</td>
                                            <td className="px-4 py-3 text-right">
                                                {(i.raisedBy === userName || isProjectManager) && (
                                                    <button 
                                                        onClick={() => handleDeleteIssue(i._id)}
                                                        className="text-red-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-500/10"
                                                        title="Delete Issue"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
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

            {/* TAB: PETTY CASH */}
            {!tabLoading && activeTab === "Petty Cash" && (
                <div className="flex flex-col gap-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                        <div className="rounded-2xl border border-gray-800 bg-[#0B0D11] p-6 shadow-sm flex flex-col justify-between min-h-[150px] transition-all hover:border-gray-700/50">
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/40">Total Allocated</span>
                            <div className="text-4xl font-bold text-white leading-none font-mono">₹{(pettyCashSummary?.allocated || 0).toLocaleString('en-IN')}</div>
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary">Funds assigned</span>
                        </div>
                        <div className="rounded-2xl border border-gray-800 bg-[#0B0D11] p-6 shadow-sm flex flex-col justify-between min-h-[150px] transition-all hover:border-gray-700/50">
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/40">Total Spent</span>
                            <div className="text-4xl font-bold text-white leading-none font-mono">₹{(pettyCashSummary?.spent || 0).toLocaleString('en-IN')}</div>
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-orange-500">Total expense</span>
                        </div>
                        <div className="rounded-2xl border border-gray-800 bg-[#0B0D11] p-6 shadow-sm flex flex-col justify-between min-h-[150px] transition-all hover:border-gray-700/50">
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/40">Current Balance</span>
                            <div className={`text-4xl font-bold font-mono leading-none ${(pettyCashSummary?.balance || 0) < 0 ? 'text-red-500' : 'text-white'}`}>₹{(pettyCashSummary?.balance || 0).toLocaleString('en-IN')}</div>
                            <span className={`text-[10px] uppercase tracking-[0.2em] font-bold ${(pettyCashSummary?.balance || 0) < 0 ? 'text-red-500' : 'text-green-500'}`}>Remaining allocation</span>
                        </div>
                        <div className="rounded-2xl border border-gray-800 bg-[#0B0D11] p-6 shadow-sm flex flex-col justify-between min-h-[150px] transition-all hover:border-gray-700/50">
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/40">Total Transactions</span>
                            <div className="text-4xl font-bold text-white leading-none font-mono">{pettyCashTransactions.length}</div>
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-blue-500">Recorded logs</span>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-8 mb-4 border-b border-gray-700 pb-4">
                        <h2 className="text-lg font-bold text-foreground uppercase tracking-wider">TRANSACTIONS ({pettyCashTransactions.length})</h2>
                        <div className="flex items-center gap-2 w-full sm:w-auto mt-3 sm:mt-0">
                            {!isSiteEngineer && (
                                <button
                                    onClick={() => setIsAllocatePettyCashOpen(true)}
                                    className="flex-1 sm:flex-none items-center justify-center gap-2 rounded-lg bg-surface border border-primary/50 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10 transition-colors flex shadow-sm"
                                >
                                    <ArrowUpRight size={16} /> Allocate Funds
                                </button>
                            )}
                            <button
                                onClick={() => setIsLogPettyCashExpenseOpen(true)}
                                className="flex-1 sm:flex-none items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-black hover:bg-primary-hover transition-colors flex shadow-sm"
                            >
                                <ArrowDownRight size={16} /> Log Expense
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-gray-700 bg-panel shadow-sm">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-surface text-muted border-b border-gray-700">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest">Date</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest">Title/Description</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest">Logged By</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest text-right">Amount (₹)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {pettyCashTransactions.length === 0 ? (
                                    <tr><td colSpan={4} className="px-6 py-8 text-center text-muted">No petty cash transactions recorded.</td></tr>
                                ) : (
                                    pettyCashTransactions.map(tx => (
                                        <tr key={tx._id} className="hover:bg-surface/50 transition-colors">
                                            <td className="px-4 py-3 text-muted">{new Date(tx.date).toLocaleDateString()}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    {tx.type === 'Allocation' ? (
                                                        <ArrowUpRight size={14} className="text-primary shrink-0" />
                                                    ) : (
                                                        <ArrowDownRight size={14} className="text-orange-400 shrink-0" />
                                                    )}
                                                    <span className="font-medium text-foreground">{tx.title}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-muted">{tx.loggedBy}</td>
                                            <td className={`px-4 py-3 text-right font-mono font-medium ${tx.type === 'Allocation' ? 'text-primary' : 'text-foreground'}`}>
                                                {tx.type === 'Allocation' ? '+' : '-'} {tx.amount.toLocaleString('en-IN')}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB: STAFF ATTENDANCE */}
            {!tabLoading && activeTab === "Staff Attendance" && (() => {
                const allRecords = [...engineerAttendance, ...labourAttendance];
                const approvedCount = allRecords.filter(r => r.approvalStatus === 'approved').length;
                const pendingCount = allRecords.filter(r => r.approvalStatus === 'pending').length;
                const rejectedCount = allRecords.filter(r => r.approvalStatus === 'rejected').length;

                const filteredEngineers = attendanceStatusFilter === 'all'
                    ? engineerAttendance
                    : engineerAttendance.filter(r => r.approvalStatus === attendanceStatusFilter);
                const filteredLabours = attendanceStatusFilter === 'all'
                    ? labourAttendance
                    : labourAttendance.filter(r => r.approvalStatus === attendanceStatusFilter);

                return (
                <div className="flex flex-col gap-6">
                    {/* Summary Stat Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                        <button
                            onClick={() => setAttendanceStatusFilter('all')}
                            className={`p-6 rounded-2xl border transition-all flex flex-col justify-between min-h-[150px] text-left ${
                                attendanceStatusFilter === 'all' ? "border-blue-500 bg-blue-500/5 ring-1 ring-blue-500/20 shadow-lg shadow-blue-500/5" : "border-gray-800 bg-[#0B0D11] hover:border-gray-700/50"
                            }`}
                        >
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/40">All Records</span>
                            <div className="text-4xl font-bold text-white leading-none">{allRecords.length}</div>
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-blue-500">History</span>
                        </button>
                        <button
                            onClick={() => setAttendanceStatusFilter(attendanceStatusFilter === 'approved' ? 'all' : 'approved')}
                            className={`p-6 rounded-2xl border transition-all flex flex-col justify-between min-h-[150px] text-left ${
                                attendanceStatusFilter === 'approved' ? "border-green-500 bg-green-500/5 ring-1 ring-green-500/20 shadow-lg shadow-green-500/5" : "border-gray-800 bg-[#0B0D11] hover:border-gray-700/50"
                            }`}
                        >
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/40">Approved</span>
                            <div className="text-4xl font-bold text-white leading-none">{approvedCount}</div>
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-green-500">Verified</span>
                        </button>
                        <button
                            onClick={() => setAttendanceStatusFilter(attendanceStatusFilter === 'pending' ? 'all' : 'pending')}
                            className={`p-6 rounded-2xl border transition-all flex flex-col justify-between min-h-[150px] text-left ${
                                attendanceStatusFilter === 'pending' ? "border-yellow-500 bg-yellow-500/5 ring-1 ring-yellow-500/20 shadow-lg shadow-yellow-500/5" : "border-gray-800 bg-[#0B0D11] hover:border-gray-700/50"
                            }`}
                        >
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/40">Pending</span>
                            <div className="text-4xl font-bold text-white leading-none">{pendingCount}</div>
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-yellow-500">Awaiting Approval</span>
                        </button>
                        <button
                            onClick={() => setAttendanceStatusFilter(attendanceStatusFilter === 'rejected' ? 'all' : 'rejected')}
                            className={`p-6 rounded-2xl border transition-all flex flex-col justify-between min-h-[150px] text-left ${
                                attendanceStatusFilter === 'rejected' ? "border-red-500 bg-red-500/5 ring-1 ring-red-500/20 shadow-lg shadow-red-500/5" : "border-gray-800 bg-[#0B0D11] hover:border-gray-700/50"
                            }`}
                        >
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/40">Rejected</span>
                            <div className="text-4xl font-bold text-white leading-none">{rejectedCount}</div>
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-red-500">Declined</span>
                        </button>
                    </div>

                    {/* Filter Bar */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 bg-panel border border-gray-700 p-4 rounded-xl">
                        <div className="flex items-center gap-2 text-sm text-primary font-semibold">
                            <Filter size={16} />
                            Filters
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-muted uppercase tracking-wider font-semibold">From</label>
                            <input
                                type="date"
                                value={attendanceFromDate}
                                onChange={e => setAttendanceFromDate(e.target.value)}
                                className="rounded-lg border border-gray-700 bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-muted uppercase tracking-wider font-semibold">To</label>
                            <input
                                type="date"
                                value={attendanceToDate}
                                onChange={e => setAttendanceToDate(e.target.value)}
                                className="rounded-lg border border-gray-700 bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-muted uppercase tracking-wider font-semibold">Status</label>
                            <select
                                value={attendanceStatusFilter}
                                onChange={e => setAttendanceStatusFilter(e.target.value as any)}
                                className="rounded-lg border border-gray-700 bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none appearance-none cursor-pointer min-w-[120px]"
                            >
                                <option value="all">All Status</option>
                                <option value="approved">Approved</option>
                                <option value="pending">Pending</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                        <div className="text-xs text-muted mt-1 sm:mt-0">
                            Showing {filteredEngineers.length + filteredLabours.length} of {allRecords.length} records
                        </div>
                    </div>

                    {/* Site Engineers Attendance */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                Engineers Attendance
                            </h2>
                            {(isProjectManager || isSiteEngineer) && (
                                <button
                                    onClick={() => {
                                        setIsLogAttendanceOpen(true);
                                        handleStartCamera();
                                    }}
                                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                                >
                                    <Camera size={16} /> Log Attendance
                                </button>
                            )}
                        </div>
                        <div className="overflow-x-auto rounded-xl border border-gray-700 bg-panel shadow-sm">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-surface text-muted border-b border-gray-700">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest">Name</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest">Date</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest">Check-In</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest">Check-Out</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest">Hours</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest">Status</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {filteredEngineers.length === 0 ? (
                                        <tr><td colSpan={7} className="px-6 py-8 text-center text-muted">No engineer attendance records found for this date range.</td></tr>
                                    ) : (
                                        filteredEngineers.map(record => (
                                            <>
                                                <tr
                                                    key={record._id}
                                                    className="hover:bg-surface/50 transition-colors"
                                                >
                                                    <td className="px-4 py-3 font-medium text-foreground">{record.employeeName}</td>
                                                    <td className="px-4 py-3 text-muted">{new Date(record.checkInTime).toLocaleDateString()}</td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            {record.inTimePhoto && (
                                                                <button onClick={(e) => { e.stopPropagation(); openPhotoViewer(record._id, 'in', filteredEngineers); }} className="relative group shrink-0">
                                                                    <img src={record.inTimePhoto} alt="Check-In" className="w-8 h-8 rounded-full border border-primary/50 object-cover" />
                                                                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        <Camera size={12} className="text-white" />
                                                                    </div>
                                                                </button>
                                                            )}
                                                            <span className="flex flex-col gap-1">
                                                                <span className="flex items-center gap-1 text-primary">
                                                                    <Clock size={13} />
                                                                    {new Date(record.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                                {record.location && record.location.latitude && (
                                                                    <span className="text-[10px] text-muted truncate max-w-[120px] flex items-center gap-1" title={record.location.address}>
                                                                        <MapPin size={10} /> {record.location.address || 'Geo-tagged'}
                                                                    </span>
                                                                )}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-muted">
                                                        {record.checkOutTime ? (
                                                            <div className="flex items-center gap-2">
                                                                {record.outTimePhoto && (
                                                                    <button onClick={(e) => { e.stopPropagation(); openPhotoViewer(record._id, 'out', filteredEngineers); }} className="relative group shrink-0">
                                                                        <img src={record.outTimePhoto} alt="Check-Out" className="w-8 h-8 rounded-full border border-gray-500 object-cover" />
                                                                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                            <Camera size={12} className="text-white" />
                                                                        </div>
                                                                    </button>
                                                                )}
                                                                <span className="flex flex-col gap-1">
                                                                    <span className="flex items-center gap-1 text-muted">
                                                                        <Clock size={13} />
                                                                        {new Date(record.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                    </span>
                                                                    {record.location && record.location.latitude && (
                                                                        <span className="text-[10px] text-muted truncate max-w-[120px] flex items-center gap-1">
                                                                            <MapPin size={10} /> Recorded
                                                                        </span>
                                                                    )}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-blue-400 italic">Active</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 font-mono font-medium text-foreground">
                                                        {record.totalHours ? `${record.totalHours.toFixed(1)}h` : '—'}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2 py-0.5 rounded-lg text-xs font-medium border ${
                                                            record.approvalStatus === 'approved' ? 'bg-primary/10 text-primary border-primary/20' :
                                                            record.approvalStatus === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                            'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                                        }`}>
                                                            {record.approvalStatus.charAt(0).toUpperCase() + record.approvalStatus.slice(1)}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="flex items-center justify-end gap-1">
                                                            {record.approvalStatus === 'pending' && (isProjectManager || isHRManager) && (
                                                                <>
                                                                    <button 
                                                                        onClick={(e) => { e.stopPropagation(); handleConfirmAttendance(record._id, 'approve'); }}
                                                                        disabled={isSubmittingAttendance}
                                                                        className="p-1.5 hover:bg-green-500/10 rounded-lg text-green-400 transition-colors"
                                                                        title="Approve"
                                                                    >
                                                                        <CheckCircle size={16} />
                                                                    </button>
                                                                    <button 
                                                                        onClick={(e) => { e.stopPropagation(); handleConfirmAttendance(record._id, 'reject'); }}
                                                                        disabled={isSubmittingAttendance}
                                                                        className="p-1.5 hover:bg-red-500/10 rounded-lg text-red-400 transition-colors"
                                                                        title="Reject"
                                                                    >
                                                                        <XCircle size={16} />
                                                                    </button>
                                                                </>
                                                            )}
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); handleDeleteAttendance(record._id); }}
                                                                disabled={isSubmittingAttendance}
                                                                className="p-1.5 hover:bg-red-500/10 rounded-lg text-red-400 transition-colors"
                                                                title="Delete record"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            </>
                                        ))
                                    )}
                                </tbody>
                            </table>
                </div>
            </div>
        </div>
            );
        })()}
            {/* --- MODALS --- */}

            {/* Log Labour Attendance Modal */}
            {isAddLabourOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-2xl rounded-xl border border-gray-700 bg-panel shadow-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-gray-700 p-4 sticky top-0 bg-panel z-10">
                            <h3 className="text-lg font-bold text-foreground">Log Labour Attendance</h3>
                            <button onClick={() => setIsAddLabourOpen(false)} className="text-muted hover:text-foreground transition-colors"><X size={20}/></button>
                        </div>
                        <form onSubmit={handleAddLabour} className="p-4 space-y-6">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-foreground">Date <span className="text-red-500">*</span></label>
                                <input readOnly type="date" value={newAggregate.date} className="w-full rounded-lg border border-gray-700 bg-surface/50 text-muted px-3 py-2 text-sm cursor-not-allowed focus:outline-none"/>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="font-medium text-foreground uppercase tracking-wider text-xs">Worker Entries</label>
                                    <button type="button" onClick={addEntry} className="text-primary hover:text-primary/80 transition-colors flex items-center gap-1 text-sm font-bold">
                                        <Plus size={14} /> Add Worker Type
                                    </button>
                                </div>
                                
                                {newAggregate.entries.map((entry, index) => (
                                    <div key={index} className="p-4 rounded-xl border border-gray-700 bg-surface/30 space-y-4 relative group">
                                        {newAggregate.entries.length > 1 && (
                                            <button type="button" onClick={() => removeEntry(index)} className="absolute top-2 right-2 text-muted hover:text-red-400 transition-colors p-1">
                                                <X size={16} />
                                            </button>
                                        )}
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            <div>
                                                <label className="mb-1 block text-xs font-semibold text-muted uppercase">Worker Type</label>
                                                <input 
                                                    required 
                                                    type="text" 
                                                    list="worker-types"
                                                    value={entry.workerType} 
                                                    onChange={e => updateEntry(index, 'workerType', e.target.value)} 
                                                    className="w-full rounded-lg border border-gray-700 bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none" 
                                                    placeholder="e.g. Mason, Helper..."
                                                />
                                                <datalist id="worker-types">
                                                    <option value="Supervisor" />
                                                    <option value="Mason" />
                                                    <option value="Male" />
                                                    <option value="Female" />
                                                    <option value="Stone Cutter" />
                                                    <option value="Centring Fitter" />
                                                    <option value="Cent-Helper" />
                                                    <option value="Electrician" />
                                                    <option value="Plumber" />
                                                    <option value="Carpenter" />
                                                    <option value="Painter" />
                                                    <option value="Tiles" />
                                                </datalist>
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-xs font-semibold text-muted uppercase">Count</label>
                                                <input 
                                                    required 
                                                    type="number" 
                                                    min="1" 
                                                    value={entry.count} 
                                                    onChange={e => updateEntry(index, 'count', e.target.value)} 
                                                    className="w-full rounded-lg border border-gray-700 bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none font-mono" 
                                                    placeholder="0"
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-xs font-semibold text-muted uppercase">Photo <span className="text-muted/50">(Optional)</span></label>
                                                {!entry.photo ? (
                                                    <label className="cursor-pointer flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-gray-700 bg-surface hover:bg-gray-700/50 transition-colors text-xs font-medium text-foreground w-full h-[38px]">
                                                        <Plus size={14} className="text-primary" />
                                                        <span>Upload</span>
                                                        <input type="file" accept="image/*" className="hidden" onChange={e => handlePhotoUpload(index, e)} />
                                                    </label>
                                                ) : (
                                                    <div className="relative w-full h-[38px] rounded-lg overflow-hidden border border-primary/50 group">
                                                        <img src={entry.photo} alt="Worker" className="h-full w-full object-cover" />
                                                        <button 
                                                            type="button" 
                                                            onClick={() => updateEntry(index, 'photo', '')} 
                                                            className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-bold gap-2"
                                                        >
                                                            <Trash2 size={14} /> Remove
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-xs font-semibold text-muted uppercase">Group Notes <span className="text-muted/50">(Optional)</span></label>
                                            <textarea 
                                                rows={1}
                                                value={entry.notes || ""} 
                                                onChange={e => updateEntry(index, 'notes', e.target.value)} 
                                                className="w-full rounded-lg border border-gray-700 bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none resize-none" 
                                                placeholder="Notes for this group of workers..."
                                            />
                                        </div>

                                        {/* Name List Toggle */}
                                        <div className="flex items-center gap-2 mt-4 border-t border-gray-700/50 pt-4">
                                            <input 
                                                type="checkbox" 
                                                id={`toggle-${index}`} 
                                                className="rounded border-gray-700 text-primary focus:ring-primary h-4 w-4 bg-surface cursor-pointer"
                                                checked={entry.addNamesToggle || false}
                                                onChange={(e) => updateEntry(index, 'addNamesToggle', e.target.checked)}
                                            />
                                            <label htmlFor={`toggle-${index}`} className="text-xs font-semibold text-foreground uppercase cursor-pointer">Add Names for Each Worker</label>
                                        </div>

                                        {entry.addNamesToggle && (
                                            <div className="space-y-3 mt-4 pl-4 border-l-2 border-gray-700">
                                                {entry.individuals?.map((ind, i) => (
                                                    <div key={i} className="flex flex-col gap-3 bg-panel/50 p-3 rounded-lg border border-gray-700">
                                                        <div>
                                                            <label className="mb-1 block text-xs font-semibold text-muted uppercase">Worker {i + 1} Name</label>
                                                            <input 
                                                                type="text" 
                                                                value={ind.name} 
                                                                onChange={e => updateEntry(index, 'individuals_name', { indIndex: i, val: e.target.value })} 
                                                                className="w-full rounded-lg border border-gray-700 bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none" 
                                                                placeholder="Full name"
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                                {entry.individuals?.length === 0 && (
                                                    <div className="text-xs text-muted italic">Increase count to add names based on the number of workers.</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-foreground">General Notes <span className="text-muted text-xs">(Optional)</span></label>
                                <textarea rows={2} value={newAggregate.notes} onChange={e => setNewAggregate({...newAggregate, notes: e.target.value})} className="w-full rounded-lg border border-gray-700 bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none resize-none" placeholder="E.g. Concrete pouring day"/>
                            </div>
                            <div className="flex justify-end gap-2 pt-4 border-t border-gray-700 mt-6 sticky bottom-0 bg-panel z-10 pb-2">
                                <button type="button" onClick={() => setIsAddLabourOpen(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-muted hover:text-foreground hover:bg-surface">Cancel</button>
                                <button type="submit" className="rounded-lg bg-primary px-6 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">Log Attendance</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Material Modal */}
            {isAddMaterialOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-xl border border-gray-700 bg-panel shadow-lg">
                        <div className="flex items-center justify-between border-b border-gray-700 p-4">
                            <h3 className="text-lg font-bold text-foreground">Add Material Stock</h3>
                            <button onClick={() => setIsAddMaterialOpen(false)} className="text-muted hover:text-foreground transition-colors"><X size={20}/></button>
                        </div>
                        <form onSubmit={handleAddMaterial} className="p-4 space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-foreground">Material Name <span className="text-red-500">*</span></label>
                                <input 
                                    required 
                                    type="text" 
                                    list="material-names"
                                    value={newMaterial.item} 
                                    onChange={e => setNewMaterial({...newMaterial, item: e.target.value})} 
                                    className="w-full rounded-lg border border-gray-700 bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none" 
                                    placeholder="E.g. Cement (UltraTech)"
                                />
                                <datalist id="material-names">
                                    <option value="Cement (UltraTech)" />
                                    <option value="Cement (ACC)" />
                                    <option value="Cement (Ambuja)" />
                                    <option value="Sand (M-Sand)" />
                                    <option value="Sand (P-Sand)" />
                                    <option value="Steel (8mm)" />
                                    <option value="Steel (10mm)" />
                                    <option value="Steel (12mm)" />
                                    <option value="Steel (16mm)" />
                                    <option value="Aggregates (20mm)" />
                                    <option value="Aggregates (40mm)" />
                                    <option value="Bricks (Red)" />
                                    <option value="Solid Blocks (4 inch)" />
                                    <option value="Solid Blocks (6 inch)" />
                                    <option value="Solid Blocks (8 inch)" />
                                    <option value="Binding Wire" />
                                    <option value="Wood (Teak)" />
                                    <option value="Wood (Sall)" />
                                    <option value="Electrical Conduits" />
                                    <option value="Plumbing Pipes (PVC)" />
                                    <option value="Plumbing Pipes (CPVC)" />
                                    <option value="Floor Tiles" />
                                    <option value="Wall Tiles" />
                                    <option value="Granite" />
                                    <option value="Marble" />
                                    <option value="Paint (Primer)" />
                                    <option value="Paint (Emulsion)" />
                                    <option value="Water Tank" />
                                </datalist>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-foreground">Quantity <span className="text-red-500">*</span></label>
                                    <input required type="number" step="0.5" min="0" value={newMaterial.quantity} onChange={e => setNewMaterial({...newMaterial, quantity: e.target.value})} className="w-full rounded-lg border border-gray-700 bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none font-mono" placeholder="100"/>
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-foreground">Unit <span className="text-red-500">*</span></label>
                                    <select value={newMaterial.unit} onChange={e => setNewMaterial({...newMaterial, unit: e.target.value})} className="w-full rounded-lg border border-gray-700 bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none">
                                        <option value="Nos">Nos</option>
                                        <option value="Bags">Bags</option>
                                        <option value="Tons">Tons</option>
                                        <option value="Kg">Kg</option>
                                        <option value="Ltrs">Ltrs</option>
                                        <option value="Units">Units</option>
                                        <option value="Cu.Ft">Cu.Ft</option>
                                        <option value="Sq.Ft">Sq.Ft</option>
                                        <option value="R.Ft">R.Ft</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-foreground">Lorry No <span className="text-muted text-xs">(Optional)</span></label>
                                    <input type="text" value={newMaterial.lorryNo || ""} onChange={e => setNewMaterial({...newMaterial, lorryNo: e.target.value})} className="w-full rounded-lg border border-gray-700 bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none" placeholder="KA 01 AB 1234"/>
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-foreground">Lorry Measurement <span className="text-muted text-xs">(Optional)</span></label>
                                    <input type="text" value={newMaterial.lorryMeasurements || ""} onChange={e => setNewMaterial({...newMaterial, lorryMeasurements: e.target.value})} className="w-full rounded-lg border border-gray-700 bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none font-mono" placeholder="e.g. 400 Cu.Ft"/>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-4 border-t border-gray-700 mt-6">
                                <button type="button" onClick={() => setIsAddMaterialOpen(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-muted hover:text-foreground hover:bg-surface">Cancel</button>
                                <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-black hover:bg-primary-hover shadow-lg shadow-primary/20">Save Stock</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Request Refund Modal */}
            {isRequestRefundOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-xl border border-gray-700 bg-panel shadow-lg">
                        <div className="flex items-center justify-between border-b border-gray-700 p-4">
                            <h3 className="text-lg font-bold text-foreground">Request Stock Refund</h3>
                            <button onClick={() => setIsRequestRefundOpen(false)} className="text-muted hover:text-foreground transition-colors"><X size={20}/></button>
                        </div>
                        <form onSubmit={handleRequestRefund} className="p-4 space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-foreground">Material Name <span className="text-red-500">*</span></label>
                                <select 
                                    required 
                                    value={newRefundRequest.materialName} 
                                    onChange={e => {
                                        const mat = materials.find(m => m.item === e.target.value);
                                        setNewRefundRequest({
                                            ...newRefundRequest, 
                                            materialName: e.target.value,
                                            unit: mat ? mat.unit : newRefundRequest.unit
                                        });
                                    }} 
                                    className="w-full rounded-lg border border-gray-700 bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                                >
                                    <option value="">Select Material from Stock</option>
                                    {materials.map(m => (
                                        <option key={m._id} value={m.item}>{m.item} (Available: {m.quantity} {m.unit})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-foreground">Quantity <span className="text-red-500">*</span></label>
                                    <input required type="number" step="0.5" min="0" value={newRefundRequest.quantity} onChange={e => setNewRefundRequest({...newRefundRequest, quantity: e.target.value})} className="w-full rounded-lg border border-gray-700 bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none font-mono" placeholder="10"/>
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-foreground">Unit <span className="text-red-500">*</span></label>
                                    <select value={newRefundRequest.unit} onChange={e => setNewRefundRequest({...newRefundRequest, unit: e.target.value})} className="w-full rounded-lg border border-gray-700 bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none">
                                        <option value="Nos">Nos</option>
                                        <option value="Bags">Bags</option>
                                        <option value="Tons">Tons</option>
                                        <option value="Kg">Kg</option>
                                        <option value="Ltrs">Ltrs</option>
                                        <option value="Units">Units</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-foreground">Reason for Refund <span className="text-red-500">*</span></label>
                                <textarea required rows={3} value={newRefundRequest.reason} onChange={e => setNewRefundRequest({...newRefundRequest, reason: e.target.value})} className="w-full rounded-lg border border-gray-700 bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none resize-none" placeholder="E.g. Project scope reduced, surplus material..."/>
                            </div>
                            <div className="flex justify-end gap-2 pt-4 border-t border-gray-700 mt-6">
                                <button type="button" onClick={() => setIsRequestRefundOpen(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-muted hover:text-foreground hover:bg-surface">Cancel</button>
                                <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Send Request</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Allocate Petty Cash Modal */}
            {isAllocatePettyCashOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-xl border border-gray-700 bg-panel shadow-lg">
                        <div className="flex items-center justify-between border-b border-gray-700 p-4">
                            <h3 className="text-lg font-bold text-foreground">Allocate Petty Cash</h3>
                            <button onClick={() => setIsAllocatePettyCashOpen(false)} className="text-muted hover:text-foreground transition-colors"><X size={20}/></button>
                        </div>
                        <form onSubmit={(e) => handlePettyCashSubmit(e, "Allocation")} className="p-4 space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-foreground">Reference / Title <span className="text-red-500">*</span></label>
                                <input required type="text" value={newPettyCash.title} onChange={e => setNewPettyCash({...newPettyCash, title: e.target.value})} className="w-full rounded-lg border border-gray-700 bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none" placeholder="E.g. Weekly Allocation"/>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-foreground">Amount (₹) <span className="text-red-500">*</span></label>
                                <input required type="number" min="1" value={newPettyCash.amount} onChange={e => setNewPettyCash({...newPettyCash, amount: e.target.value})} className="w-full rounded-lg border border-gray-700 bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none font-mono" placeholder="10000"/>
                            </div>
                            <div className="flex justify-end gap-2 pt-4 border-t border-gray-700 mt-6">
                                <button type="button" onClick={() => setIsAllocatePettyCashOpen(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-muted hover:text-foreground hover:bg-surface">Cancel</button>
                                <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Allocate</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Log Petty Cash Expense Modal */}
            {isLogPettyCashExpenseOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-xl border border-gray-700 bg-panel shadow-lg">
                        <div className="flex items-center justify-between border-b border-gray-700 p-4">
                            <h3 className="text-lg font-bold text-foreground">Log Petty Cash Expense</h3>
                            <button onClick={() => setIsLogPettyCashExpenseOpen(false)} className="text-muted hover:text-foreground transition-colors"><X size={20}/></button>
                        </div>
                        <form onSubmit={(e) => handlePettyCashSubmit(e, "Expense")} className="p-4 space-y-4">
                            {pettyCashSummary && (
                                <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-xs text-primary flex items-center gap-2">
                                    <Wallet size={14} />
                                    Available Balance: <span className="font-bold">₹{pettyCashSummary.balance.toLocaleString('en-IN')}</span>
                                </div>
                            )}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-foreground">Expense Description <span className="text-red-500">*</span></label>
                                <input required type="text" value={newPettyCash.title} onChange={e => setNewPettyCash({...newPettyCash, title: e.target.value})} className="w-full rounded-lg border border-gray-700 bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none" placeholder="E.g. Travel to Hardware Store"/>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-foreground">Amount Spent (₹) <span className="text-red-500">*</span></label>
                                <input required type="number" min="1" value={newPettyCash.amount} onChange={e => setNewPettyCash({...newPettyCash, amount: e.target.value})} className="w-full rounded-lg border border-gray-700 bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none font-mono" placeholder="500"/>
                            </div>
                            <div className="flex justify-end gap-2 pt-4 border-t border-gray-700 mt-6">
                                <button type="button" onClick={() => setIsLogPettyCashExpenseOpen(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-muted hover:text-foreground hover:bg-surface">Cancel</button>
                                <button type="submit" className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">Log Expense</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Report Issue Modal */}
            {isReportIssueOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-xl border border-gray-700 bg-panel shadow-lg">
                        <div className="flex items-center justify-between border-b border-gray-700 p-4">
                            <h3 className="text-lg font-bold text-foreground">Report Site Issue</h3>
                            <button onClick={() => setIsReportIssueOpen(false)} className="text-muted hover:text-foreground transition-colors"><X size={20}/></button>
                        </div>
                        <form onSubmit={handleReportIssue} className="p-4 space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-foreground">Issue Title <span className="text-red-500">*</span></label>
                                <input required type="text" value={newIssue.title} onChange={e => setNewIssue({...newIssue, title: e.target.value})} className="w-full rounded-lg border border-gray-700 bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none" placeholder="E.g. Material shortage, Safety hazard..."/>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-foreground">Description</label>
                                <textarea rows={3} value={newIssue.description} onChange={e => setNewIssue({...newIssue, description: e.target.value})} className="w-full rounded-lg border border-gray-700 bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none resize-none" placeholder="Provide details about the issue..."/>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-foreground">Send To (Optional)</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={newIssue.sentTo.includes('Project Manager')}
                                            onChange={(e) => {
                                                if (e.target.checked) setNewIssue({...newIssue, sentTo: [...newIssue.sentTo, 'Project Manager']})
                                                else setNewIssue({...newIssue, sentTo: newIssue.sentTo.filter(r => r !== 'Project Manager')})
                                            }}
                                            className="rounded border-gray-700 bg-surface accent-primary" 
                                        />
                                        Project Manager
                                    </label>
                                    <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={newIssue.sentTo.includes('HR')}
                                            onChange={(e) => {
                                                if (e.target.checked) setNewIssue({...newIssue, sentTo: [...newIssue.sentTo, 'HR']})
                                                else setNewIssue({...newIssue, sentTo: newIssue.sentTo.filter(r => r !== 'HR')})
                                            }}
                                            className="rounded border-gray-700 bg-surface accent-primary" 
                                        />
                                        HR Wait List
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-foreground">Priority</label>
                                <select value={newIssue.priority} onChange={e => setNewIssue({...newIssue, priority: e.target.value as any})} className="w-full rounded-lg border border-gray-700 bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none">
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                    <option value="Critical">Critical</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-2 pt-4 border-t border-gray-700 mt-6">
                                <button type="button" onClick={() => setIsReportIssueOpen(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-muted hover:text-foreground hover:bg-surface">Cancel</button>
                                <button type="submit" className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">Submit Report</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Log Attendance with Camera */}
            {isLogAttendanceOpen && (() => {
                return (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md bg-panel border border-gray-700 rounded-xl shadow-2xl overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between border-b border-gray-700 px-6 py-4 bg-surface">
                            <div>
                                <h3 className="text-lg font-bold text-foreground">Log Staff Attendance</h3>
                                <p className="text-xs text-muted">Capture a geo-tagged photo to verify identity and location.</p>
                            </div>
                            <button onClick={closeAttendanceModal} className="text-muted hover:text-foreground transition-colors p-1 rounded-lg hover:bg-gray-800">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4 flex flex-col items-center">
                            {cameraError && (
                                <div className="text-sm text-red-400 bg-red-400/10 p-3 rounded-lg border border-red-400/20 w-full text-center">
                                    {cameraError}
                                </div>
                            )}

                            <div className="group relative w-full aspect-video bg-black rounded-lg overflow-hidden border border-gray-700">
                                {!capturedPhoto ? (
                                    <>
                                        <video 
                                            ref={videoRef} 
                                            autoPlay 
                                            playsInline 
                                            muted 
                                            className="w-full h-full object-cover"
                                        />
                                        {isCameraActive && (
                                            <>
                                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button 
                                                        onClick={toggleCamera}
                                                        className="bg-black/50 hover:bg-black/70 text-white rounded-lg px-3 py-1.5 text-xs font-medium backdrop-blur-md transition-colors"
                                                    >
                                                        Switch Camera
                                                    </button>
                                                </div>
                                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                                                    <button 
                                                        onClick={handleCameraCapture}
                                                        className="w-12 h-12 bg-white rounded-full border-4 border-primary/50 flex items-center justify-center hover:scale-105 transition-transform"
                                                        title="Capture Photo"
                                                    />
                                                </div>
                                            </>
                                        )}
                                        {!isCameraActive && !cameraError && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="text-muted text-sm flex items-center gap-2">
                                                    <div className="inline-block w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                                    Starting Camera...
                                                </span>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <img src={capturedPhoto} alt="Captured" className="w-full h-full object-cover" />
                                        <button 
                                            onClick={() => handleStartCamera(cameraFacingMode)}
                                            className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-lg px-3 py-1.5 text-xs font-medium backdrop-blur-md transition-colors"
                                        >
                                            Retake
                                        </button>
                                    </>
                                )}
                            </div>
                            
                            {capturedPhoto && (
                                <div className="flex items-center gap-2 text-xs text-muted bg-surface/50 border border-gray-700 rounded-lg px-3 py-2 w-full justify-center">
                                    <MapPin size={14} className="text-primary" />
                                    <span>Location and time will be automatically tagged.</span>
                                </div>
                            )}

                            <div className="flex w-full mt-4 justify-center">
                                {!isCurrentlyCheckedIn ? (
                                    <button 
                                        onClick={() => submitAttendance('check-in')}
                                        disabled={!capturedPhoto || isSubmittingAttendance}
                                        className="w-full rounded-lg bg-green-500/20 text-green-500 border border-green-500/30 px-4 py-3 font-semibold hover:bg-green-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                    >
                                        Check In
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => submitAttendance('check-out')}
                                        disabled={!capturedPhoto || isSubmittingAttendance}
                                        className="w-full rounded-lg bg-red-500/20 text-red-500 border border-red-500/30 px-4 py-3 font-semibold hover:bg-red-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                    >
                                        Check Out
                                    </button>
                                )}
                            </div>
                            {isSubmittingAttendance && (
                                <p className="text-xs text-primary animate-pulse text-center w-full mt-2">Uploading photo and logging attendance...</p>
                            )}
                        </div>
                    </div>
                </div>
                );
            })()}

            {/* Photo Viewer Modal */}
            {photoViewerOpen && currentViewerPhotos.length > 0 && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
                    <div className="absolute top-4 right-4 z-50 flex items-center gap-4">
                        <span className="text-white/70 text-sm font-medium">
                            {currentViewerIndex + 1} / {currentViewerPhotos.length}
                        </span>
                        <button onClick={() => setPhotoViewerOpen(false)} className="text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-2 rounded-full">
                            <X size={24} />
                        </button>
                    </div>
                    
                    <button 
                        onClick={() => setCurrentViewerIndex(prev => (prev - 1 + currentViewerPhotos.length) % currentViewerPhotos.length)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    
                    <button 
                        onClick={() => setCurrentViewerIndex(prev => (prev + 1) % currentViewerPhotos.length)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all"
                    >
                        <ArrowRight size={24} />
                    </button>

                    <div className="relative max-w-5xl max-h-[85vh] flex flex-col items-center">
                        <img 
                            src={currentViewerPhotos[currentViewerIndex].url} 
                            alt="Attendance Photo" 
                            className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl border border-white/20"
                        />
                        <div className="mt-4 text-center bg-black/60 px-6 py-4 rounded-xl backdrop-blur-md border border-white/10 flex flex-col gap-2">
                            <h3 className="text-xl font-bold text-white mb-1 flex items-center justify-center gap-2">
                                {currentViewerPhotos[currentViewerIndex].type === 'in' ? <ArrowDownRight size={20} className="text-green-400" /> : <ArrowUpRight size={20} className="text-red-400" />}
                                {currentViewerPhotos[currentViewerIndex].title}
                            </h3>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-white/80">
                                <span className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg">
                                    <Clock size={16} className="text-primary" />
                                    {currentViewerPhotos[currentViewerIndex].time}
                                </span>
                                <span className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg max-w-sm text-left line-clamp-2">
                                    <MapPin size={16} className="text-primary shrink-0" />
                                    {currentViewerPhotos[currentViewerIndex].location}
                                </span>
                            </div>
                            <p className="text-xs text-white/50 mt-1">Use arrow keys to navigate</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
