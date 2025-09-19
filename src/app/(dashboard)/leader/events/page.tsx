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
    <div className="min-h-screen bg-blue-300 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6 max-w-7xl mx-auto"
      >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-blue-800">My Events</h1>
          <p className="text-blue-700 mt-1">Manage and track your group events</p>
        </div>
        <Link href="/leader/events/create">
          <Button className="bg-white text-blue-600 hover:bg-blue-50 flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Event
          </Button>
        </Link>
      </div>

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
        <Card className="text-center py-12">
          <CardContent>
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Events Yet</h3>
            <p className="text-gray-500 mb-6">
              You haven't created any events yet. Create your first event to get started!
            </p>
            <Link href="/leader/events/create">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Event
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {events.map((event) => (
            <motion.div
              key={event._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card className={`${
                isUpcoming(event.date) 
                  ? "border-green-200 bg-green-50" 
                  : isPast(event.date)
                  ? "border-gray-200 bg-gray-50"
                  : "border-blue-200 bg-blue-50"
              }`}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-xl font-bold text-gray-800">
                        {event.title}
                      </CardTitle>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(event.date)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatTime(event.date)}
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {event.location}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        isUpcoming(event.date)
                          ? "bg-green-100 text-green-800"
                          : isPast(event.date)
                          ? "bg-gray-100 text-gray-800"
                          : "bg-blue-100 text-blue-800"
                      }`}>
                        {isUpcoming(event.date) ? "Upcoming" : isPast(event.date) ? "Past" : "Today"}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  {event.description && (
                    <p className="text-gray-700 mb-4">{event.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Users className="h-4 w-4" />
                      {event.attendance.length} attendee{event.attendance.length !== 1 ? "s" : ""}
                    </div>
                    
                    <div className="flex gap-2">
                      {isUpcoming(event.date) && (
                        <Button
                          variant="outline"
                          size="sm"
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
                        onClick={() => {
                          // TODO: Navigate to attendance marking
                          console.log("Mark attendance for:", event._id)
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
  )
}
