"use client"

import React, {  useState } from "react"
import { toast } from "react-toastify"



interface CreateMemberFormProps {
  groupId: string; 
  leaderEmail: string;
}

export function CreateMemberForm({ groupId, leaderEmail }: CreateMemberFormProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [department, setDepartment] = useState("")
  const [location, setLocation] = useState("")
  const [role, setRole] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          department,
          location,
          group: groupId, // Use the groupId passed as a prop
          role,
          password,
          leader: leaderEmail, // Automatically assign the leader's ID
        }),
      })

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create member");
      }

      // Reset form fields
      setName("")
      setEmail("")
      setPhone("")
      setDepartment("")
      setLocation("")
      setRole("")
      setPassword("")

      toast.success("Member created successfully!")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create member");
      console.error("Error creating member:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto p-4 bg-blue-500 shadow rounded">
      <div>
        <label className="block text-sm font-semibold mb-1">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          placeholder="Full name"
          disabled={loading}
        />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          placeholder="user@example.com"
          disabled={loading}
        />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1">Phone</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          placeholder="+1234567890"
          disabled={loading}
        />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1">Department</label>
        <input
          type="text"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Department (optional)"
          disabled={loading}
        />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1">Location</label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          placeholder="Location"
          disabled={loading}
        />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1">Role</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Select </option>
          <option value="member">Member</option>
          <option value="leader">Leader</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          placeholder="Enter a secure password"
          disabled={loading}
        />
      </div>
      <div className="flex gap-2 justify-end mt-4">
        <button
          type="reset"
          onClick={() => {
            setName("")
            setEmail("")
            setPhone("")
            setDepartment("")
            setLocation("")
            setRole("")
            setPassword("")
          }}
          className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 disabled:opacity-50"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Member"}
        </button>
      </div>
    </form>
  )
}
