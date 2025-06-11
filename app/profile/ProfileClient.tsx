"use client";

import Container from "@/components/Container";
import Heading from "@/components/Heading";
import { categories } from "@/components/navbar/Categories";
import ProfileImageUpload from "@/components/inputs/ProfileImageUpload";
import Avatar from "@/components/Avatar";
import { SafeUser } from "@/types";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { useDebounce } from "@/hook/useDebounce";

interface ProfileClientProps {
  currentUser: SafeUser;
}

const ProfileClient: React.FC<ProfileClientProps> = ({ currentUser }) => {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  
  // Form state
  const [name, setName] = useState(currentUser.name || "");
  const [image, setImage] = useState(currentUser.image || "");
  const [experienceLevel, setExperienceLevel] = useState(currentUser.experienceLevel || 1);
  const [bio, setBio] = useState(currentUser.bio || "");
  const [preferredInstruments, setPreferredInstruments] = useState<string[]>(
    currentUser.preferredInstruments || []
  );

  // Debounced values for text inputs
  const debouncedName = useDebounce(name, 1000);
  const debouncedBio = useDebounce(bio, 1000);

  // Auto-save function
  const autoSave = useCallback(async (data: any) => {
    setIsSaving(true);
    try {
      await axios.patch("/api/profile", data);
      router.refresh();
    } catch (error) {
      toast.error("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  }, [router]);

  // Auto-save when debounced values change
  useEffect(() => {
    if (debouncedName !== currentUser.name) {
      autoSave({
        name: debouncedName,
        image,
        experienceLevel,
        bio: bio || null,
        preferredInstruments,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedName, autoSave]);

  useEffect(() => {
    if (debouncedBio !== currentUser.bio) {
      autoSave({
        name,
        image,
        experienceLevel,
        bio: debouncedBio || null,
        preferredInstruments,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedBio, autoSave]);

  // Immediate save for non-text inputs
  const handleExperienceLevelChange = (value: number) => {
    setExperienceLevel(value);
    autoSave({
      name,
      image,
      experienceLevel: value,
      bio: bio || null,
      preferredInstruments,
    });
  };

  const handleImageChange = (value: string) => {
    setImage(value);
    autoSave({
      name,
      image: value,
      experienceLevel,
      bio: bio || null,
      preferredInstruments,
    });
  };

  const handleInstrumentToggle = (instrument: string) => {
    const newInstruments = preferredInstruments.includes(instrument)
      ? preferredInstruments.filter(i => i !== instrument)
      : [...preferredInstruments, instrument];
    
    setPreferredInstruments(newInstruments);
    autoSave({
      name,
      image,
      experienceLevel,
      bio: bio || null,
      preferredInstruments: newInstruments,
    });
  };

  return (
    <Container>
      <div className="max-w-2xl mx-auto">
        <Heading title="My Profile" subtitle="Manage your musician profile" />
        
        {isSaving && (
          <div className="fixed top-4 right-4 bg-amber-100 text-amber-800 px-4 py-2 rounded-md shadow-md">
            Saving...
          </div>
        )}
        
        <div className="mt-8 space-y-6">
          {/* Profile Picture */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-center">Profile Picture</h3>
            <div className="flex flex-col items-center gap-4">
              <Avatar src={image} userName={name || currentUser.name} size={120} />
              <div className="hidden">
                <ProfileImageUpload
                  onChange={handleImageChange}
                  value={image}
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  const uploadElement = document.getElementById('profile-image-upload');
                  if (uploadElement) {
                    uploadElement.click();
                  }
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                Change Photo
              </button>
            </div>
          </div>

          <hr />

          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Email
              </label>
              <input
                type="email"
                value={currentUser.email || ""}
                disabled
                className="w-full p-3 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
              />
            </div>
          </div>

          <hr />

          {/* Musical Experience */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Musical Experience</h3>
            
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Experience Level
              </label>
              <select
                value={experienceLevel}
                onChange={(e) => handleExperienceLevelChange(Number(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value={1}>Beginner</option>
                <option value={2}>Intermediate</option>
                <option value={3}>Advanced</option>
                <option value={4}>Professional</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                This helps match you with appropriate instruments
              </p>
            </div>


            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Tell us about your musical journey..."
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {bio.length}/500 characters
              </p>
            </div>
          </div>

          <hr />

          {/* Preferred Instruments */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Preferred Instruments</h3>
            <p className="text-sm text-gray-500">
              Select the instruments you&apos;re interested in renting
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {categories.map((category) => (
                <label
                  key={category.label}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={preferredInstruments.includes(category.label)}
                    onChange={() => handleInstrumentToggle(category.label)}
                    className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                  />
                  <span className="text-sm">{category.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default ProfileClient;