"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loading } from "@/components/ui/loading"
import { useAlerts } from "@/components/ui/alert-system"
import { format } from "date-fns"
import Link from "next/link"
import {
  User,
  Calendar,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  LogOut,
  MessageSquare,
  Star,
  Target,
  Award,
  MapPin,
  Phone,
  Mail,
  Heart,
  Users,
  BookOpen,
  Settings
} from "lucide-react"
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts'

interface VisitorDashboardData {
  visitor: {
    _id: string
    name: string
    email: string
    phone?: string
    address?: string
    type: string
    status: string
    monitoringStartDate: string
    monitoringEndDate: string
    monitoringStatus: string
    attendanceRate: number
    monitoringProgress: number
    daysRemaining: number
    protocolTeam: {
      name: string
    }
    assignedProtocolMember: {
      name: string
      email: string
    }
  }
  visitHistory: {
    date: string
    eventType: string
    attendanceStatus: string
    notes?: string
  }[]
  milestones: {
    week: number
    completed: boolean
    notes?: string
    completedDate?: string
  }[]
  upcomingEvents: {
    _id: string
    title: string
    date: string
    location?: string
    description?: string
  }[]
  suggestions: {
    date: string
    message: string
    category: string
  }[]
  experiences: {
    date: string
    rating: number
    message: string
    eventType?: string
  }[]
  statistics: {
    totalVisits: number
    presentCount: number
    attendanceRate: number
    completedMilestones: number
    averageRating: number
    daysInProgram: number
  }
}

export default function VisitorDashboard() {
  const alerts = useAlerts()
  
  const [data, setData] = useState<VisitorDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showSuggestionModal, setShowSuggestionModal] = useState(false)
  const [showExperienceModal, setShowExperienceModal] = useState(false)
  const [newSuggestion, setNewSuggestion] = useState({ message: '', category: 'service' })
  const [newExperience, setNewExperience] = useState({ rating: 5, message: '', eventType: '' })

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/visitor/dashboard', {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch visitor dashboard data")
      }

      const result = await response.json()
      if (result.success) {
        setData(result.data)
      } else {
        throw new Error(result.error || "Failed to fetch dashboard data")
      }
    } catch (err) {
      console.error("Error fetching visitor data:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch visitor data")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" })
      window.location.href = "/"
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const submitSuggestion = async () => {
    try {
      const response = await fetch('/api/visitor/suggestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newSuggestion)
      })

      if (response.ok) {
        alerts.success("Suggestion Submitted", "Thank you for your feedback!")
        setShowSuggestionModal(false)
        setNewSuggestion({ message: '', category: 'service' })
        fetchData()
      }
    } catch (error) {
      alerts.error("Failed to Submit", "Please try again later.")
    }
  }

  const submitExperience = async () => {
    try {
      const response = await fetch('/api/visitor/experience', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newExperience)
      })

      if (response.ok) {
        alerts.success("Experience Shared", "Thank you for sharing your experience!")
        setShowExperienceModal(false)
        setNewExperience({ rating: 5, message: '', eventType: '' })
        fetchData()
      }
    } catch (error) {
      alerts.error("Failed to Submit", "Please try again later.")
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) {
    return <Loading message="Loading your visitor dashboard..." size="lg" />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-purple-300 flex items-center justify-center px-4">
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

  if (!data) {
    return (
      <div className="min-h-screen bg-purple-300 flex items-center justify-center px-4">
        <div className="bg-purple-200/90 backdrop-blur-md rounded-lg p-6 border border-purple-300 text-center">
          <p className="text-purple-800">No visitor data available.</p>
          <button 
            onClick={fetchData}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            Refresh
          </button>
        </div>
      </div>
    )
  }

  const milestoneData = data.milestones.map(milestone => ({
    week: `Week ${milestone.week}`,
    completed: milestone.completed ? 100 : 0,
    status: milestone.completed ? 'Completed' : 'Pending'
  }))

  const visitTrendData = data.visitHistory.slice(-8).map((visit, index) => ({
    visit: `Visit ${index + 1}`,
    attended: visit.attendanceStatus === 'present' ? 1 : 0,
    date: format(new Date(visit.date), 'MMM dd')
  }))

  return (
    <div className="min-h-screen bg-purple-300">
      {/* Header */}
      <div className="bg-purple-200/90 backdrop-blur-md border-b border-purple-300">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 sm:py-6 gap-3 sm:gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-purple-800 truncate">
                Welcome, {data.visitor.name}! 🌟
              </h1>
              <p className="text-xs sm:text-sm text-purple-700 mt-1">
                Joining Visitor • {data.visitor.daysRemaining} days remaining in monitoring
              </p>
              <p className="text-xs text-purple-600">
                Guided by {data.visitor.assignedProtocolMember.name} • {data.visitor.protocolTeam.name}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/visitor/profile">
                <Button 
                  variant="outline"
                  size="sm"
                  className="border-purple-300 text-purple-800 bg-white/80 hover:bg-white/90"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Profile
                </Button>
              </Link>
              <Button 
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="border-purple-300 text-purple-800 bg-white/80 hover:bg-white/90"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 space-y-6">
        
        {/* Progress Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card className="bg-purple-200/90 backdrop-blur-md border border-purple-300">
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-600 rounded-full flex items-center justify-center">
                  <Target className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
              </div>
              <p className="text-xs sm:text-sm font-medium text-purple-700 uppercase tracking-wide">Monitoring Progress</p>
              <p className="text-xl sm:text-2xl font-bold text-purple-800">{data.visitor.monitoringProgress}%</p>
            </CardContent>
          </Card>

          <Card className="bg-purple-200/90 backdrop-blur-md border border-purple-300">
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-500 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
              </div>
              <p className="text-xs sm:text-sm font-medium text-purple-700 uppercase tracking-wide">Attendance Rate</p>
              <p className="text-xl sm:text-2xl font-bold text-purple-800">{data.statistics.attendanceRate}%</p>
            </CardContent>
          </Card>

          <Card className="bg-purple-200/90 backdrop-blur-md border border-purple-300">
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-700 rounded-full flex items-center justify-center">
                  <Award className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
              </div>
              <p className="text-xs sm:text-sm font-medium text-purple-700 uppercase tracking-wide">Milestones</p>
              <p className="text-xl sm:text-2xl font-bold text-purple-800">{data.statistics.completedMilestones}/12</p>
            </CardContent>
          </Card>

          <Card className="bg-purple-200/90 backdrop-blur-md border border-purple-300">
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-400 rounded-full flex items-center justify-center">
                  <Star className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
              </div>
              <p className="text-xs sm:text-sm font-medium text-purple-700 uppercase tracking-wide">Average Rating</p>
              <p className="text-xl sm:text-2xl font-bold text-purple-800">{data.statistics.averageRating}/5</p>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Milestone Progress Chart */}
          <Card className="bg-purple-200/90 backdrop-blur-md border border-purple-300">
            <CardHeader>
              <CardTitle className="text-purple-800 flex items-center gap-2">
                <Target className="h-5 w-5" />
                3-Month Journey Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={milestoneData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E0E7FF" />
                    <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#6B21A8' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#6B21A8' }} domain={[0, 100]} />
                    <Tooltip 
                      formatter={(value, name) => [value === 100 ? 'Completed' : 'Pending', 'Status']}
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                        border: '1px solid #A855F7',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar 
                      dataKey="completed" 
                      fill="#A855F7"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-sm text-purple-700 mb-2">
                  <span>Overall Progress</span>
                  <span>{data.visitor.monitoringProgress}%</span>
                </div>
                <div className="w-full bg-purple-100 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${data.visitor.monitoringProgress}%` }}
                  ></div>
                </div>
                <div className="text-xs text-purple-600 mt-1">
                  {data.visitor.daysRemaining} days remaining until membership eligibility
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Analytics */}
          <Card className="bg-purple-200/90 backdrop-blur-md border border-purple-300">
            <CardHeader>
              <CardTitle className="text-purple-800 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Attendance Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <div className="relative">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Present', value: data.statistics.presentCount, color: '#A855F7' },
                          { name: 'Absent', value: data.statistics.totalVisits - data.statistics.presentCount, color: '#E5E7EB' }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        <Cell fill="#A855F7" />
                        <Cell fill="#E5E7EB" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-800">
                          {data.statistics.attendanceRate}%
                        </div>
                        <div className="text-xs text-purple-600">Attendance</div>
                      </div>
                    </div>
                  </div>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            onClick={() => setShowSuggestionModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white p-4 h-auto flex-col gap-2"
          >
            <MessageSquare className="h-6 w-6" />
            <span>Share Suggestion</span>
          </Button>
          
          <Button
            onClick={() => setShowExperienceModal(true)}
            className="bg-purple-500 hover:bg-purple-600 text-white p-4 h-auto flex-col gap-2"
          >
            <Star className="h-6 w-6" />
            <span>Share Experience</span>
          </Button>
          
          <Link href="/visitor/events">
            <Button
              variant="outline"
              className="border-purple-300 text-purple-800 hover:bg-purple-50 p-4 h-auto flex-col gap-2 w-full"
            >
              <Calendar className="h-6 w-6" />
              <span>View Events</span>
            </Button>
          </Link>
          
          <Link href="/visitor/milestones">
            <Button
              variant="outline"
              className="border-purple-300 text-purple-800 hover:bg-purple-50 p-4 h-auto flex-col gap-2 w-full"
            >
              <Target className="h-6 w-6" />
              <span>My Milestones</span>
            </Button>
          </Link>
        </div>

        {/* Recent Activity & Upcoming Events */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Recent Visits */}
          <Card className="bg-purple-200/90 backdrop-blur-md border border-purple-300">
            <CardHeader>
              <CardTitle className="text-purple-800 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Visits
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.visitHistory.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="mx-auto h-12 w-12 text-purple-400 mb-4" />
                  <p className="text-purple-600">No visits recorded yet</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {data.visitHistory.slice(-5).map((visit, index) => (
                    <div
                      key={index}
                      className="p-3 bg-white/80 rounded-lg border border-purple-200"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            {visit.attendanceStatus === 'present' ? (
                              <CheckCircle className="h-4 w-4 text-purple-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-purple-400" />
                            )}
                            <span className="font-medium text-purple-800">{visit.eventType}</span>
                          </div>
                          <p className="text-sm text-purple-600">
                            {format(new Date(visit.date), "MMM dd, yyyy")}
                          </p>
                          {visit.notes && (
                            <p className="text-xs text-purple-500 mt-1">{visit.notes}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card className="bg-purple-200/90 backdrop-blur-md border border-purple-300">
            <CardHeader>
              <CardTitle className="text-purple-800 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.upcomingEvents.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="mx-auto h-12 w-12 text-purple-400 mb-4" />
                  <p className="text-purple-600">No upcoming events</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.upcomingEvents.map((event) => (
                    <div
                      key={event._id}
                      className="p-3 bg-white/80 rounded-lg border border-purple-200"
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-purple-800 text-sm truncate">
                            {event.title}
                          </h4>
                          <div className="text-xs text-purple-600 space-y-1">
                            <div>{format(new Date(event.date), "MMM dd, yyyy 'at' h:mm a")}</div>
                            {event.location && <div>📍 {event.location}</div>}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            className="bg-purple-600 hover:bg-purple-700 text-white text-xs"
                          >
                            Will Attend
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-purple-300 text-purple-800 hover:bg-purple-50 text-xs"
                          >
                            Can't Attend
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Feedback Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Recent Suggestions */}
          <Card className="bg-purple-200/90 backdrop-blur-md border border-purple-300">
            <CardHeader>
              <CardTitle className="text-purple-800 flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Your Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.suggestions.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="mx-auto h-12 w-12 text-purple-400 mb-4" />
                  <p className="text-purple-600">No suggestions yet</p>
                  <Button
                    onClick={() => setShowSuggestionModal(true)}
                    size="sm"
                    className="mt-2 bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Share Your First Suggestion
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {data.suggestions.slice(-3).map((suggestion, index) => (
                    <div key={index} className="p-3 bg-white/80 rounded-lg border border-purple-200">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                          {suggestion.category}
                        </span>
                        <span className="text-xs text-purple-500">
                          {format(new Date(suggestion.date), "MMM dd")}
                        </span>
                      </div>
                      <p className="text-sm text-purple-700">{suggestion.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Experiences */}
          <Card className="bg-purple-200/90 backdrop-blur-md border border-purple-300">
            <CardHeader>
              <CardTitle className="text-purple-800 flex items-center gap-2">
                <Star className="h-5 w-5" />
                Your Experiences
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.experiences.length === 0 ? (
                <div className="text-center py-8">
                  <Star className="mx-auto h-12 w-12 text-purple-400 mb-4" />
                  <p className="text-purple-600">No experiences shared yet</p>
                  <Button
                    onClick={() => setShowExperienceModal(true)}
                    size="sm"
                    className="mt-2 bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Share Your Experience
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {data.experiences.slice(-3).map((experience, index) => (
                    <div key={index} className="p-3 bg-white/80 rounded-lg border border-purple-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < experience.rating ? 'fill-yellow-400 text-yellow-400' : 'text-purple-400'}`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-purple-500">
                          {format(new Date(experience.date), "MMM dd")}
                        </span>
                      </div>
                      <p className="text-sm text-purple-700">{experience.message}</p>
                      {experience.eventType && (
                        <p className="text-xs text-purple-500 mt-1">Event: {experience.eventType}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Suggestion Modal */}
      {showSuggestionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Share Your Suggestion
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-purple-800 mb-2">Category</label>
                  <select
                    value={newSuggestion.category}
                    onChange={(e) => setNewSuggestion({...newSuggestion, category: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="service">Service</option>
                    <option value="facility">Facility</option>
                    <option value="community">Community</option>
                    <option value="spiritual">Spiritual</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-purple-800 mb-2">Your Suggestion</label>
                  <textarea
                    value={newSuggestion.message}
                    onChange={(e) => setNewSuggestion({...newSuggestion, message: e.target.value})}
                    placeholder="Share your suggestion to help us improve..."
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[100px]"
                    maxLength={500}
                  />
                  <div className="text-xs text-purple-600 mt-1">
                    {newSuggestion.message.length}/500 characters
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => setShowSuggestionModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={submitSuggestion}
                  disabled={!newSuggestion.message.trim()}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  Submit
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Experience Modal */}
      {showExperienceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Share Your Experience
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-purple-800 mb-2">Rating</label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <Star
                        key={rating}
                        className={`h-8 w-8 cursor-pointer ${
                          rating <= newExperience.rating 
                            ? 'fill-yellow-400 text-yellow-400' 
                            : 'text-purple-400 hover:text-yellow-300'
                        }`}
                        onClick={() => setNewExperience({...newExperience, rating})}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-purple-800 mb-2">Event Type (Optional)</label>
                  <input
                    type="text"
                    value={newExperience.eventType}
                    onChange={(e) => setNewExperience({...newExperience, eventType: e.target.value})}
                    placeholder="e.g., Sunday Service, Bible Study..."
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-purple-800 mb-2">Your Experience</label>
                  <textarea
                    value={newExperience.message}
                    onChange={(e) => setNewExperience({...newExperience, message: e.target.value})}
                    placeholder="Tell us about your experience..."
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[100px]"
                    maxLength={500}
                  />
                  <div className="text-xs text-purple-600 mt-1">
                    {newExperience.message.length}/500 characters
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => setShowExperienceModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={submitExperience}
                  disabled={!newExperience.message.trim()}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  Submit
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
