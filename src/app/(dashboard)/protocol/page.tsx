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
  Users,
  UserPlus,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  LogOut,
  Settings,
  Award,
  AlertTriangle,
  Calendar,
  Target,
  Star,
  MessageSquare,
  Phone,
  MapPin,
  Mail,
  BookOpen
} from "lucide-react"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts'

interface ProtocolDashboardData {
  protocolMember: {
    name: string
    email: string
    team: {
      name: string
      description?: string
    }
  }
  visitors: {
    _id: string
    name: string
    email: string
    phone?: string
    address?: string
    type: string
    status: string
    monitoringStatus: string
    attendanceRate: number
    monitoringProgress: number
    daysRemaining: number
    createdAt: string
  }[]
  statistics: {
    totalVisitors: number
    joiningVisitors: number
    visitingOnly: number
    activeMonitoring: number
    completedMonitoring: number
    convertedToMembers: number
    needsAttention: number
    conversionRate: number
  }
}

export default function ProtocolDashboard() {
  const alerts = useAlerts()
  
  const [data, setData] = useState<ProtocolDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateVisitor, setShowCreateVisitor] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/protocol/visitors', {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch protocol dashboard data")
      }

      const result = await response.json()
      if (result.success) {
        setData(result.data)
      } else {
        throw new Error(result.error || "Failed to fetch dashboard data")
      }
    } catch (err) {
      console.error("Error fetching protocol data:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch protocol data")
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

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) {
    return <Loading message="Loading protocol dashboard..." size="lg" />
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

  if (!data) {
    return (
      <div className="min-h-screen bg-blue-300 flex items-center justify-center px-4">
        <div className="bg-blue-200/90 backdrop-blur-md rounded-lg p-6 border border-blue-300 text-center">
          <p className="text-blue-800">No protocol data available.</p>
          <button 
            onClick={fetchData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
      </div>
    )
  }

  const visitorTypeData = [
    { name: 'Joining', value: data.statistics.joiningVisitors, color: '#10B981' },
    { name: 'Visiting', value: data.statistics.visitingOnly, color: '#6B7280' }
  ]

  const monitoringStatusData = [
    { name: 'Active', value: data.statistics.activeMonitoring, color: '#3B82F6' },
    { name: 'Completed', value: data.statistics.completedMonitoring, color: '#10B981' },
    { name: 'Converted', value: data.statistics.convertedToMembers, color: '#8B5CF6' }
  ]

  return (
    <div className="min-h-screen bg-blue-300">
      {/* Header */}
      <div className="bg-blue-200/90 backdrop-blur-md border-b border-blue-300">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 sm:py-6 gap-3 sm:gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-blue-800 truncate">
                Protocol Dashboard - {data.protocolMember.name}
              </h1>
              <p className="text-xs sm:text-sm text-blue-700 mt-1">
                {data.protocolMember.team.name} • Managing {data.statistics.totalVisitors} visitors
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setShowCreateVisitor(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Visitor
              </Button>
              <Link href="/protocol/strategies">
                <Button 
                  variant="outline"
                  size="sm"
                  className="border-green-300 text-green-800 bg-green-50 hover:bg-green-100"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Strategies
                </Button>
              </Link>
              <Link href="/protocol/profile">
                <Button 
                  variant="outline"
                  size="sm"
                  className="border-blue-300 text-blue-800 bg-white/80 hover:bg-white/90"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Profile
                </Button>
              </Link>
              <Button 
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="border-blue-300 text-blue-800 bg-white/80 hover:bg-white/90"
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
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <Card className="bg-blue-200/90 backdrop-blur-md border border-blue-300">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-lg sm:text-xl font-bold text-blue-800">{data.statistics.totalVisitors}</div>
              <div className="text-xs sm:text-sm text-blue-600">Total Visitors</div>
            </CardContent>
          </Card>
          
          <Card className="bg-blue-100 border border-blue-300">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-lg sm:text-xl font-bold text-blue-800">{data.statistics.joiningVisitors}</div>
              <div className="text-xs sm:text-sm text-blue-600">Joining</div>
            </CardContent>
          </Card>
          
          <Card className="bg-blue-100 border border-blue-300">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-lg sm:text-xl font-bold text-blue-800">{data.statistics.activeMonitoring}</div>
              <div className="text-xs sm:text-sm text-blue-600">Monitoring</div>
            </CardContent>
          </Card>
          
          <Card className="bg-blue-100 border border-blue-300">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-lg sm:text-xl font-bold text-blue-800">{data.statistics.convertedToMembers}</div>
              <div className="text-xs sm:text-sm text-blue-600">Converted</div>
            </CardContent>
          </Card>
          
          <Card className="bg-amber-100 border border-amber-300">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-lg sm:text-xl font-bold text-amber-800">{data.statistics.needsAttention}</div>
              <div className="text-xs sm:text-sm text-amber-600">Need Attention</div>
            </CardContent>
          </Card>
          
          <Card className="bg-indigo-100 border border-indigo-300">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-lg sm:text-xl font-bold text-indigo-800">{data.statistics.conversionRate}%</div>
              <div className="text-xs sm:text-sm text-indigo-600">Conversion Rate</div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Visitor Types Distribution */}
          <Card className="bg-blue-200/90 backdrop-blur-md border border-blue-300">
            <CardHeader>
              <CardTitle className="text-blue-800 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Visitor Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={visitorTypeData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {visitorTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Monitoring Status */}
          <Card className="bg-blue-200/90 backdrop-blur-md border border-blue-300">
            <CardHeader>
              <CardTitle className="text-blue-800 flex items-center gap-2">
                <Target className="h-5 w-5" />
                Monitoring Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monitoringStatusData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E0E7FF" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#166534' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#166534' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                        border: '1px solid #10B981',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="value" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Visitors List */}
        <Card className="bg-blue-200/90 backdrop-blur-md border border-blue-300">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Your Assigned Visitors ({data.visitors.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.visitors.length === 0 ? (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-blue-400 mb-4" />
                <p className="text-blue-600">No visitors assigned yet</p>
                <Button
                  onClick={() => setShowCreateVisitor(true)}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Register First Visitor
                </Button>
              </div>
            ) : (
              <>
                {/* Mobile Card Layout */}
                <div className="block lg:hidden space-y-4">
                  {data.visitors.map((visitor) => (
                    <motion.div
                      key={visitor._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white/80 rounded-lg border border-blue-200 p-4"
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-blue-800">{visitor.name}</h3>
                            <p className="text-sm text-blue-600">{visitor.email}</p>
                            {visitor.phone && (
                              <p className="text-xs text-blue-500">📞 {visitor.phone}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${ 
                              visitor.status === 'joining' ? 'bg-blue-100 text-blue-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {visitor.status}
                            </span>
                            {visitor.status === 'joining' && (
                              <div className="text-xs text-blue-600 mt-1">
                                {visitor.daysRemaining} days left
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {visitor.status === 'joining' && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-blue-700">Progress:</span>
                              <span className="font-medium text-blue-800">{visitor.monitoringProgress}%</span>
                            </div>
                            <div className="w-full bg-blue-100 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${visitor.monitoringProgress}%` }}
                              ></div>
                            </div>
                            <div className="flex justify-between text-xs text-blue-600">
                              <span>Attendance: {visitor.attendanceRate}%</span>
                              <span className={visitor.monitoringStatus === 'active' ? 'text-blue-600' : 'text-blue-600'}>
                                {visitor.monitoringStatus}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Desktop Table Layout */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-blue-300">
                        <th className="text-left p-3 text-sm font-medium text-blue-800">Visitor</th>
                        <th className="text-left p-3 text-sm font-medium text-blue-800">Contact</th>
                        <th className="text-left p-3 text-sm font-medium text-blue-800">Status</th>
                        <th className="text-left p-3 text-sm font-medium text-blue-800">Progress</th>
                        <th className="text-left p-3 text-sm font-medium text-blue-800">Performance</th>
                        <th className="text-left p-3 text-sm font-medium text-blue-800">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.visitors.map((visitor) => (
                        <tr
                          key={visitor._id}
                          className="border-b border-blue-200 hover:bg-white/50 transition-colors"
                        >
                          <td className="p-3">
                            <div>
                              <div className="font-medium text-blue-800">{visitor.name}</div>
                              <div className="text-sm text-blue-600">{visitor.email}</div>
                              <div className="text-xs text-blue-500">
                                {visitor.type} • Since {format(new Date(visitor.createdAt), "MMM dd")}
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="space-y-1 text-sm">
                              {visitor.phone && (
                                <div className="flex items-center gap-1 text-blue-600">
                                  <Phone className="h-3 w-3" />
                                  <span>{visitor.phone}</span>
                                </div>
                              )}
                              {visitor.address && (
                                <div className="flex items-center gap-1 text-blue-600">
                                  <MapPin className="h-3 w-3" />
                                  <span className="truncate max-w-32">{visitor.address}</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${ 
                              visitor.status === 'joining' ? 'bg-blue-100 text-blue-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {visitor.status}
                            </span>
                            {visitor.status === 'joining' && (
                              <div className="text-xs text-blue-600 mt-1">
                                {visitor.daysRemaining} days left
                              </div>
                            )}
                          </td>
                          <td className="p-3">
                            {visitor.status === 'joining' ? (
                              <div className="space-y-1">
                                <div className="text-sm font-medium text-blue-800">
                                  {visitor.monitoringProgress}%
                                </div>
                                <div className="w-16 bg-blue-100 rounded-full h-2">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{ width: `${visitor.monitoringProgress}%` }}
                                  ></div>
                                </div>
                              </div>
                            ) : (
                              <span className="text-blue-600 text-sm">N/A</span>
                            )}
                          </td>
                          <td className="p-3">
                            <div className="space-y-1">
                              <div className={`text-sm font-medium ${ 
                                visitor.attendanceRate >= 80 ? 'text-blue-600' :
                                visitor.attendanceRate >= 60 ? 'text-blue-600' :
                                visitor.attendanceRate >= 40 ? 'text-yellow-600' :
                                'text-red-600'
                              }`}>
                                {visitor.attendanceRate}%
                              </div>
                              <div className="text-xs text-blue-600">
                                Attendance
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex gap-1">
                              <Link href={`/protocol/visitors/${visitor._id}`}>
                                <Button size="sm" variant="outline" className="text-xs">
                                  View
                                </Button>
                              </Link>
                              {visitor.status === 'joining' && (
                                <Link href={`/protocol/visitors/${visitor._id}/milestones`}>
                                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs">
                                    Track
                                  </Button>
                                </Link>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
