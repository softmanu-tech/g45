"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loading } from "@/components/ui/loading"
import { useAlerts } from "@/components/ui/alert-system"
import Link from "next/link"
import { motion } from "framer-motion"
import { format } from "date-fns"
import {
  TrendingUp,
  TrendingDown,
  Users,
  Award,
  Target,
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  Crown,
  AlertTriangle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Minus,
  Settings,
  LogOut
} from "lucide-react"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ComposedChart
} from 'recharts'

interface TeamAnalytics {
  teamId: string
  teamName: string
  teamDescription: string
  leader: {
    name: string
    email: string
  }
  memberCount: number
  createdAt: string
  statistics: {
    totalVisitors: number
    joiningVisitors: number
    visitingOnly: number
    activeMonitoring: number
    completedMonitoring: number
    convertedMembers: number
    conversionRate: number
  }
  growth: {
    monthlyGrowth: Array<{
      month: string
      totalVisitors: number
      joining: number
      visiting: number
      conversions: number
      cumulativeTotal: number
    }>
    growthTrend: number
    trendDirection: 'growing' | 'declining' | 'stable'
    performanceScore: number
  }
  memberPerformance: Array<{
    memberId: string
    name: string
    email: string
    assignedVisitors: number
    conversions: number
    conversionRate: number
    isLeader: boolean
  }>
}

interface TeamRanking {
  rank: number
  teamId: string
  teamName: string
  performanceScore: number
  totalVisitors: number
  conversionRate: number
  growthTrend: number
  trendDirection: string
}

interface AnalyticsData {
  teamAnalytics: TeamAnalytics[]
  churchStats: {
    totalTeams: number
    totalVisitors: number
    totalJoining: number
    totalConversions: number
    averageConversionRate: number
    topPerformingTeam: TeamAnalytics | null
  }
  teamRankings: TeamRanking[]
  churchGrowth: Array<{
    month: string
    totalVisitors: number
    joining: number
    visiting: number
    conversions: number
  }>
  insights: {
    fastestGrowingTeam: TeamRanking | undefined
    highestConversionTeam: TeamRanking
    teamsNeedingAttention: number
    totalActiveVisitors: number
  }
}

export default function ProtocolAnalyticsPage() {
  const alerts = useAlerts()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/bishop/protocol-teams/analytics/simple', {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch analytics data")
      }

      const result = await response.json()
      if (result.success) {
        setData(result.data)
        if (result.data.teamAnalytics.length > 0) {
          setSelectedTeam(result.data.teamAnalytics[0].teamId)
        }
      } else {
        throw new Error(result.error || "Failed to fetch analytics data")
      }
    } catch (err) {
      console.error("Error fetching analytics data:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch analytics data")
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
    fetchAnalytics()
  }, [])

  if (loading) {
    return <Loading message="Loading protocol team analytics..." size="lg" />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-blue-300 flex items-center justify-center px-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg max-w-md text-center">
          <strong>Error:</strong> {error}
          <button 
            onClick={fetchAnalytics}
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
          <p className="text-blue-800">No analytics data available.</p>
        </div>
      </div>
    )
  }

  const selectedTeamData = selectedTeam ? data.teamAnalytics.find(t => t.teamId === selectedTeam) : data.teamAnalytics[0]
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316']

  const getTrendIcon = (direction: string, trend: number) => {
    if (direction === 'growing') return <ArrowUp className="h-4 w-4 text-green-500" />
    if (direction === 'declining') return <ArrowDown className="h-4 w-4 text-red-500" />
    return <Minus className="h-4 w-4 text-gray-500" />
  }

  const getTrendColor = (direction: string) => {
    if (direction === 'growing') return 'text-green-600 bg-green-50 border-green-200'
    if (direction === 'declining') return 'text-red-600 bg-red-50 border-red-200'
    return 'text-gray-600 bg-gray-50 border-gray-200'
  }

  return (
    <div className="min-h-screen bg-blue-300">
      {/* Header */}
      <div className="bg-blue-200/90 backdrop-blur-md border-b border-blue-300">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 sm:py-6 gap-3 sm:gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-blue-800 truncate">
                Protocol Teams Performance Analytics
              </h1>
              <p className="text-xs sm:text-sm text-blue-700 mt-1">
                Comprehensive analysis of {data.churchStats.totalTeams} protocol teams managing {data.churchStats.totalVisitors} visitors
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/bishop">
                <Button 
                  variant="outline"
                  size="sm"
                  className="border-blue-300 text-blue-800 bg-white/80 hover:bg-white/90"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Dashboard
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

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 space-y-6">
        
        {/* Church-wide Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <Card className="bg-blue-200/90 backdrop-blur-md border border-blue-300">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-lg sm:text-xl font-bold text-blue-800">{data.churchStats.totalTeams}</div>
              <div className="text-xs sm:text-sm text-blue-600">Protocol Teams</div>
            </CardContent>
          </Card>
          
          <Card className="bg-green-100 border border-green-300">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-lg sm:text-xl font-bold text-green-800">{data.churchStats.totalVisitors}</div>
              <div className="text-xs sm:text-sm text-green-600">Total Visitors</div>
            </CardContent>
          </Card>
          
          <Card className="bg-purple-100 border border-purple-300">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-lg sm:text-xl font-bold text-purple-800">{data.churchStats.totalConversions}</div>
              <div className="text-xs sm:text-sm text-purple-600">Conversions</div>
            </CardContent>
          </Card>
          
          <Card className="bg-orange-100 border border-orange-300">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-lg sm:text-xl font-bold text-orange-800">{data.churchStats.averageConversionRate}%</div>
              <div className="text-xs sm:text-sm text-orange-600">Avg Conversion</div>
            </CardContent>
          </Card>
          
          <Card className="bg-red-100 border border-red-300">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-lg sm:text-xl font-bold text-red-800">{data.insights.teamsNeedingAttention}</div>
              <div className="text-xs sm:text-sm text-red-600">Need Attention</div>
            </CardContent>
          </Card>
          
          <Card className="bg-teal-100 border border-teal-300">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-lg sm:text-xl font-bold text-teal-800">{data.insights.totalActiveVisitors}</div>
              <div className="text-xs sm:text-sm text-teal-600">Active Visitors</div>
            </CardContent>
          </Card>
        </div>

        {/* Church-wide Growth Chart */}
        <Card className="bg-blue-200/90 backdrop-blur-md border border-blue-300">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Church-wide Visitor Growth Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={data.churchGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="totalVisitors" fill="#3B82F6" fillOpacity={0.3} stroke="#3B82F6" strokeWidth={2} name="Total Visitors" />
                <Bar dataKey="joining" fill="#10B981" name="Joining Visitors" />
                <Bar dataKey="visiting" fill="#F59E0B" name="Visiting Only" />
                <Line type="monotone" dataKey="conversions" stroke="#8B5CF6" strokeWidth={3} name="Conversions" />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Team Rankings */}
        <Card className="bg-blue-200/90 backdrop-blur-md border border-blue-300">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center gap-2">
              <Award className="h-5 w-5" />
              Protocol Team Performance Rankings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.teamRankings.map((team, index) => (
                <motion.div
                  key={team.teamId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                    selectedTeam === team.teamId 
                      ? 'bg-blue-100 border-blue-400 shadow-md' 
                      : 'bg-white/80 border-blue-200 hover:bg-blue-50'
                  }`}
                  onClick={() => setSelectedTeam(team.teamId)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                        team.rank === 1 ? 'bg-yellow-100 text-yellow-800' :
                        team.rank === 2 ? 'bg-gray-100 text-gray-800' :
                        team.rank === 3 ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {team.rank === 1 && <Crown className="h-4 w-4" />}
                        {team.rank !== 1 && team.rank}
                      </div>
                      <div>
                        <h4 className="font-medium text-blue-800">{team.teamName}</h4>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-blue-600">{team.totalVisitors} visitors</span>
                          <span className="text-green-600">{team.conversionRate}% conversion</span>
                          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${getTrendColor(team.trendDirection)}`}>
                            {getTrendIcon(team.trendDirection, team.growthTrend)}
                            {team.growthTrend.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-800">{team.performanceScore}</div>
                      <div className="text-xs text-blue-600">Performance Score</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Selected Team Detailed Analysis */}
        {selectedTeamData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Team Growth Chart */}
            <Card className="bg-blue-200/90 backdrop-blur-md border border-blue-300">
              <CardHeader>
                <CardTitle className="text-blue-800 flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  {selectedTeamData.teamName} - Growth Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={selectedTeamData.growth.monthlyGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="cumulativeTotal" fill="#3B82F6" fillOpacity={0.3} stroke="#3B82F6" strokeWidth={2} name="Cumulative Visitors" />
                    <Area type="monotone" dataKey="totalVisitors" fill="#10B981" fillOpacity={0.5} stroke="#10B981" strokeWidth={2} name="Monthly New Visitors" />
                    <Area type="monotone" dataKey="conversions" fill="#8B5CF6" fillOpacity={0.7} stroke="#8B5CF6" strokeWidth={2} name="Monthly Conversions" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Team Member Performance */}
            <Card className="bg-blue-200/90 backdrop-blur-md border border-blue-300">
              <CardHeader>
                <CardTitle className="text-blue-800 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team Member Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={selectedTeamData.memberPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="assignedVisitors" fill="#3B82F6" name="Assigned Visitors" />
                    <Bar dataKey="conversions" fill="#10B981" name="Conversions" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Performance Insights */}
        <Card className="bg-blue-200/90 backdrop-blur-md border border-blue-300">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center gap-2">
              <Target className="h-5 w-5" />
              Performance Insights & Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.insights.fastestGrowingTeam && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <h4 className="font-medium text-green-800">Fastest Growing Team</h4>
                  </div>
                  <p className="text-green-700 font-medium">{data.insights.fastestGrowingTeam.teamName}</p>
                  <p className="text-sm text-green-600">Growth: +{data.insights.fastestGrowingTeam.growthTrend.toFixed(1)}%</p>
                </div>
              )}
              
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="h-5 w-5 text-purple-600" />
                  <h4 className="font-medium text-purple-800">Highest Conversion Rate</h4>
                </div>
                <p className="text-purple-700 font-medium">{data.insights.highestConversionTeam.teamName}</p>
                <p className="text-sm text-purple-600">Conversion: {data.insights.highestConversionTeam.conversionRate}%</p>
              </div>
              
              {data.insights.teamsNeedingAttention > 0 && (
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <h4 className="font-medium text-red-800">Teams Needing Attention</h4>
                  </div>
                  <p className="text-red-700 font-medium">{data.insights.teamsNeedingAttention} teams</p>
                  <p className="text-sm text-red-600">Require support or intervention</p>
                </div>
              )}
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2">Key Recommendations:</h4>
              <ul className="space-y-1 text-sm text-blue-700">
                <li>• Focus on teams with declining growth trends for additional support</li>
                <li>• Share best practices from high-performing teams across all protocol teams</li>
                <li>• Consider additional training for teams with low conversion rates</li>
                <li>• Monitor active visitors regularly to prevent drop-offs</li>
                <li>• Celebrate and recognize top-performing teams to maintain motivation</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
