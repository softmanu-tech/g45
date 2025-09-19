"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Calendar, Users, CheckCircle, XCircle, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loading, QuickLoading } from "@/components/ui/loading"
import { format } from "date-fns"
import Link from "next/link"

interface Member {
  _id: string
  name: string
  email: string
  phone?: string
}

interface Event {
  _id: string
  title: string
  date: string
  location?: string
}

interface AttendanceRecord {
  _id: string
  date: string
  event?: Event
  presentMembers: string[]
  absentMembers: string[]
  group: {
    _id: string
    name: string
  }
}

export default function AttendancePage() {
  const [members, setMembers] = useState<Member[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  
  // Form state
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedEvent, setSelectedEvent] = useState<string>("")
  const [presentMembers, setPresentMembers] = useState<Set<string>>(new Set())
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch leader data including members
      const leaderResponse = await fetch("/api/leader")
      if (!leaderResponse.ok) throw new Error("Failed to fetch leader data")
      const leaderData = await leaderResponse.json()
      
      setMembers(leaderData.members || [])
      
      // Fetch events
      const eventsResponse = await fetch("/api/leader/events")
      if (!eventsResponse.ok) throw new Error("Failed to fetch events")
      const eventsData = await eventsResponse.json()
      
      setEvents(eventsData.data || [])
      
      // Fetch attendance records
      const attendanceResponse = await fetch("/api/leader/mark-attendance")
      if (attendanceResponse.ok) {
        const attendanceData = await attendanceResponse.json()
        setAttendanceRecords(attendanceData.data || [])
      }
      
    } catch (err) {
      console.error("Error fetching data:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch data")
    } finally {
      setLoading(false)
    }
  }

  const handleMemberToggle = (memberId: string) => {
    const newPresentMembers = new Set(presentMembers)
    if (newPresentMembers.has(memberId)) {
      newPresentMembers.delete(memberId)
    } else {
      newPresentMembers.add(memberId)
    }
    setPresentMembers(newPresentMembers)
  }

  const handleSelectAll = () => {
    const allMemberIds = new Set(members.map(m => m._id))
    setPresentMembers(allMemberIds)
  }

  const handleSelectNone = () => {
    setPresentMembers(new Set())
  }

  const handleSubmit = async () => {
    if (presentMembers.size === 0) {
      alert("Please mark at least one member as present")
      return
    }

    try {
      setSubmitting(true)
      
      const presentIds = Array.from(presentMembers)
      const absentIds = members
        .filter(m => !presentMembers.has(m._id))
        .map(m => m._id)

      const payload = {
        date: selectedDate.toISOString(),
        groupId: "auto", // Will be determined by leader's group
        presentMembers: presentIds,
        absentMembers: absentIds,
        recordedBy: "auto", // Will be determined by authenticated user
        ...(selectedEvent && { eventId: selectedEvent })
      }

      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to record attendance")
      }

      alert("Attendance recorded successfully!")
      setPresentMembers(new Set())
      setSelectedEvent("")
      await fetchData() // Refresh data
      
    } catch (err) {
      console.error("Error recording attendance:", err)
      alert(err instanceof Error ? err.message : "Failed to record attendance")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <Loading message="Loading attendance system..." size="lg" />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-blue-300 flex items-center justify-center px-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg max-w-md text-center">
          <strong>Error:</strong> {error}
          <button 
            onClick={fetchData}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-blue-300">
      {/* Header */}
      <div className="bg-blue-200/90 backdrop-blur-md border-b border-blue-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-blue-800">Mark Attendance</h1>
              <p className="text-sm text-blue-700 mt-1">Record member attendance for your group</p>
            </div>
            <Link 
              href="/leader" 
              className="inline-flex items-center px-4 py-2 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-800 bg-white/80 backdrop-blur-sm hover:bg-white/90"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Attendance Form */}
          <div className="lg:col-span-2">
            <Card className="bg-blue-200/90 backdrop-blur-md border border-blue-300">
              <CardHeader>
                <CardTitle className="text-blue-800 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Mark Attendance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Date and Event Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-blue-800 mb-2">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      Date
                    </label>
                    <input
                      type="date"
                      value={format(selectedDate, "yyyy-MM-dd")}
                      onChange={(e) => setSelectedDate(new Date(e.target.value))}
                      max={format(new Date(), "yyyy-MM-dd")}
                      className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-blue-800 bg-white/90 text-blue-800"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-blue-800 mb-2">
                      Event (Optional)
                    </label>
                    <select
                      value={selectedEvent}
                      onChange={(e) => setSelectedEvent(e.target.value)}
                      className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-blue-800 bg-white/90 text-blue-800"
                    >
                      <option value="">General Attendance</option>
                      {events.map((event) => (
                        <option key={event._id} value={event._id}>
                          {event.title} - {format(new Date(event.date), "MMM dd")}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSelectAll}
                    className="border-blue-300 text-blue-800 bg-white/80 hover:bg-white/90"
                  >
                    Select All
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSelectNone}
                    className="border-blue-300 text-blue-800 bg-white/80 hover:bg-white/90"
                  >
                    Select None
                  </Button>
                </div>

                {/* Members List */}
                <div className="space-y-3">
                  <h3 className="text-lg font-medium text-blue-800">
                    Members ({presentMembers.size} of {members.length} present)
                  </h3>
                  
                  {members.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="mx-auto h-12 w-12 text-blue-400 mb-4" />
                      <p className="text-blue-600">No members in your group yet.</p>
                      <Link href="/leader" className="text-blue-800 underline">
                        Add members to your group
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {members.map((member) => (
                        <motion.div
                          key={member._id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={`p-4 rounded-lg border cursor-pointer transition-all ${
                            presentMembers.has(member._id)
                              ? "bg-green-100 border-green-300 shadow-sm"
                              : "bg-white/80 border-blue-200 hover:bg-white/90"
                          }`}
                          onClick={() => handleMemberToggle(member._id)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-blue-800">{member.name}</h4>
                              <p className="text-sm text-blue-600">{member.email}</p>
                            </div>
                            <div className="flex items-center">
                              {presentMembers.has(member._id) ? (
                                <CheckCircle className="h-6 w-6 text-green-600" />
                              ) : (
                                <XCircle className="h-6 w-6 text-gray-400" />
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-4 border-t border-blue-300">
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting || presentMembers.size === 0}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                  >
                    {submitting ? (
                      <QuickLoading message="Recording..." />
                    ) : (
                      `Record Attendance (${presentMembers.size} present)`
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Attendance History */}
          <div>
            <Card className="bg-blue-200/90 backdrop-blur-md border border-blue-300">
              <CardHeader>
                <CardTitle className="text-blue-800 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Records
                </CardTitle>
              </CardHeader>
              <CardContent>
                {attendanceRecords.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="mx-auto h-8 w-8 text-blue-400 mb-2" />
                    <p className="text-blue-600 text-sm">No attendance records yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {attendanceRecords.slice(0, 5).map((record) => (
                      <div
                        key={record._id}
                        className="p-3 bg-white/80 rounded-lg border border-blue-200"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-blue-800">
                              {format(new Date(record.date), "MMM dd, yyyy")}
                            </p>
                            {record.event && (
                              <p className="text-sm text-blue-600">{record.event.title}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-green-600">
                              {record.presentMembers.length} present
                            </p>
                            <p className="text-sm text-red-600">
                              {record.absentMembers.length} absent
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
