"use client";

import { useState, useEffect } from "react";
import { User, Mail, Briefcase, Edit2, Save, X } from "lucide-react";

interface UserProfile {
    name: string;
    role: string;
    email: string;
}

const defaultProfiles: Record<string, UserProfile> = {
    Engineer: {
        name: "Alex Morgan",
        role: "Site Engineer",
        email: "alex.morgan@destylus.com",
    },
    "Site Engineer": {
        name: "Alex Morgan",
        role: "Site Engineer",
        email: "alex.morgan@destylus.com",
    },
    "Project Manager": {
        name: "Sarah Connor",
        role: "Project Manager",
        email: "sarah.connor@destylus.com",
    },
    "HR Manager": {
        name: "Diana Prince",
        role: "HR Manager",
        email: "diana.prince@destylus.com",
    },
};

export default function ProfilePage() {
    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState<UserProfile>({
        name: "",
        role: "",
        email: "",
    });
    const [formData, setFormData] = useState<UserProfile>({
        name: "",
        role: "",
        email: "",
    });

    useEffect(() => {
        const role = localStorage.getItem("userRole") || "Engineer";
        const userName = localStorage.getItem("userName") || "";
        const storageKey = `destylus_user_profile_${role}`;
        const savedProfile = localStorage.getItem(storageKey);

        if (savedProfile) {
            const parsed = JSON.parse(savedProfile);
            // Only keep the 3 relevant fields
            const cleanProfile: UserProfile = {
                name: parsed.name || userName || defaultProfiles[role]?.name || "User",
                role: parsed.role || role,
                email: parsed.email || defaultProfiles[role]?.email || "",
            };
            setProfile(cleanProfile);
            setFormData(cleanProfile);
        } else {
            const fallback = defaultProfiles[role] || defaultProfiles["Engineer"];
            const initialProfile: UserProfile = {
                name: userName || fallback.name,
                role: role || fallback.role,
                email: fallback.email,
            };
            setProfile(initialProfile);
            setFormData(initialProfile);
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

    const getAvatarColor = () => {
        if (profile.role.includes("Project") && profile.role.includes("Manager")) {
            return "bg-orange-300 border-orange-400/20";
        }
        if (profile.role === "HR Manager") {
            return "bg-primary border-primary/20";
        }
        return "bg-orange-100 border-orange-200";
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between border-b border-gray-700 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
                    <p className="text-muted">Manage your profile information.</p>
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
                        <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-4 text-4xl font-bold text-black border-2 ${getAvatarColor()}`}>
                            {profile.name.charAt(0)}
                        </div>
                        <h2 className="text-xl font-bold text-foreground">{profile.name}</h2>
                        <p className="text-muted">{profile.role}</p>
                    </div>
                </div>

                {/* Details */}
                <div className="col-span-1 md:col-span-2 space-y-6">
                    <div className="bg-panel border border-gray-700 rounded-xl p-6 space-y-6">
                        <h3 className="text-lg font-semibold text-foreground border-b border-gray-700 pb-2 mb-4">
                            Profile Details
                        </h3>

                        <div className="space-y-6">
                            {/* Full Name */}
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

                            {/* Email ID */}
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

                            {/* Role */}
                            <div className="space-y-2">
                                <label className="text-sm text-muted flex items-center gap-2">
                                    <Briefcase size={14} /> Role
                                </label>
                                <p className="text-foreground font-medium text-lg opacity-70 cursor-not-allowed" title="Role cannot be changed">
                                    {profile.role}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
