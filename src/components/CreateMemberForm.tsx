"use client"

import React, { useState } from "react"
import { X, User, Mail, Phone } from "lucide-react"
import { QuickLoading } from "@/components/ui/loading"

interface CreateMemberFormProps {
  groupId: string; 
  onMemberCreated: () => void;
}

export function CreateMemberForm({ groupId, onMemberCreated }: CreateMemberFormProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/leader/members", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to create member");
      }

      // Reset form fields
      setName("")
      setEmail("")
      setPhone("")

      alert(`Member "${name}" created successfully! Generated password: ${data.data.password}`)
      onMemberCreated()
    } catch (error) {
      console.error("Error creating member:", error)
      setError(error instanceof Error ? error.message : "Failed to create member")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setName("")
    setEmail("")
    setPhone("")
    setError("")
    onMemberCreated() // This will close the modal
  }

  return (
    <div className="fixed inset-0 bg-blue-900/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-blue-200/95 backdrop-blur-md rounded-lg shadow-xl max-w-md w-full mx-4 border border-blue-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-blue-300">
          <h2 className="text-lg font-semibold text-blue-800 flex items-center gap-2">
            <User className="h-5 w-5" />
            Add New Member
          </h2>
          <button
            onClick={handleClose}
            className="text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              {error}
            </div>
          )}

          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-blue-800 mb-1">
              <User className="h-4 w-4 inline mr-1" />
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-blue-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-800 focus:border-blue-800 text-blue-800 placeholder-blue-600 bg-white/90"
              placeholder="Enter member's full name"
              required
              disabled={loading}
            />
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-blue-800 mb-1">
              <Mail className="h-4 w-4 inline mr-1" />
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-blue-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-800 focus:border-blue-800 text-blue-800 placeholder-blue-600 bg-white/90"
              placeholder="member@example.com"
              required
              disabled={loading}
            />
          </div>

          {/* Phone Field */}
          <div>
            <label className="block text-sm font-medium text-blue-800 mb-1">
              <Phone className="h-4 w-4 inline mr-1" />
              Phone Number (Optional)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-blue-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-800 focus:border-blue-800 text-blue-800 placeholder-blue-600 bg-white/90"
              placeholder="+254 700 000 000"
              disabled={loading}
            />
          </div>

          <div className="bg-blue-100 border border-blue-300 text-blue-700 px-4 py-3 rounded text-sm">
            <strong>Note:</strong> A secure password will be automatically generated for this member.
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-blue-300">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-800 bg-white/80 backdrop-blur-sm hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-800 disabled:opacity-50"
            >
{loading ? <QuickLoading message="Creating member..." /> : "Add Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
