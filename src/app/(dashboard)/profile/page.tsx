"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import Image from "next/image";
import { useState, useEffect } from "react";
import { CameraIcon } from "./_components/icons";
import { SocialAccounts } from "./_components/social-accounts";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  position?: string;
  employeeId?: string;
  department: {
    id: string;
    name: string;
    code: string;
  };
  role: {
    id: string;
    name: string;
    level: string;
  };
  _count: {
    createdPrograms: number;
    assignedActivities: number;
  };
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [coverPhoto, setCoverPhoto] = useState("/images/cover/cover-01.png");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // TODO: Get user ID from session/auth
  // For now, using first user as example
  const currentUserId = "clzxj8k7q0000v6h9p3r5u8k2"; // Replace with actual session

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/profile?userId=${currentUserId}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }

      const data = await response.json();
      setProfile(data.data);
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>, type: "avatar" | "cover") => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview
    const previewUrl = URL.createObjectURL(file);
    
    if (type === "cover") {
      setCoverPhoto(previewUrl);
    } else {
      // For avatar, update local state
      if (profile) {
        setProfile({ ...profile, avatar: previewUrl });
      }
    }

    // TODO: Upload to server/cloud storage
    // For now, just using preview URL
    try {
      setUploading(true);
      
      // Simulate upload (replace with actual upload logic)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update profile in database
      if (type === "avatar") {
        await updateProfile({ avatar: previewUrl });
      }
      
    } catch (error) {
      console.error("Error uploading photo:", error);
    } finally {
      setUploading(false);
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUserId,
          ...data,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const result = await response.json();
      setProfile(result.data);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[970px]">
        <Breadcrumb pageName="Profile" />
        <div className="rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark dark:shadow-card">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto w-full max-w-[970px]">
        <Breadcrumb pageName="Profile" />
        <div className="rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark dark:shadow-card">
          <div className="text-center text-red-600">Profile not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[970px]">
      <Breadcrumb pageName="Profile" />

      <div className="overflow-hidden rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
        {/* Cover Photo */}
        <div className="relative z-20 h-35 md:h-65">
          <Image
            src={coverPhoto}
            alt="profile cover"
            className="h-full w-full rounded-tl-[10px] rounded-tr-[10px] object-cover object-center"
            width={970}
            height={260}
            style={{
              width: "auto",
              height: "auto",
            }}
          />
          <div className="absolute bottom-1 right-1 z-10 xsm:bottom-4 xsm:right-4">
            <label
              htmlFor="cover"
              className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-[15px] py-[5px] text-body-sm font-medium text-white hover:bg-opacity-90"
            >
              <input
                type="file"
                name="coverPhoto"
                id="cover"
                className="sr-only"
                onChange={(e) => handlePhotoChange(e, "cover")}
                accept="image/png, image/jpg, image/jpeg"
                disabled={uploading}
              />
              <CameraIcon />
              <span>{uploading ? "Uploading..." : "Edit"}</span>
            </label>
          </div>
        </div>

        {/* Profile Content */}
        <div className="px-4 pb-6 text-center lg:pb-8 xl:pb-11.5">
          {/* Profile Photo */}
          <div className="relative z-30 mx-auto -mt-22 h-30 w-full max-w-30 rounded-full bg-white/20 p-1 backdrop-blur sm:h-44 sm:max-w-[176px] sm:p-3">
            <div className="relative drop-shadow-2">
              <Image
                src={profile.avatar || "/images/user/user-03.png"}
                width={160}
                height={160}
                className="overflow-hidden rounded-full object-cover"
                alt="profile"
              />
              <label
                htmlFor="profilePhoto"
                className="absolute bottom-0 right-0 flex size-8.5 cursor-pointer items-center justify-center rounded-full bg-primary text-white hover:bg-opacity-90 sm:bottom-2 sm:right-2"
              >
                <CameraIcon />
                <input
                  type="file"
                  name="profilePhoto"
                  id="profilePhoto"
                  className="sr-only"
                  onChange={(e) => handlePhotoChange(e, "avatar")}
                  accept="image/png, image/jpg, image/jpeg"
                  disabled={uploading}
                />
              </label>
            </div>
          </div>

          {/* Profile Info */}
          <div className="mt-4">
            <h3 className="mb-1 text-heading-6 font-bold text-dark dark:text-white">
              {profile.name}
            </h3>
            <p className="font-medium text-dark-4 dark:text-dark-6">
              {profile.position || profile.role.name}
            </p>
            
            {/* Stats */}
            <div className="mx-auto mb-5.5 mt-5 grid max-w-[370px] grid-cols-3 rounded-[5px] border border-stroke py-[9px] shadow-1 dark:border-dark-3 dark:bg-dark-2 dark:shadow-card">
              <div className="flex flex-col items-center justify-center gap-1 border-r border-stroke px-4 dark:border-dark-3 xsm:flex-row">
                <span className="font-medium text-dark dark:text-white">
                  {profile._count.createdPrograms}
                </span>
                <span className="text-body-sm">Programs</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-1 border-r border-stroke px-4 dark:border-dark-3 xsm:flex-row">
                <span className="font-medium text-dark dark:text-white">
                  {profile._count.assignedActivities}
                </span>
                <span className="text-body-sm">Activities</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-1 px-4 xsm:flex-row">
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                  {profile.role.name}
                </span>
              </div>
            </div>

            {/* Profile Details */}
            <div className="mx-auto max-w-[720px]">
              <div className="mb-6 grid gap-4 text-left sm:grid-cols-2">
                <div>
                  <h4 className="mb-1 text-sm font-medium text-dark-4 dark:text-dark-6">
                    Email
                  </h4>
                  <p className="text-dark dark:text-white">{profile.email}</p>
                </div>
                <div>
                  <h4 className="mb-1 text-sm font-medium text-dark-4 dark:text-dark-6">
                    Phone
                  </h4>
                  <p className="text-dark dark:text-white">{profile.phone || "-"}</p>
                </div>
                <div>
                  <h4 className="mb-1 text-sm font-medium text-dark-4 dark:text-dark-6">
                    Department
                  </h4>
                  <p className="text-dark dark:text-white">{profile.department.name}</p>
                </div>
                <div>
                  <h4 className="mb-1 text-sm font-medium text-dark-4 dark:text-dark-6">
                    Employee ID
                  </h4>
                  <p className="text-dark dark:text-white">{profile.employeeId || "-"}</p>
                </div>
              </div>

              <h4 className="font-medium text-dark dark:text-white">
                About Me
              </h4>
              <p className="mt-4 text-dark-4 dark:text-dark-6">
                {profile.position 
                  ? `${profile.position} at ${profile.department.name}`
                  : `Working as ${profile.role.name} with focus on CSR program management and community development.`
                }
              </p>
            </div>

            <SocialAccounts />
          </div>
        </div>
      </div>
    </div>
  );
}
