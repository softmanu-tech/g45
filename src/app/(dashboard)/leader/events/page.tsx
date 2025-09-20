"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Calendar, Plus, MapPin, Users, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loading } from "@/components/ui/loading"

interface Event {
  _id: string
  title: string
  date: string
  location?: string
  description?: string
  attendance: string[]
  createdBy: {
    _id: string
    name: string
    email: string
  }
}

export default function LeaderEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/leader/events", {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch events")
      }

      const result = await response.json()
      if (result.success) {
        setEvents(result.data || [])
      } else {
        throw new Error(result.error || "Failed to fetch events")
      }
    } catch (err) {
      console.error("Error fetching events:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch events")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const isUpcoming = (dateString: string) => {
    return new Date(dateString) > new Date()
  }

  const isPast = (dateString: string) => {
    return new Date(dateString) < new Date()
  }

  if (loading) {
    return <Loading message="Loading events..." size="lg" />
  }

  return (
    <div className="min-h-screen bg-blue-300">
      {/* Header */}
      <div className="bg-blue-200/90 backdrop-blur-md border-b border-blue-300">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center py-4 sm:py-6 gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-blue-800 truncate">My Events</h1>
              <p className="text-xs sm:text-sm text-blue-700 mt-1">Manage and track your group events</p>
            </div>
            <Link href="/leader/events/create" className="w-full sm:w-auto">
              <Button className="bg-white text-blue-600 hover:bg-blue-50 flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 text-sm">
                <Plus className="h-4 w-4" />
                Create Event
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4 sm:space-y-6"
        >

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-700">{error}</p>
          </CardContent>
        </Card>
      )}

          {/* Events List */}
          {events.length === 0 ? (
            <Card className="text-center py-8 sm:py-12 bg-blue-200/90 backdrop-blur-md border border-blue-300">
              <CardContent>
                <Calendar className="h-12 w-12 sm:h-16 sm:w-16 text-blue-400 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-blue-800 mb-2">No Events Yet</h3>
                <p className="text-sm sm:text-base text-blue-600 mb-6">
                  You haven't created any events yet. Create your first event to get started!
                </p>
                <Link href="/leader/events/create">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Event
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 sm:gap-4 md:gap-6">
          {events.map((event) => (
            <motion.div
              key={event._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-blue-200/90 backdrop-blur-md border border-blue-300 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3 p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base sm:text-lg md:text-xl font-bold text-blue-800 truncate">
                        {event.title}
                      </CardTitle>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-blue-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="truncate">{formatDate(event.date)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span>{formatTime(event.date)}</span>
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="truncate">{event.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <div className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                        isUpcoming(event.date)
                          ? "bg-blue-100 text-blue-800"
                          : isPast(event.date)
                            ? "bg-blue-200 text-blue-800"
                            : "bg-blue-300 text-blue-800"
                      }`}>
                        {isUpcoming(event.date) ? "Upcoming" : isPast(event.date) ? "Past" : "Today"}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0 p-4 sm:p-6">
                  {event.description && (
                    <p className="text-blue-700 mb-4 text-sm sm:text-base">{event.description}</p>
                  )}
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                    <div className="flex items-center gap-1 text-xs sm:text-sm text-blue-600">
                      <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>{event.attendanceCount || 0} attendee{(event.attendanceCount || 0) !== 1 ? "s" : ""}</span>
                      {event.totalMembers && event.totalMembers > 0 && (
                        <span className="text-xs text-blue-500">
                          ({event.attendanceRate || 0}% attendance)
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                      {isUpcoming(event.date) && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full sm:w-auto border-blue-300 text-blue-800 hover:bg-blue-50"
                          onClick={() => {
                            // TODO: Implement edit functionality
                            console.log("Edit event:", event._id)
                          }}
                        >
                          Edit
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto border-blue-300 text-blue-800 hover:bg-blue-50"
                        onClick={() => {
                          window.location.href = `/leader/events/${event._id}`
                        }}
                      >
                        View Responses
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto border-blue-300 text-blue-800 hover:bg-blue-50"
                        onClick={() => {
                          // TODO: Navigate to attendance marking
                          window.location.href = "/leader/attendance"
                        }}
                      >
                        {isPast(event.date) ? "View Attendance" : "Mark Attendance"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
        </motion.div>
      </div>
    </div>
  )
}
