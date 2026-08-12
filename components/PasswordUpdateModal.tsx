// components/PasswordUpdateModal.tsx
"use client";
import { useState } from "react";
import { Lock, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";

interface PasswordUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onSuccess: () => void;
  isDarkMode: boolean;
}

export default function PasswordUpdateModal({
  isOpen,
  onClose,
  userId,
  onSuccess,
  isDarkMode
}: PasswordUpdateModalProps) {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (form.newPassword !== form.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      return;
    }

    if (form.newPassword.length < 6) {
      setMessage({ type: "error", text: "New password must be at least 6 characters" });
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage({ 
          type: "success", 
          text: "Password updated successfully!" 
        });
        setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      } else {
        setMessage({ type: "error", text: data.message || "Failed to update password" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error. Please try again." });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`rounded-xl shadow-2xl w-full max-w-md ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-900/50' : 'bg-blue-100'}`}>
                <Lock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Update Password</h2>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Secure your account with a new password
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>

          {message.text && (
            <div
              className={`mb-6 p-3 rounded-lg flex items-center gap-2 ${
                message.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 flex-shrink-0" />
              )}
              <span className="text-sm">{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  name="currentPassword"
                  value={form.currentPassword}
                  onChange={handleChange}
                  required
                  placeholder="Enter current password"
                  className={`w-full px-4 py-3 pr-10 rounded-lg border ${
                    isDarkMode
                      ? 'bg-slate-700 border-slate-600 text-white'
                      : 'bg-gray-50 border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  name="newPassword"
                  value={form.newPassword}
                  onChange={handleChange}
                  required
                  placeholder="Enter new password (min. 6 characters)"
                  className={`w-full px-4 py-3 pr-10 rounded-lg border ${
                    isDarkMode
                      ? 'bg-slate-700 border-slate-600 text-white'
                      : 'bg-gray-50 border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Confirm new password"
                  className={`w-full px-4 py-3 pr-10 rounded-lg border ${
                    isDarkMode
                      ? 'bg-slate-700 border-slate-600 text-white'
                      : 'bg-gray-50 border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className={`flex-1 py-3 rounded-lg font-medium ${
                  isDarkMode
                    ? 'bg-slate-700 hover:bg-slate-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                }`}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Update Password
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}