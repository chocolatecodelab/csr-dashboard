"use client";

import { UploadIcon } from "@/assets/icons";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import Image from "next/image";
import { useState, useEffect } from "react";

interface CompanySettings {
  id: string;
  name: string;
  logo?: string;
}

export function UploadPhotoForm() {
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/settings");
      
      if (!response.ok) {
        throw new Error("Failed to fetch settings");
      }

      const data = await response.json();
      setSettings(data.data);
      setLogoPreview(data.data.logo || null);
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 800x800px recommended, but we check file size)
    if (file.size > 5 * 1024 * 1024) { // 5MB max
      alert("File size too large. Maximum 5MB allowed.");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = async () => {
      setLogoPreview(reader.result as string);

      // TODO: Upload to cloud storage (S3, Cloudinary, etc.)
      // For now, we just update with the preview URL
      try {
        setUploading(true);
        const response = await fetch("/api/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            logo: reader.result, // This should be the actual uploaded URL
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update logo");
        }

        const result = await response.json();
        setSettings(result.data);
        alert("Logo updated successfully!");
      } catch (error) {
        console.error("Error updating logo:", error);
        alert("Failed to update logo");
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete the logo?")) return;

    try {
      setUploading(true);
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logo: null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete logo");
      }

      const result = await response.json();
      setSettings(result.data);
      setLogoPreview(null);
      alert("Logo deleted successfully!");
    } catch (error) {
      console.error("Error deleting logo:", error);
      alert("Failed to delete logo");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <ShowcaseSection title="Company Logo" className="!p-7">
        <div className="text-center">Loading...</div>
      </ShowcaseSection>
    );
  }


  return (
    <ShowcaseSection title="Company Logo" className="!p-7">
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="mb-4 flex items-center gap-3">
          <div className="size-14 rounded-full bg-gray-2 dark:bg-dark-3 overflow-hidden flex items-center justify-center">
            {logoPreview ? (
              <Image
                src={logoPreview}
                width={55}
                height={55}
                alt="Company Logo"
                className="size-14 rounded-full object-cover"
                quality={90}
              />
            ) : (
              <div className="text-xl font-bold text-dark dark:text-white">
                {settings?.name.charAt(0).toUpperCase() || "C"}
              </div>
            )}
          </div>

          <div>
            <span className="mb-1.5 font-medium text-dark dark:text-white">
              Edit company logo
            </span>
            <span className="flex gap-3">
              <button 
                type="button" 
                className="text-body-sm hover:text-red disabled:opacity-50"
                onClick={handleDelete}
                disabled={uploading || !logoPreview}
              >
                Delete
              </button>
              <label className="text-body-sm hover:text-primary cursor-pointer">
                <input
                  type="file"
                  accept="image/png, image/jpg, image/jpeg, image/svg+xml"
                  className="hidden"
                  onChange={handleLogoChange}
                  disabled={uploading}
                />
                {uploading ? "Uploading..." : "Update"}
              </label>
            </span>
          </div>
        </div>

        <div className="relative mb-5.5 block w-full rounded-xl border border-dashed border-gray-4 bg-gray-2 hover:border-primary dark:border-dark-3 dark:bg-dark-2 dark:hover:border-primary">
          <input
            type="file"
            name="profilePhoto"
            id="profilePhoto"
            accept="image/png, image/jpg, image/jpeg, image/svg+xml"
            onChange={handleLogoChange}
            disabled={uploading}
            hidden
          />

          <label
            htmlFor="profilePhoto"
            className="flex cursor-pointer flex-col items-center justify-center p-4 sm:py-7.5"
          >
            <div className="flex size-13.5 items-center justify-center rounded-full border border-stroke bg-white dark:border-dark-3 dark:bg-gray-dark">
              <UploadIcon />
            </div>

            <p className="mt-2.5 text-body-sm font-medium">
              <span className="text-primary">Click to upload</span> or drag and
              drop
            </p>

            <p className="mt-1 text-body-xs">
              SVG, PNG, JPG or GIF (max, 800 X 800px)
            </p>
          </label>
        </div>

        <div className="flex justify-end gap-3">
          <button
            className="flex justify-center rounded-lg border border-stroke px-6 py-[7px] font-medium text-dark hover:shadow-1 dark:border-dark-3 dark:text-white disabled:opacity-50"
            type="button"
            onClick={handleDelete}
            disabled={uploading || !logoPreview}
          >
            Delete Logo
          </button>
        </div>
      </form>
    </ShowcaseSection>
  );
}
