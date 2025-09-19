"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { Calendar, MapPin, FileText, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { QuickLoading } from "@/components/ui/loading"

interface Event {
  _id: string
  title: string
  date: string
  location?: string
  description?: string
  group: string
  createdBy: string
}

interface CreateEventFormProps {
  groupId?: string
  onEventCreated: (event: Event) => void
}

export function CreateEventForm({ onEventCreated }: CreateEventFormProps) {
  const [title, setTitle] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [location, setLocation] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Validate required fields
      if (!title.trim()) {
        throw new Error("Event title is required")
      }
      if (!date) {
        throw new Error("Event date is required")
      }
      if (!time) {
        throw new Error("Event time is required")
      }

      // Combine date and time
      const eventDateTime = new Date(`${date}T${time}`)
      
      // Validate that the event is not in the past
      if (eventDateTime < new Date()) {
        throw new Error("Event cannot be scheduled in the past")
      }

      const eventData = {
        title: title.trim(),
        date: eventDateTime.toISOString(),
        location: location.trim() || undefined,
        description: description.trim() || undefined,
      }

      const response = await fetch("/api/leader/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(eventData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create event")
      }

      const result = await response.json()
      
      if (result.success && result.data) {
        // Reset form
        setTitle("")
        setDate("")
        setTime("")
        setLocation("")
        setDescription("")
        
        // Call the success callback
        onEventCreated(result.data)
      } else {
        throw new Error("Failed to create event")
      }
    } catch (err) {
      console.error("Error creating event:", err)
      setError(err instanceof Error ? err.message : "Failed to create event")
    } finally {
      setLoading(false)
    }
  }

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0]
  
  // Get minimum time if date is today
  const now = new Date()
  const isToday = date === today
  const minTime = isToday ? now.toTimeString().slice(0, 5) : "00:00"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto"
    >
      <Card className="bg-blue-200/90 backdrop-blur-md shadow-lg border border-blue-300">
        <CardHeader className="bg-blue-200/90 backdrop-blur-md text-blue-800 rounded-t-lg border-b border-blue-300">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Create New Event
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6 bg-blue-200/90 backdrop-blur-md">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
              >
                {error}
              </motion.div>
            )}

            {/* Event Title */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-blue-800">
                Event Title *
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600 h-4 w-4" />
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-blue-800 bg-white/90 text-blue-800 placeholder-blue-600"
                  placeholder="Enter event title"
                  required
                  disabled={loading}
                  maxLength={100}
                />
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-blue-800">
                  Event Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600 h-4 w-4" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-blue-800 bg-white/90 text-blue-800"
                    required
                    disabled={loading}
                    min={today}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-blue-800">
                  Event Time *
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600 h-4 w-4" />
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-blue-800 bg-white/90 text-blue-800"
                    required
                    disabled={loading}
                    min={minTime}
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-blue-800">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600 h-4 w-4" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-blue-800 bg-white/90 text-blue-800 placeholder-blue-600"
                  placeholder="Enter event location (optional)"
                  disabled={loading}
                  maxLength={200}
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-blue-800">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-blue-800 resize-vertical bg-white/90 text-blue-800 placeholder-blue-600"
                placeholder="Enter event description (optional)"
                disabled={loading}
                rows={4}
                maxLength={500}
              />
              <div className="text-xs text-blue-600 text-right">
                {description.length}/500 characters
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-blue-300 text-blue-800 bg-white/80 hover:bg-white/90"
                disabled={loading}
                onClick={() => {
                  setTitle("")
                  setDate("")
                  setTime("")
                  setLocation("")
                  setDescription("")
                  setError("")
                }}
              >
                Clear Form
              </Button>
              
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                disabled={loading}
              >
                {loading ? (
                  <QuickLoading message="Creating event..." />
                ) : (
                  "Create Event"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}