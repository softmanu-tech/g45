"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon, Layers, RefreshCw, Users, Wifi, Settings, TrendingUp, Award, AlertTriangle, BarChart3, MessageSquare } from "lucide-react"
import { format } from "date-fns"
import { motion } from "framer-motion"
import { fadeIn, staggerContainer } from "@/lib/motion"
import { Loading } from "@/components/ui/loading"
import { ResponsiveDashboard } from "@/components/ResponsiveDashboard"
import { ProfileIcon } from "@/components/ProfileIcon"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts'

interface StatCardProps {
    title: string
    value: number
    delay?: number
}

interface DashboardStats {
    leaders: number
    groups: number
    members: number
    totalAttendance: number
}

interface Event {
    _id: string
    title: string
    date: string
    location?: string
    description?: string
    createdBy?: {
        _id: string
        name: string
    }
    group?: {
        _id: string
        name: string
    }
    attendanceCount?: number
    totalMembers?: number
    attendanceRate?: number
}

interface AttendanceRecord {
    _id: string
    date: string
    count: number
    group?: {
        _id: string
        name: string
    }
    leader?: {
        _id: string
        name: string
    }
}

interface Member {
    _id: string
    name: string
    phone?: string
    email: string
    residence?: string
    department?: string
    group?: {
        _id: string
        name: string
    }
    attendanceCount?: number
    totalEvents?: number
    attendanceRate?: number
    rating?: string
    lastAttendanceDate?: string | null
}

function StatCard({ title, value, delay = 0 }: StatCardProps) {
    return (
        <motion.div variants={fadeIn("up", "spring", delay, 1)}>
            <Card className="bg-blue-200/90 backdrop-blur-md border border-blue-300 shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardHeader className="pb-2">
                    <CardTitle className="text-xs sm:text-sm font-medium text-blue-700 uppercase tracking-wide">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl sm:text-3xl font-bold text-blue-800">{value}</p>
                </CardContent>
            </Card>
        </motion.div>
    )
}

function TableCard<T>({
                          title,
                          headers,
                          data,
                          renderRow,
                          emptyMessage
                      }: {
    title: string
    headers: string[]
    data: T[]
    renderRow: (item: T) => string[]
    emptyMessage: string
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card>
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                {headers.map((header) => (
                                    <th key={header} className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                                        {header}
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {data.length > 0 ? (
                                data.map((item, index) => (
                                    <motion.tr
                                        key={index}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                    >
                                        {renderRow(item).map((cell, i) => (
                                            <td key={i} className="px-6 py-4 whitespace-nowrap text-sm">
                                                {cell}
                                            </td>
                                        ))}
                                    </motion.tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={headers.length} className="px-6 py-4 text-center text-sm text-blue-600">
                                        {emptyMessage}
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}


export default function BishopDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        leaders: 0,
        groups: 0,
        members: 0,
        totalAttendance: 0,
    })
    const [events, setEvents] = useState<Event[]>([])
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
    const [members, setMembers] = useState<Member[]>([])
    const [bishop, setBishop] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [error, setError] = useState("")
    const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null)
    const [groupsPerformance, setGroupsPerformance] = useState<any>(null)
    const [performanceLoading, setPerformanceLoading] = useState(false)
    const [allResponses, setAllResponses] = useState<any>(null)
    const [responsesLoading, setResponsesLoading] = useState(false)

    const parseJsonSafely = async (response: Response) => {
        try {
            const text = await response.text()
            return text ? JSON.parse(text) : null
        } catch (err) {
            console.error("Failed to parse JSON:", err)
            return null
        }
    }

    const fetchDashboardData = async () => {
        try {
            setRefreshing(true)
            setError("")

            const [statsRes, eventsRes, profileRes, membersRes] = await Promise.all([
                fetch("/api/bishop"),
                fetch("/api/events"),
                fetch("/api/bishop/profile"),
                fetch("/api/bishop/members"),
            ])

            if (!statsRes.ok) throw new Error("Failed to fetch dashboard stats")

            const statsData = await parseJsonSafely(statsRes)
            if (!statsData) throw new Error("Invalid stats data")

            // Ensure all values are numbers
            setStats({
                leaders: Number(statsData.stats?.leaders || statsData.leaders) || 0,
                groups: Number(statsData.stats?.groups || statsData.groups) || 0,
                members: Number(statsData.stats?.members || statsData.members) || 0,
                totalAttendance: Number(statsData.stats?.totalAttendance || statsData.totalAttendance) || 0,
            })

            const eventsData = await parseJsonSafely(eventsRes)
            setEvents(eventsData?.events || eventsData || [])

            // Handle profile data
            if (profileRes.ok) {
                const profileData = await parseJsonSafely(profileRes)
                if (profileData?.success) {
                    setBishop(profileData.data.user)
                }
            }

            // Handle members data
            if (membersRes.ok) {
                const membersData = await parseJsonSafely(membersRes)
                if (membersData?.success) {
                    setMembers(membersData.data.members || [])
                } else {
                    setMembers([])
                }
            } else {
                setMembers([])
            }
            
            // For now, set empty array for attendance
            // This will be populated when attendance API endpoint is fixed
            setAttendance([])

            setLastRefreshed(new Date())
        } catch (err) {
            console.error("Error fetching dashboard data:", err)
            setError("Failed to load dashboard data. Please try refreshing the page.")
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    const fetchGroupsPerformance = async () => {
        try {
            setPerformanceLoading(true)
            const response = await fetch('/api/bishop/groups-performance?months=6')
            if (response.ok) {
                const result = await response.json()
                if (result.success) {
                    setGroupsPerformance(result.data)
                }
            }
        } catch (err) {
            console.error('Error fetching groups performance:', err)
        } finally {
            setPerformanceLoading(false)
        }
    }

    const fetchAllResponses = async () => {
        try {
            setResponsesLoading(true)
            const response = await fetch('/api/bishop/all-responses?days=30')
            if (response.ok) {
                const result = await response.json()
                if (result.success) {
                    setAllResponses(result.data)
                }
            }
        } catch (err) {
            console.error('Error fetching all responses:', err)
        } finally {
            setResponsesLoading(false)
        }
    }

    useEffect(() => {
        fetchDashboardData()
        fetchGroupsPerformance()
        fetchAllResponses()

        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchDashboardData, 30000)
        
        // Refresh when window gets focus (when coming back from other pages)
        const handleFocus = () => {
            fetchDashboardData()
        }
        
        // Listen for refresh messages from other pages
        const handleMessage = (event: MessageEvent) => {
            if (event.data === 'refresh-dashboard') {
                fetchDashboardData()
            }
        }
        
        window.addEventListener('focus', handleFocus)
        window.addEventListener('message', handleMessage)
        
        return () => {
            clearInterval(interval)
            window.removeEventListener('focus', handleFocus)
            window.removeEventListener('message', handleMessage)
        }
    }, [])

    const formatDate = (dateStr: string) => {
        try {
            return format(new Date(dateStr), "MMM dd, yyyy")
        } catch {
            return "Invalid date"
        }
    }

    const formatTime = (date: Date | null) => {
        if (!date) return "Loading..."
        return format(date, "hh:mm:ss a")
    }

    return (
            <div className="min-h-screen bg-blue-300">
                {/* Header */}
                <div className="bg-blue-200/90 backdrop-blur-md border-b border-blue-300">
                    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
                        <div className="flex flex-col space-y-3 sm:space-y-4 py-3 sm:py-4 md:py-6">
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 sm:gap-4">
                                <div className="min-w-0 flex-1">
                                    <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-blue-800 truncate">Bishop Dashboard</h1>
                                    <p className="text-xs sm:text-sm text-blue-700 mt-1">Manage your church community</p>
                                </div>
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <Link href="/bishop/profile">
                                        <ProfileIcon 
                                            profilePicture={bishop?.profilePicture}
                                            name={bishop?.name}
                                            size="lg"
                                            className="hover:border-blue-600"
                                        />
                                    </Link>
                                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 w-full lg:w-auto lg:min-w-0">
                                    <Link
                                        href="/bishop/leaders"
                                        className="inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-blue-300 rounded-md shadow-sm text-xs sm:text-sm font-medium text-blue-800 bg-white/80 backdrop-blur-sm hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 min-w-0 truncate"
                                    >
                                        Leaders
                                    </Link>
                                    <Link
                                        href="/bishop/groups"
                                        className="inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-800 min-w-0 truncate"
                                    >
                                        Groups
                                    </Link>
                                    <Link
                                        href="/bishop/members"
                                        className="inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-green-300 rounded-md shadow-sm text-xs sm:text-sm font-medium text-green-800 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 min-w-0 truncate"
                                    >
                                        Members
                                    </Link>
                                    <Link
                                        href="/bishop/protocol-teams"
                                        className="inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-purple-300 rounded-md shadow-sm text-xs sm:text-sm font-medium text-purple-800 bg-purple-50 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 min-w-0 truncate"
                                    >
                                        Protocol Teams
                                    </Link>
                                    <Link
                                        href="/bishop/protocol-analytics"
                                        className="inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-teal-300 rounded-md shadow-sm text-xs sm:text-sm font-medium text-teal-800 bg-teal-50 hover:bg-teal-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 min-w-0 truncate"
                                    >
                                        Protocol Analytics
                                    </Link>
                                    <Link
                                        href="/bishop/protocol-support"
                                        className="inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-indigo-300 rounded-md shadow-sm text-xs sm:text-sm font-medium text-indigo-800 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 min-w-0 truncate"
                                    >
                                        Protocol Support
                                    </Link>
                                    <Link
                                        href="/bishop/strategy-review"
                                        className="inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-emerald-300 rounded-md shadow-sm text-xs sm:text-sm font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 min-w-0 truncate"
                                    >
                                        Strategy Review
                                    </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                        <div className="flex">
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">Error</h3>
                                <div className="mt-2 text-sm text-red-700">{error}</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {loading ? (
                    <Loading message="Loading bishop dashboard..." size="lg" fullScreen={false} />
                ) : (
                    <div className="space-y-4 sm:space-y-6">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                        <StatCard
                            title="Leaders"
                            value={stats.leaders}
                            delay={0.2}
                        />
                        <StatCard
                            title="Groups"
                            value={stats.groups}
                            delay={0.3}
                        />
                        <StatCard
                            title="Members"
                            value={stats.members}
                            delay={0.4}
                        />
                        <StatCard
                            title="Total Attendance"
                            value={stats.totalAttendance}
                            delay={0.5}
                        />
                        </div>

                        {/* Groups Performance Analytics */}
                        <div className="bg-blue-200/90 backdrop-blur-md rounded-lg shadow-sm border border-blue-300 p-4 sm:p-6">
                            <h3 className="text-base sm:text-lg font-medium text-blue-800 mb-4 flex items-center gap-2">
                                <BarChart3 className="h-5 w-5" />
                                All Groups Performance Analysis
                            </h3>
                            
                            {performanceLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                    <span className="ml-3 text-blue-700">Loading groups performance...</span>
                                </div>
                            ) : groupsPerformance ? (
                                <div className="space-y-6">
                                    {/* Performance Summary Cards */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div className="bg-white/80 p-4 rounded-lg border border-blue-200">
                                            <div className="text-2xl font-bold text-blue-800">{groupsPerformance.insights.averageAttendanceRate}%</div>
                                            <div className="text-sm text-blue-600">Church Average</div>
                                            <div className="text-xs text-gray-600 mt-1">
                                                Across {groupsPerformance.overallStats.totalGroups} groups
                                            </div>
                                        </div>
                                        
                                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                            <div className="text-2xl font-bold text-green-800">{groupsPerformance.insights.excellentGroups}</div>
                                            <div className="text-sm text-green-600">Excellent Groups</div>
                                            <div className="text-xs text-gray-600 mt-1">
                                                80%+ attendance rate
                                            </div>
                                        </div>
                                        
                                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                            <div className="text-2xl font-bold text-blue-800">{groupsPerformance.insights.improvingGroups}</div>
                                            <div className="text-sm text-blue-600">Improving Groups</div>
                                            <div className="text-xs text-gray-600 mt-1">
                                                Positive trend
                                            </div>
                                        </div>
                                        
                                        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                                            <div className="text-2xl font-bold text-amber-800">{groupsPerformance.insights.needsImprovementGroups}</div>
                                            <div className="text-sm text-amber-600">Need Attention</div>
                                            <div className="text-xs text-gray-600 mt-1">
                                                Below 50% attendance
                                            </div>
                                        </div>
                                    </div>

                                    {/* Groups Comparison Chart */}
                                    <div className="bg-white/80 p-4 rounded-lg border border-blue-200">
                                        <h4 className="text-lg font-medium text-blue-800 mb-4">Groups Attendance Comparison</h4>
                                        <ResponsiveContainer width="100%" height={350}>
                                            <BarChart data={groupsPerformance.groupPerformance}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#E0E7FF" />
                                                <XAxis 
                                                    dataKey="groupName" 
                                                    tick={{ fontSize: 10, fill: '#1E40AF' }}
                                                    angle={-45}
                                                    textAnchor="end"
                                                    height={80}
                                                />
                                                <YAxis 
                                                    tick={{ fontSize: 12, fill: '#1E40AF' }} 
                                                    domain={[0, 100]}
                                                    label={{ value: 'Attendance %', angle: -90, position: 'insideLeft' }}
                                                />
                                                <Tooltip 
                                                    formatter={(value, name) => [
                                                        name === 'attendanceRate' ? `${value}%` : value,
                                                        name === 'attendanceRate' ? 'Attendance Rate' : 
                                                        name === 'memberCount' ? 'Members' : name
                                                    ]}
                                                    contentStyle={{ 
                                                        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                                                        border: '1px solid #3B82F6',
                                                        borderRadius: '8px'
                                                    }}
                                                />
                                                <Legend />
                                                <Bar 
                                                    dataKey="attendanceRate" 
                                                    name="Attendance Rate (%)"
                                                    fill="#3B82F6"
                                                    radius={[4, 4, 0, 0]}
                                                />
                                                <Bar 
                                                    dataKey="memberCount" 
                                                    name="Member Count"
                                                    fill="#10B981"
                                                    radius={[4, 4, 0, 0]}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>

                                    {/* Church-wide Monthly Trend */}
                                    <div className="bg-white/80 p-4 rounded-lg border border-blue-200">
                                        <h4 className="text-lg font-medium text-blue-800 mb-4">Church-wide Monthly Attendance Trend</h4>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <LineChart data={groupsPerformance.churchWideMonthly}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#E0E7FF" />
                                                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#1E40AF' }} />
                                                <YAxis 
                                                    tick={{ fontSize: 12, fill: '#1E40AF' }} 
                                                    domain={[0, 100]}
                                                    label={{ value: 'Attendance %', angle: -90, position: 'insideLeft' }}
                                                />
                                                <Tooltip 
                                                    formatter={(value) => [`${value}%`, 'Attendance Rate']}
                                                    contentStyle={{ 
                                                        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                                                        border: '1px solid #3B82F6',
                                                        borderRadius: '8px'
                                                    }}
                                                />
                                                <Line 
                                                    type="monotone" 
                                                    dataKey="attendanceRate" 
                                                    stroke="#3B82F6" 
                                                    strokeWidth={3}
                                                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 5 }}
                                                    activeDot={{ r: 7, fill: '#1E40AF' }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>

                                    {/* Performance Insights */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {groupsPerformance.insights.topPerformer && (
                                            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                                <h5 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                                                    <Award className="h-4 w-4" />
                                                    Top Performing Group
                                                </h5>
                                                <p className="text-sm text-green-700">
                                                    <strong>{groupsPerformance.insights.topPerformer.groupName}</strong> leads with 
                                                    <strong>{groupsPerformance.insights.topPerformer.attendanceRate}%</strong> attendance rate
                                                </p>
                                                <p className="text-xs text-green-600 mt-1">
                                                    Leader: {groupsPerformance.insights.topPerformer.leaderName}
                                                </p>
                                            </div>
                                        )}
                                        
                                        {groupsPerformance.insights.needsAttention && (
                                            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                                                <h5 className="font-medium text-amber-800 mb-2 flex items-center gap-2">
                                                    <AlertTriangle className="h-4 w-4" />
                                                    Needs Attention
                                                </h5>
                                                <p className="text-sm text-amber-700">
                                                    <strong>{groupsPerformance.insights.needsAttention.groupName}</strong> has 
                                                    <strong>{groupsPerformance.insights.needsAttention.attendanceRate}%</strong> attendance rate
                                                </p>
                                                <p className="text-xs text-amber-600 mt-1">
                                                    Consider supporting leader: {groupsPerformance.insights.needsAttention.leaderName}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-blue-600">
                                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>Groups performance analytics will appear here once data is available.</p>
                                </div>
                            )}
                        </div>

                        {/* All Member Responses Overview */}
                        <div className="bg-blue-200/90 backdrop-blur-md rounded-lg shadow-sm border border-blue-300 p-4 sm:p-6">
                            <h3 className="text-base sm:text-lg font-medium text-blue-800 mb-4 flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Recent Member Responses (Last 30 Days)
                            </h3>
                            
                            {responsesLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                    <span className="ml-3 text-blue-700">Loading member responses...</span>
                                </div>
                            ) : allResponses ? (
                                <div className="space-y-6">
                                    {/* Response Summary Cards */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                            <div className="text-2xl font-bold text-green-800">{allResponses.summary.attendingCount}</div>
                                            <div className="text-sm text-green-600">Will Attend</div>
                                            <div className="text-xs text-gray-600 mt-1">Confirmations received</div>
                                        </div>
                                        
                                        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                                            <div className="text-2xl font-bold text-red-800">{allResponses.summary.notAttendingCount}</div>
                                            <div className="text-sm text-red-600">Won't Attend</div>
                                            <div className="text-xs text-gray-600 mt-1">Apologies received</div>
                                        </div>
                                        
                                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                            <div className="text-2xl font-bold text-blue-800">{allResponses.summary.responseRate}%</div>
                                            <div className="text-sm text-blue-600">Response Rate</div>
                                            <div className="text-xs text-gray-600 mt-1">Member engagement</div>
                                        </div>
                                        
                                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                                            <div className="text-2xl font-bold text-purple-800">{allResponses.needsFollowUp.length}</div>
                                            <div className="text-sm text-purple-600">Need Follow-up</div>
                                            <div className="text-xs text-gray-600 mt-1">No recent responses</div>
                                        </div>
                                    </div>

                                    {/* Members Not Attending with Reasons */}
                                    <div className="bg-white/80 p-4 rounded-lg border border-blue-200">
                                        <h4 className="text-lg font-medium text-blue-800 mb-4 flex items-center gap-2">
                                            <AlertTriangle className="h-5 w-5 text-red-600" />
                                            Members Not Attending - Apology Reasons
                                        </h4>
                                        {allResponses.responses.notAttending.length === 0 ? (
                                            <div className="text-center py-8">
                                                <Users className="mx-auto h-12 w-12 text-blue-400 mb-4" />
                                                <p className="text-blue-600">No apologies received in the last 30 days</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                                {allResponses.responses.notAttending.map((response: any) => (
                                                    <motion.div
                                                        key={response._id}
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="p-4 bg-red-50 rounded-lg border border-red-200"
                                                    >
                                                        <div className="space-y-3">
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex-1">
                                                                    <div className="font-medium text-red-800">{response.member.name}</div>
                                                                    <div className="text-sm text-red-600">{response.member.email}</div>
                                                                    <div className="text-xs text-red-500">
                                                                        Group: {response.member.group?.name || 'No Group'}
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className="text-sm font-medium text-red-700">{response.event.title}</div>
                                                                    <div className="text-xs text-red-500">
                                                                        {format(new Date(response.event.date), "MMM dd, yyyy")}
                                                                    </div>
                                                                    <div className="text-xs text-red-400">
                                                                        Response: {format(new Date(response.responseDate), "MMM dd, h:mm a")}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            {response.reason && (
                                                                <div className="mt-3 p-3 bg-red-100 rounded border-l-4 border-red-400">
                                                                    <div className="flex items-start gap-2">
                                                                        <MessageSquare className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                                                                        <div>
                                                                            <div className="text-xs font-medium text-red-700 mb-1">Reason for not attending:</div>
                                                                            <div className="text-sm text-red-800 font-medium">{response.reason}</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Members Needing Follow-up */}
                                    {allResponses.needsFollowUp.length > 0 && (
                                        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                                            <h4 className="text-lg font-medium text-amber-800 mb-4 flex items-center gap-2">
                                                <AlertTriangle className="h-5 w-5" />
                                                Members Needing Follow-up
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {allResponses.needsFollowUp.map((item: any) => (
                                                    <div key={item.member._id} className="bg-white p-3 rounded border border-amber-300">
                                                        <div className="font-medium text-amber-800">{item.member.name}</div>
                                                        <div className="text-sm text-amber-600">{item.member.email}</div>
                                                        <div className="text-xs text-amber-500 mt-1">
                                                            {item.unrespondedEvents} unresponded events
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-blue-600">
                                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>Member responses will appear here once available.</p>
                                </div>
                            )}
                        </div>

                        {/* Dashboard Content */}
                        <ResponsiveDashboard
                            attendance={attendance}
                            events={events}
                            members={members}
                            formatDate={formatDate}
                        />
                    </div>
            )}
            </div>
        </div>
    )
}