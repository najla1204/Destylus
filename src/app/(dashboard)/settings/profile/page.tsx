"use client";

import { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Briefcase, Hash, Calendar, Edit2, Save, X } from "lucide-react";

interface UserProfile {
    name: string;
    employeeId: string;
    role: string;
    phone: string;
    email: string;
    address: string;
    dob: string;
    joiningDate: string;
}

const engineerProfile: UserProfile = {
    name: "Alex Morgan",
    employeeId: "ENG-2023-042",
    role: "Senior Site Engineer",
    phone: "+91 98765 43210",
    email: "alex.morgan@destylus.com",
    address: "Block B, Green Valley Apartments, Downtown District",
    dob: "1990-05-15",
    joiningDate: "2023-01-10",
};

const pmProfile: UserProfile = {
    name: "Sarah Connor",
    employeeId: "PM-2022-001",
    role: "Project Manager",
    phone: "+91 98765 12345",
    email: "sarah.connor@destylus.com",
    address: "Skyline Tower, Executive Suite 404, Business District",
    dob: "1985-08-20",
    joiningDate: "2022-03-15",
};

export default function ProfilePage() {
    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState<UserProfile>(engineerProfile);
    const [formData, setFormData] = useState<UserProfile>(engineerProfile);

    useEffect(() => {
        const role = localStorage.getItem("userRole") || "Engineer";
        const storageKey = `destylus_user_profile_${role}`;
        const savedProfile = localStorage.getItem(storageKey);

        if (savedProfile) {
            const parsed = JSON.parse(savedProfile);
            if (JSON.stringify(parsed) !== JSON.stringify(profile)) {
                setProfile(parsed);
                setFormData(parsed);
            }
        } else {
            const initialProfile = role === "Project Manager" ? pmProfile : engineerProfile;
            if (JSON.stringify(initialProfile) !== JSON.stringify(profile)) {
                setProfile(initialProfile);
                setFormData(initialProfile);
            }
        }
    }, []);

    const handleInputChange = (field: keyof UserProfile, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        setProfile(formData);
        const role = localStorage.getItem("userRole") || "Engineer";
        localStorage.setItem(`destylus_user_profile_${role}`, JSON.stringify(formData));
        setIsEditing(false);
    };

    const handleCancel = () => {
        setFormData(profile);
        setIsEditing(false);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between border-b border-gray-700 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
                    <p className="text-muted">Manage your personal and professional information.</p>
                </div>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-black font-semibold rounded-lg hover:bg-primary-hover transition-colors"
                    >
                        <Edit2 size={16} />
                        Edit Profile
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button
                            onClick={handleCancel}
                            className="flex items-center gap-2 px-4 py-2 bg-surface border border-gray-600 text-foreground font-semibold rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            <X size={16} />
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 px-4 py-2 bg-success text-black font-semibold rounded-lg hover:bg-success-hover transition-colors"
                        >
                            <Save size={16} />
                            Save Changes
                        </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Profile Card / Avatar */}
                <div className="col-span-1">
                    <div className="bg-panel border border-gray-700 rounded-xl p-6 flex flex-col items-center text-center">
                        <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-4 text-4xl font-bold text-black border-2
                            ${profile.role.includes('Manager') && profile.role.includes('Project') ? 'bg-orange-300 border-orange-400/20' :
                                profile.role === 'HR Manager' ? 'bg-primary border-primary/20' :
                                    'bg-orange-100 border-orange-200'}`}>
                            {profile.name.charAt(0)}
                        </div>
                        <h2 className="text-xl font-bold text-foreground">{profile.name}</h2>
                        <p className="text-muted">{profile.role}</p>
                        <div className="mt-4 px-3 py-1 bg-surface rounded-full text-xs font-mono text-gray-400">
                            ID: {profile.employeeId}
                        </div>
                    </div>
                </div>

                {/* Details Form/View */}
                <div className="col-span-1 md:col-span-2 space-y-6">
                    <div className="bg-panel border border-gray-700 rounded-xl p-6 space-y-6">
                        <h3 className="text-lg font-semibold text-foreground border-b border-gray-700 pb-2 mb-4">
                            Personal Details
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Name */}
                            <div className="space-y-2">
                                <label className="text-sm text-muted flex items-center gap-2">
                                    <User size={14} /> Full Name
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange("name", e.target.value)}
                                        className="w-full bg-surface p-2 rounded border border-gray-600 focus:border-primary focus:outline-none text-foreground"
                                    />
                                ) : (
                                    <p className="text-foreground font-medium text-lg">{profile.name}</p>
                                )}
                            </div>

                            {/* Working Field */}
                            <div className="space-y-2">
                                <label className="text-sm text-muted flex items-center gap-2">
                                    <Briefcase size={14} /> Working Field / Role
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.role}
                                        onChange={(e) => handleInputChange("role", e.target.value)}
                                        className="w-full bg-surface p-2 rounded border border-gray-600 focus:border-primary focus:outline-none text-foreground"
                                    />
                                ) : (
                                    <p className="text-foreground font-medium text-lg">{profile.role}</p>
                                )}
                            </div>

                            {/* Employee ID (Usually Read-only even in edit mode, but user asked to view/edit) */}
                            <div className="space-y-2">
                                <label className="text-sm text-muted flex items-center gap-2">
                                    <Hash size={14} /> Employee ID
                                </label>
                                <div className="text-foreground font-medium text-lg opacity-70 cursor-not-allowed" title="Employee ID cannot be changed">
                                    {profile.employeeId}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-panel border border-gray-700 rounded-xl p-6 space-y-6">
                        <h3 className="text-lg font-semibold text-foreground border-b border-gray-700 pb-2 mb-4">
                            Contact Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Phone */}
                            <div className="space-y-2">
                                <label className="text-sm text-muted flex items-center gap-2">
                                    <Phone size={14} /> Phone Number
                                </label>
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => handleInputChange("phone", e.target.value)}
                                        className="w-full bg-surface p-2 rounded border border-gray-600 focus:border-primary focus:outline-none text-foreground"
                                    />
                                ) : (
                                    <p className="text-foreground font-medium text-lg">{profile.phone}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <label className="text-sm text-muted flex items-center gap-2">
                                    <Mail size={14} /> Email ID
                                </label>
                                {isEditing ? (
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange("email", e.target.value)}
                                        className="w-full bg-surface p-2 rounded border border-gray-600 focus:border-primary focus:outline-none text-foreground"
                                    />
                                ) : (
                                    <p className="text-foreground font-medium text-lg">{profile.email}</p>
                                )}
                            </div>

                            {/* Address */}
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm text-muted flex items-center gap-2">
                                    <MapPin size={14} /> Address
                                </label>
                                {isEditing ? (
                                    <textarea
                                        value={formData.address}
                                        onChange={(e) => handleInputChange("address", e.target.value)}
                                        className="w-full bg-surface p-2 rounded border border-gray-600 focus:border-primary focus:outline-none text-foreground min-h-[80px]"
                                    />
                                ) : (
                                    <p className="text-foreground font-medium text-lg">{profile.address}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-panel border border-gray-700 rounded-xl p-6 space-y-6">
                        <h3 className="text-lg font-semibold text-foreground border-b border-gray-700 pb-2 mb-4">
                            Important Dates
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* DOB */}
                            <div className="space-y-2">
                                <label className="text-sm text-muted flex items-center gap-2">
                                    <Calendar size={14} /> Date of Birth
                                </label>
                                {isEditing ? (
                                    <input
                                        type="date"
                                        value={formData.dob}
                                        onChange={(e) => handleInputChange("dob", e.target.value)}
                                        className="w-full bg-surface p-2 rounded border border-gray-600 focus:border-primary focus:outline-none text-foreground"
                                    />
                                ) : (
                                    <p className="text-foreground font-medium text-lg">{profile.dob}</p>
                                )}
                            </div>

                            {/* Joining Date */}
                            <div className="space-y-2">
                                <label className="text-sm text-muted flex items-center gap-2">
                                    <Briefcase size={14} /> Date of Joining
                                </label>
                                {isEditing ? (
                                    <input
                                        type="date"
                                        value={formData.joiningDate}
                                        onChange={(e) => handleInputChange("joiningDate", e.target.value)}
                                        className="w-full bg-surface p-2 rounded border border-gray-600 focus:border-primary focus:outline-none text-foreground"
                                    />
                                ) : (
                                    <p className="text-foreground font-medium text-lg">{profile.joiningDate}</p>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
