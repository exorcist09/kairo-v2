"use client";

import {
  CaretDown,
  Check,
  EnvelopeSimple,
  FloppyDisk,
  IdentificationCard,
  LockKey,
  Prohibit,
  ShieldCheck,
  UserCircle,
  X,
} from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import {
  updateAvatar,
  updateEmail,
  updatePassword,
  updateProfile,
} from "@/api/profile.api";
import AvatarSelector, { getAvatarLabel } from "@/shared/AvatarSelector";
import DisableAccountModal from "@/shared/DisableAccountModal";
import { SettingsSkeleton } from "@/shared/Skeleton";
import { useAuthStore } from "@/zusstore/auth.store";
import { useProfileStore } from "@/zusstore/profile.store";

export default function Settings() {
  const { user, loading, hasLoaded, fetchProfile, updateUserFields } =
    useProfileStore();
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  // Avatar State
  const [selectedAvatar, setSelectedAvatar] = useState("Astronaut");
  const [initialAvatar, setInitialAvatar] = useState("Astronaut");
  const [avatarSaving, setAvatarSaving] = useState(false);
  const [avatarSavedSuccess, setAvatarSavedSuccess] = useState(false);
  const [avatarError, setAvatarError] = useState("");

  // Contact Details State
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState("IN");
  const [phone, setPhone] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSavedSuccess, setProfileSavedSuccess] = useState(false);
  const [profileError, setProfileError] = useState("");

  // Modals for Email, Password, and Disable Account
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [newEmailInput, setNewEmailInput] = useState("");
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailMsg, setEmailMsg] = useState("");
  const [emailErr, setEmailErr] = useState("");

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordErr, setPasswordErr] = useState("");

  const [isDisableModalOpen, setIsDisableModalOpen] = useState(false);

  const { init, updateUser: updateAuthUser } = useAuthStore();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (user) {
      const avLabel = getAvatarLabel(user.avatar);
      setSelectedAvatar(avLabel);
      setInitialAvatar(avLabel);
      setUsername(user.username || "");
      setEmail(user.email || "");
      setFullName(user.name || "");
      if (user.country) setCountry(user.country);
      if (user.phone) setPhone(user.phone);
    }
  }, [user]);

  // Save Avatar Only
  const handleSaveAvatar = async () => {
    try {
      setAvatarSaving(true);
      setAvatarError("");
      const label = getAvatarLabel(selectedAvatar);
      await updateAvatar({ avatar: label });
      setInitialAvatar(label);
      updateUserFields({ avatar: label });
      updateAuthUser({ avatar: label });
      setAvatarSavedSuccess(true);

      // Sync auth state
      init();
      setTimeout(() => setAvatarSavedSuccess(false), 2500);
    } catch (err: any) {
      setAvatarError(err.response?.data?.message || "Failed to update avatar");
    } finally {
      setAvatarSaving(false);
    }
  };

  // Save Contact Details
  const handleSaveContact = async () => {
    try {
      setProfileSaving(true);
      setProfileError("");
      await updateProfile({
        name: fullName.trim(),
        country,
        phone,
      });
      updateUserFields({
        name: fullName.trim(),
        country,
        phone,
      });
      updateAuthUser({ name: fullName.trim() });
      setProfileSavedSuccess(true);
      init();
      setTimeout(() => setProfileSavedSuccess(false), 2500);
    } catch (err: any) {
      setProfileError(
        err.response?.data?.message || "Failed to update profile",
      );
    } finally {
      setProfileSaving(false);
    }
  };

  // Change Email Submit
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmailInput.trim() || newEmailInput === email) return;
    try {
      setEmailSaving(true);
      setEmailErr("");
      setEmailMsg("");
      const res = await updateEmail({ email: newEmailInput.trim() });
      const updated = res.email || newEmailInput.trim();
      setEmail(updated);
      updateUserFields({ email: updated });
      setEmailMsg("Email updated successfully");
      init();
      setTimeout(() => {
        setIsEmailModalOpen(false);
        setEmailMsg("");
      }, 1500);
    } catch (err: any) {
      setEmailErr(err.response?.data?.message || "Failed to update email");
    } finally {
      setEmailSaving(false);
    }
  };

  // Change Password Submit
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;
    try {
      setPasswordSaving(true);
      setPasswordErr("");
      setPasswordMsg("");
      await updatePassword({ currentPassword, newPassword });
      setPasswordMsg("Password changed successfully");
      setTimeout(() => {
        setIsPasswordModalOpen(false);
        setCurrentPassword("");
        setNewPassword("");
        setPasswordMsg("");
      }, 1500);
    } catch (err: any) {
      setPasswordErr(
        err.response?.data?.message || "Failed to update password",
      );
    } finally {
      setPasswordSaving(false);
    }
  };

  const isAvatarChanged = selectedAvatar !== initialAvatar;

  return (
    <div className="w-full h-full flex flex-col">
      {/* Page Header */}
      <div className="mb-6 flex-shrink-0">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Manage your personal profile, account credentials, and platform
          preferences.
        </p>
      </div>

      {/* Main Scrollable Canvas */}
      <div className="flex-1 border border-gray-200 rounded-2xl bg-white overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-8 flex flex-col">
          {loading && !hasLoaded ? (
            <SettingsSkeleton />
          ) : (
            <div className="max-w-4xl mx-auto w-full flex flex-col gap-6 pb-6">
              {/* 1. Profile Avatar Card */}
              <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-200/90 p-6 md:p-8 shadow-xs flex flex-col items-center justify-center text-center">
                {/* Top-left clipped watermark icon */}
                <div className="absolute -top-7 -left-7 w-28 h-28 opacity-10 pointer-events-none text-blue-600">
                  <UserCircle weight="duotone" className="w-full h-full" />
                </div>

                <div className="z-10 relative mb-4">
                  <h2 className="text-base sm:text-lg font-bold text-gray-900">
                    Profile Avatar
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Pick your avatar character. Click save below to update.
                  </p>
                </div>

                {/* Centered Avatar Selector */}
                <div className="z-10 relative w-full flex justify-center">
                  <AvatarSelector
                    selectedAvatar={selectedAvatar}
                    onSelect={(_src, label) => setSelectedAvatar(label)}
                  />
                </div>

                {/* Save Avatar Button */}
                <div className="z-10 relative mt-4 flex flex-col items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSaveAvatar}
                    disabled={avatarSaving || !isAvatarChanged}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs ${
                      isAvatarChanged
                        ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {avatarSaving ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FloppyDisk weight="bold" className="w-4 h-4" />
                    )}
                    <span>
                      {avatarSaving
                        ? "Saving..."
                        : isAvatarChanged
                          ? "Save Avatar"
                          : "Avatar Saved"}
                    </span>
                  </button>

                  {avatarSavedSuccess && (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 animate-in fade-in">
                      <Check weight="bold" className="w-4 h-4" />
                      <span>Avatar updated successfully</span>
                    </span>
                  )}
                  {avatarError && (
                    <span className="text-xs font-semibold text-red-600 animate-in fade-in">
                      {avatarError}
                    </span>
                  )}
                </div>
              </div>

              {/* 2. Contact Details Card */}
              <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-200/90 p-6 md:p-8 shadow-xs flex flex-col gap-6">
                {/* Top-left clipped watermark icon */}
                <div className="absolute -top-7 -left-7 w-28 h-28 opacity-10 pointer-events-none text-blue-600">
                  <IdentificationCard
                    weight="duotone"
                    className="w-full h-full"
                  />
                </div>

                <div className="z-10 relative pb-3 border-b border-gray-100">
                  <h2 className="text-base sm:text-lg font-bold text-gray-900">
                    Contact Details
                  </h2>
                </div>

                {/* Form Grid */}
                <div className="z-10 relative grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Full Name */}
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-xs font-semibold text-gray-700">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white focus:bg-white text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>

                  {/* Country */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-700">
                      Country / Region
                    </label>
                    <div className="relative">
                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white focus:bg-white text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer pr-10"
                      >
                        <option value="IN">India (+91)</option>
                        <option value="US">United States (+1)</option>
                        <option value="UK">United Kingdom (+44)</option>
                        <option value="CA">Canada (+1)</option>
                        <option value="DE">Germany (+49)</option>
                        <option value="SG">Singapore (+65)</option>
                      </select>
                      <CaretDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-700">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white focus:bg-white text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                {/* Save Button */}
                <div className="z-10 relative flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleSaveContact}
                    disabled={profileSaving}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl text-xs font-semibold transition-colors shadow-xs cursor-pointer flex items-center gap-2"
                  >
                    {profileSaving && (
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    )}
                    <span>{profileSaving ? "Saving..." : "Save Changes"}</span>
                  </button>
                  {profileSavedSuccess && (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 animate-in fade-in">
                      <Check weight="bold" className="w-4 h-4" />
                      <span>Changes saved successfully</span>
                    </span>
                  )}
                  {profileError && (
                    <span className="text-xs font-semibold text-red-600">
                      {profileError}
                    </span>
                  )}
                </div>
              </div>

              {/* 3. Account Security & Overview Card */}
              <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-200/90 p-6 md:p-8 shadow-xs flex flex-col gap-5">
                {/* Top-left clipped watermark icon */}
                <div className="absolute -top-7 -left-7 w-28 h-28 opacity-10 pointer-events-none text-blue-600">
                  <ShieldCheck weight="duotone" className="w-full h-full" />
                </div>

                <div className="z-10 relative pb-3 border-b border-gray-100">
                  <h2 className="text-base sm:text-lg font-bold text-gray-900">
                    Account Security
                  </h2>
                </div>

                <div className="z-10 relative flex flex-col divide-y divide-gray-100">
                  {/* Username Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3.5 gap-2">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-gray-900">
                        Username
                      </span>
                      <span className="text-xs text-gray-500 font-mono mt-0.5">
                        @{username || "user"}
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 border border-gray-200/80 px-2.5 py-0.5 rounded-full self-start sm:self-auto">
                      Non-editable
                    </span>
                  </div>

                  {/* Email Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3.5 gap-2">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-gray-900">
                        Email Address
                      </span>
                      <span className="text-xs text-gray-500 mt-0.5">
                        {email || "No email"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setNewEmailInput("");
                        setEmailErr("");
                        setEmailMsg("");
                        setIsEmailModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer self-start sm:self-auto shadow-2xs"
                    >
                      <EnvelopeSimple className="w-3.5 h-3.5 text-gray-500" />
                      <span>Change Email</span>
                    </button>
                  </div>

                  {/* Password Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3.5 gap-2">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-gray-900">
                        Password
                      </span>
                      <span className="text-xs text-gray-400 font-mono tracking-wider mt-0.5">
                        ••••••••••••
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentPassword("");
                        setNewPassword("");
                        setPasswordErr("");
                        setPasswordMsg("");
                        setIsPasswordModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer self-start sm:self-auto shadow-2xs"
                    >
                      <LockKey className="w-3.5 h-3.5 text-gray-500" />
                      <span>Change Password</span>
                    </button>
                  </div>

                  {/* 2FA Row */}
                  <div className="flex items-center justify-between py-3.5 gap-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-gray-900">
                        Two-Factor Authentication (2FA)
                      </span>
                      <span className="text-xs text-gray-500 mt-0.5">
                        Add an extra layer of multi-factor security using an
                        authenticator app
                      </span>
                    </div>

                    {/* Toggle Switch */}
                    <button
                      type="button"
                      onClick={() => setIs2FAEnabled(!is2FAEnabled)}
                      aria-pressed={is2FAEnabled}
                      aria-label="Toggle Two-Factor Authentication"
                      className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 cursor-pointer ${
                        is2FAEnabled ? "bg-blue-600" : "bg-gray-200"
                      }`}
                    >
                      <div
                        className={`absolute top-1 bg-white w-4 h-4 rounded-full shadow-xs transition-transform duration-200 ease-in-out ${
                          is2FAEnabled
                            ? "translate-x-6 left-0"
                            : "translate-x-1 left-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* 4. Disabled Zone Card (Brown Palette) */}
              <div className="relative overflow-hidden bg-[#faf6f0] rounded-2xl border border-amber-900/20 p-6 md:p-8 shadow-xs flex flex-col gap-4">
                {/* Top-left clipped watermark icon in brown */}
                <div className="absolute -top-7 -left-7 w-28 h-28 opacity-10 pointer-events-none text-amber-900">
                  <Prohibit weight="duotone" className="w-full h-full" />
                </div>

                <div className="z-10 relative pb-3 border-b border-amber-900/10 flex flex-col gap-0.5">
                  <h2 className="text-base sm:text-lg font-bold text-[#78350f]">
                    Disabled Zone
                  </h2>
                  <span className="text-xs text-amber-900/70">
                    Manage temporary account restrictions and automated activity
                    pauses
                  </span>
                </div>

                <div className="z-10 relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-900">
                      Disable Account
                    </span>
                    <span className="text-xs text-gray-600 mt-0.5 max-w-md">
                      Temporarily pause your personal account, webhooks, and
                      active workflow executions. You can reactivate at any time
                      by logging back in.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsDisableModalOpen(true)}
                    className="flex items-center justify-center gap-2 text-xs font-semibold text-white bg-[#78350f] hover:bg-[#5c280a] px-5 py-2.5 rounded-xl transition-colors shadow-xs cursor-pointer self-start sm:self-auto flex-shrink-0"
                  >
                    <Prohibit className="w-4 h-4" />
                    <span>Disable Account</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal for Disabled Zone */}
      <DisableAccountModal
        isOpen={isDisableModalOpen}
        onClose={() => setIsDisableModalOpen(false)}
        onConfirm={() => {
          setIsDisableModalOpen(false);
          alert("This feature is under development");
        }}
      />

      {/* Change Email Modal */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-gray-200 max-w-md w-full p-6 shadow-xl relative">
            <button
              type="button"
              onClick={() => setIsEmailModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Update Email Address
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Enter your new email address. Account notifications and recovery
              links will be updated.
            </p>
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              {/* Disabled Current Email */}
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Current Email
                </label>
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-500 bg-gray-100 cursor-not-allowed select-none"
                />
              </div>

              {/* Editable New Email */}
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  New Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="Enter new email address"
                  value={newEmailInput}
                  onChange={(e) => setNewEmailInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                />
              </div>

              {emailMsg && (
                <p className="text-xs text-emerald-600 font-semibold">
                  {emailMsg}
                </p>
              )}
              {emailErr && (
                <p className="text-xs text-red-600 font-semibold">{emailErr}</p>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEmailModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    emailSaving ||
                    !newEmailInput.trim() ||
                    newEmailInput === email
                  }
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white cursor-pointer flex items-center gap-1.5"
                >
                  {emailSaving && (
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  <span>{emailSaving ? "Saving..." : "Save Email"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-gray-200 max-w-md w-full p-6 shadow-xl relative">
            <button
              type="button"
              onClick={() => setIsPasswordModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Update Password
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Enter your current password and choose a secure new password.
            </p>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              {passwordMsg && (
                <p className="text-xs text-emerald-600 font-semibold">
                  {passwordMsg}
                </p>
              )}
              {passwordErr && (
                <p className="text-xs text-red-600 font-semibold">
                  {passwordErr}
                </p>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordSaving || !currentPassword || !newPassword}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white cursor-pointer flex items-center gap-1.5"
                >
                  {passwordSaving && (
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  <span>
                    {passwordSaving ? "Updating..." : "Update Password"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
