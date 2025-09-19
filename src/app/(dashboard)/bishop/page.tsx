"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon, Layers, RefreshCw, Users, Wifi } from "lucide-react"
import { format } from "date-fns"
import { motion } from "framer-motion"
import { fadeIn, staggerContainer } from "@/lib/motion"
import { Loading } from "@/components/ui/loading"

interface StatCardProps {
    title: string
    value: number
    borderColor: string
    textColor: string
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
    createdBy?: {
        _id: string
        name: string
    }
    group?: {
        _id: string
        name: string
    }
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
    email?: string
    group?: {
        _id: string
        name: string
    }
}

function StatCard({ title, value, borderColor, textColor, delay = 0 }: StatCardProps) {
    return (
        <motion.div variants={fadeIn("up", "spring", delay, 1)}>
            <Card className="bg-blue-200/90 backdrop-blur-md border border-blue-300 shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-blue-700 uppercase tracking-wide">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold text-blue-800">{value}</p>
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
                                    <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                                    <td colSpan={headers.length} className="px-6 py-4 text-center text-sm text-gray-500">
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

function DashboardTabs({
                           attendance,
                           events,
                           members,
                           formatDate
                       }: {
    attendance: AttendanceRecord[]
    events: Event[]
    members: Member[]
    formatDate: (dateStr: string) => string
}) {
    return (
        <div className="bg-blue-200/90 backdrop-blur-md rounded-lg shadow-sm border border-blue-300">
        <Tabs defaultValue="attendance" className="w-full">
                <div className="border-b border-blue-300">
                    <TabsList className="bg-transparent border-0 w-full justify-start p-0">
                        <TabsTrigger 
                            value="attendance" 
                            className="flex items-center gap-2 px-6 py-4 border-b-2 border-transparent data-[state=active]:border-blue-800 data-[state=active]:text-blue-800 data-[state=active]:bg-white/20 bg-transparent hover:bg-white/10 rounded-none text-blue-700"
                        >
                    <Users className="h-4 w-4" /> Attendance
                </TabsTrigger>
                        <TabsTrigger 
                            value="events" 
                            className="flex items-center gap-2 px-6 py-4 border-b-2 border-transparent data-[state=active]:border-blue-800 data-[state=active]:text-blue-800 data-[state=active]:bg-white/20 bg-transparent hover:bg-white/10 rounded-none text-blue-700"
                        >
                    <CalendarIcon className="h-4 w-4" /> Events
                </TabsTrigger>
                        <TabsTrigger 
                            value="members" 
                            className="flex items-center gap-2 px-6 py-4 border-b-2 border-transparent data-[state=active]:border-blue-800 data-[state=active]:text-blue-800 data-[state=active]:bg-white/20 bg-transparent hover:bg-white/10 rounded-none text-blue-700"
                        >
                    <Layers className="h-4 w-4" /> Members
                </TabsTrigger>
            </TabsList>
                </div>

                <TabsContent value="attendance" className="p-6">
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-blue-800">Recent Attendance</h3>
                        {attendance.length > 0 ? (
                            <div className="overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Group</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leader</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {attendance.map((record, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(record.date)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.group?.name || "N/A"}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.leader?.name || "N/A"}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{record.count}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Users className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No attendance records</h3>
                                <p className="mt-1 text-sm text-gray-500">Get started by having leaders mark attendance for events.</p>
                            </div>
                        )}
                    </div>
            </TabsContent>

                <TabsContent value="events" className="p-6">
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900">Upcoming Events</h3>
                        {events.length > 0 ? (
                            <div className="overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Group</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {events.map((event, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{event.title}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(event.date)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{event.group?.name || "N/A"}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{event.createdBy?.name || "N/A"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No events scheduled</h3>
                                <p className="mt-1 text-sm text-gray-500">Leaders can create events for their groups.</p>
                            </div>
                        )}
                    </div>
            </TabsContent>

                <TabsContent value="members" className="p-6">
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900">All Members</h3>
                        {members.length > 0 ? (
                            <div className="overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Group</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {members.map((member, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{member.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.phone || "-"}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.email || "-"}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.group?.name || "N/A"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Layers className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No members yet</h3>
                                <p className="mt-1 text-sm text-gray-500">Members will appear here once leaders add them to groups.</p>
                            </div>
                        )}
                    </div>
            </TabsContent>
        </Tabs>
        </div>
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
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [error, setError] = useState("")
    const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null)

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

            const [statsRes, eventsRes] = await Promise.all([
                fetch("/api/bishop"),
                fetch("/api/events"),
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

            // For now, set empty arrays for attendance and members
            // These will be populated when those API endpoints are fixed
            setAttendance([])
            setMembers([])

            setLastRefreshed(new Date())
        } catch (err) {
            console.error("Error fetching dashboard data:", err)
            setError("Failed to load dashboard data. Please try refreshing the page.")
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    useEffect(() => {
        fetchDashboardData()

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
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-2xl font-bold text-blue-800">Bishop Dashboard</h1>
                            <p className="text-sm text-blue-700 mt-1">Manage your church community</p>
                        </div>
                        <div className="flex space-x-3">
                            <Link 
                                href="/bishop/leaders" 
                                className="inline-flex items-center px-4 py-2 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-800 bg-white/80 backdrop-blur-sm hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                            Manage Leaders
                        </Link>
                            <Link 
                                href="/bishop/groups" 
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-800"
                            >
                            Manage Groups
                        </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

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
                    <div className="space-y-6">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard
                            title="Leaders"
                            value={stats.leaders}
                                borderColor=""
                                textColor=""
                            delay={0.2}
                        />
                        <StatCard
                            title="Groups"
                            value={stats.groups}
                                borderColor=""
                                textColor=""
                            delay={0.3}
                        />
                        <StatCard
                            title="Members"
                            value={stats.members}
                                borderColor=""
                                textColor=""
                            delay={0.4}
                        />
                        <StatCard
                            title="Total Attendance"
                            value={stats.totalAttendance}
                                borderColor=""
                                textColor=""
                            delay={0.5}
                        />
                        </div>

                        {/* Dashboard Content */}
                        <DashboardTabs
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