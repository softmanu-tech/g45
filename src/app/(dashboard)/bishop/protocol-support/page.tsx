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
  TrendingDown,
  TrendingUp,
  Award,
  AlertTriangle,
  Users,
  BookOpen,
  Eye,
  Crown,
  Send,
  CheckCircle,
  Clock,
  Target,
  Star,
  MessageSquare,
  Mail,
  Phone,
  Calendar,
  ArrowLeft,
  Settings,
  LogOut
} from "lucide-react"

interface TeamMetrics {
  totalVisitors: number
  joiningVisitors: number
  convertedMembers: number
  activeVisitors: number
  conversionRate: number
  growthTrend: number
  trendDirection: string
  visitorsAtRisk: number
}

interface TeamAnalysis {
  teamId: string
  teamName: string
  leader: string
  metrics: TeamMetrics
}

interface SupportAction {
  teamId: string
  teamName: string
  leaderName: string
  leaderEmail: string
  issue?: string
  growthTrend?: number
  conversionRate?: number
  visitorsAtRisk?: number
  recommendedActions: string[]
  priority: string
}

interface BestPractice {
  teamId: string
  teamName: string
  leaderName: string
  conversionRate: number
  growthTrend: number
  successFactors: string[]
  shareableInsights: string[]
}

interface Recognition {
  rank: number
  teamId: string
  teamName: string
  leaderName: string
  achievements: {
    conversionRate: number
    growthTrend: number
    totalVisitors: number
    activeVisitors: number
  }
  recognitionType: string
  suggestedRewards: string[]
}

interface SupportData {
  summary: {
    totalTeams: number
    teamsNeedingSupport: number
    highPerformingTeams: number
    teamsNeedingTraining: number
    totalVisitorsAtRisk: number
    teamsWithRiskyVisitors: number
    averageConversionRate: number
    teamsGrowing: number
    teamsStable: number
    teamsdeclining: number
  }
  actionItems: {
    supportActions: SupportAction[]
    bestPractices: BestPractice[]
    trainingNeeds: SupportAction[]
    monitoringAlerts: SupportAction[]
    recognition: Recognition[]
  }
  teamAnalysis: TeamAnalysis[]
}

export default function ProtocolSupportPage() {
  const alerts = useAlerts()
  const [data, setData] = useState<SupportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'support' | 'practices' | 'training' | 'monitoring' | 'recognition'>('support')
  const [sendingAction, setSendingAction] = useState<string | null>(null)

  const fetchSupportData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/bishop/protocol-teams/support-system', {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch support data")
      }

      const result = await response.json()
      if (result.success) {
        setData(result.data)
      } else {
        throw new Error(result.error || "Failed to fetch support data")
      }
    } catch (err) {
      console.error("Error fetching support data:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch support data")
    } finally {
      setLoading(false)
    }
  }

  const sendSupportAction = async (actionType: string, teamId: string, message: string, priority: string = 'Medium') => {
    try {
      setSendingAction(teamId)
      const response = await fetch('/api/bishop/protocol-teams/support-system', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: "include",
        body: JSON.stringify({
          actionType,
          teamId,
          message,
          priority
        })
      })

      const result = await response.json()
      if (result.success) {
        alerts.success(`${actionType} sent to ${result.data.teamName} leader`)
      } else {
        alerts.error(result.error || "Failed to send support action")
      }
    } catch (err) {
      alerts.error("Failed to send support action")
    } finally {
      setSendingAction(null)
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
    fetchSupportData()
  }, [])

  if (loading) {
    return <Loading message="Loading protocol team support system..." size="lg" />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-blue-300 flex items-center justify-center px-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg max-w-md text-center">
          <strong>Error:</strong> {error}
          <button 
            onClick={fetchSupportData}
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
          <p className="text-blue-800">No support data available.</p>
        </div>
      </div>
    )
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-50 border-red-200'
      case 'Medium': return 'text-orange-600 bg-orange-50 border-orange-200'
      default: return 'text-blue-600 bg-blue-50 border-blue-200'
    }
  }

  return (
    <div className="min-h-screen bg-blue-300">
      {/* Header */}
      <div className="bg-blue-200/90 backdrop-blur-md border-b border-blue-300">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 sm:py-6 gap-3 sm:gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3">
                <Link href="/bishop">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-800 hover:bg-blue-100"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-blue-800 truncate">
                    Protocol Team Support System
                  </h1>
                  <p className="text-xs sm:text-sm text-blue-700 mt-1">
                    Comprehensive support and management for {data.summary.totalTeams} protocol teams
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/bishop/protocol-analytics">
                <Button 
                  variant="outline"
                  size="sm"
                  className="border-blue-300 text-blue-800 bg-white/80 hover:bg-white/90"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Analytics
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
        
        {/* Summary Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <Card className="bg-red-100 border border-red-300">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-lg sm:text-xl font-bold text-red-800">{data.summary.teamsNeedingSupport}</div>
              <div className="text-xs sm:text-sm text-red-600">Need Support</div>
            </CardContent>
          </Card>
          
          <Card className="bg-green-100 border border-green-300">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-lg sm:text-xl font-bold text-green-800">{data.summary.highPerformingTeams}</div>
              <div className="text-xs sm:text-sm text-green-600">High Performing</div>
            </CardContent>
          </Card>
          
          <Card className="bg-orange-100 border border-orange-300">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-lg sm:text-xl font-bold text-orange-800">{data.summary.teamsNeedingTraining}</div>
              <div className="text-xs sm:text-sm text-orange-600">Need Training</div>
            </CardContent>
          </Card>
          
          <Card className="bg-purple-100 border border-purple-300">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-lg sm:text-xl font-bold text-purple-800">{data.summary.totalVisitorsAtRisk}</div>
              <div className="text-xs sm:text-sm text-purple-600">Visitors At Risk</div>
            </CardContent>
          </Card>
          
          <Card className="bg-yellow-100 border border-yellow-300">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-lg sm:text-xl font-bold text-yellow-800">{data.summary.averageConversionRate}%</div>
              <div className="text-xs sm:text-sm text-yellow-600">Avg Conversion</div>
            </CardContent>
          </Card>
          
          <Card className="bg-teal-100 border border-teal-300">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-lg sm:text-xl font-bold text-teal-800">{data.summary.teamsGrowing}</div>
              <div className="text-xs sm:text-sm text-teal-600">Growing Teams</div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 bg-blue-200/90 backdrop-blur-md rounded-lg p-2 border border-blue-300 overflow-x-auto">
          <Button
            variant={activeTab === 'support' ? 'default' : 'ghost'}
            className={`flex-1 ${activeTab === 'support' ? 'bg-red-600 text-white' : 'text-blue-800 hover:bg-blue-100'}`}
            onClick={() => setActiveTab('support')}
          >
            <TrendingDown className="h-4 w-4 mr-2" />
            Declining Teams
          </Button>
          <Button
            variant={activeTab === 'practices' ? 'default' : 'ghost'}
            className={`flex-1 ${activeTab === 'practices' ? 'bg-green-600 text-white' : 'text-blue-800 hover:bg-blue-100'}`}
            onClick={() => setActiveTab('practices')}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Best Practices
          </Button>
          <Button
            variant={activeTab === 'training' ? 'default' : 'ghost'}
            className={`flex-1 ${activeTab === 'training' ? 'bg-orange-600 text-white' : 'text-blue-800 hover:bg-blue-100'}`}
            onClick={() => setActiveTab('training')}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Training Needs
          </Button>
          <Button
            variant={activeTab === 'monitoring' ? 'default' : 'ghost'}
            className={`flex-1 ${activeTab === 'monitoring' ? 'bg-purple-600 text-white' : 'text-blue-800 hover:bg-blue-100'}`}
            onClick={() => setActiveTab('monitoring')}
          >
            <Eye className="h-4 w-4 mr-2" />
            Visitor Monitoring
          </Button>
          <Button
            variant={activeTab === 'recognition' ? 'default' : 'ghost'}
            className={`flex-1 ${activeTab === 'recognition' ? 'bg-yellow-600 text-white' : 'text-blue-800 hover:bg-blue-100'}`}
            onClick={() => setActiveTab('recognition')}
          >
            <Crown className="h-4 w-4 mr-2" />
            Recognition
          </Button>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          
          {/* 1. TEAMS NEEDING SUPPORT (Declining Growth) */}
          {activeTab === 'support' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-red-50 border border-red-200">
                <CardHeader>
                  <CardTitle className="text-red-800 flex items-center gap-2">
                    <TrendingDown className="h-5 w-5" />
                    Teams with Declining Growth Trends ({data.actionItems.supportActions.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {data.actionItems.supportActions.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <p className="text-green-700 font-medium">Excellent! No teams currently have declining growth trends.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {data.actionItems.supportActions.map((action) => (
                        <div key={action.teamId} className="bg-white p-4 rounded-lg border border-red-200">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-medium text-red-800">{action.teamName}</h4>
                                <span className={`px-2 py-1 rounded-full text-xs border ${getPriorityColor(action.priority)}`}>
                                  {action.priority} Priority
                                </span>
                              </div>
                              <p className="text-sm text-red-600 mb-2">
                                Leader: {action.leaderName} ({action.leaderEmail})
                              </p>
                              <p className="text-sm text-red-700 mb-3">
                                Growth Trend: {action.growthTrend?.toFixed(1)}% decline
                              </p>
                              <div className="space-y-1">
                                <p className="text-sm font-medium text-red-800">Recommended Actions:</p>
                                {action.recommendedActions.map((actionItem, index) => (
                                  <p key={index} className="text-xs text-red-600">• {actionItem}</p>
                                ))}
                              </div>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Button
                                size="sm"
                                className="bg-red-600 hover:bg-red-700 text-white"
                                disabled={sendingAction === action.teamId}
                                onClick={() => sendSupportAction(
                                  'Support Request',
                                  action.teamId,
                                  `Your protocol team has shown a declining growth trend (${action.growthTrend?.toFixed(1)}% decline). I'd like to schedule a meeting to discuss strategies for improvement and provide additional support.`,
                                  action.priority
                                )}
                              >
                                {sendingAction === action.teamId ? (
                                  <Clock className="h-4 w-4" />
                                ) : (
                                  <Send className="h-4 w-4" />
                                )}
                                <span className="ml-1">Send Support</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* 2. BEST PRACTICES FROM HIGH-PERFORMING TEAMS */}
          {activeTab === 'practices' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-green-50 border border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-800 flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Best Practices from High-Performing Teams ({data.actionItems.bestPractices.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.actionItems.bestPractices.map((practice) => (
                      <div key={practice.teamId} className="bg-white p-4 rounded-lg border border-green-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-medium text-green-800">{practice.teamName}</h4>
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                {practice.conversionRate}% Conversion Rate
                              </span>
                            </div>
                            <p className="text-sm text-green-600 mb-3">
                              Leader: {practice.leaderName}
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-medium text-green-800 mb-1">Success Factors:</p>
                                {practice.successFactors.map((factor, index) => (
                                  <p key={index} className="text-xs text-green-600">• {factor}</p>
                                ))}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-green-800 mb-1">Key Insights:</p>
                                {practice.shareableInsights.map((insight, index) => (
                                  <p key={index} className="text-xs text-green-600">• {insight}</p>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                              disabled={sendingAction === practice.teamId}
                              onClick={() => sendSupportAction(
                                'Best Practice Share',
                                practice.teamId,
                                `Your protocol team has been identified as a high-performing team with excellent results. Would you be willing to share your successful strategies with other teams during our next protocol leaders meeting?`,
                                'Medium'
                              )}
                            >
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Request Share
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* 3. TRAINING NEEDS (Low Conversion Rates) */}
          {activeTab === 'training' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-orange-50 border border-orange-200">
                <CardHeader>
                  <CardTitle className="text-orange-800 flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Teams Needing Additional Training ({data.actionItems.trainingNeeds.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {data.actionItems.trainingNeeds.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <p className="text-green-700 font-medium">Great! All teams have adequate conversion rates.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {data.actionItems.trainingNeeds.map((training) => (
                        <div key={training.teamId} className="bg-white p-4 rounded-lg border border-orange-200">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-medium text-orange-800">{training.teamName}</h4>
                                <span className={`px-2 py-1 rounded-full text-xs border ${getPriorityColor(training.priority!)}`}>
                                  {training.priority} Priority
                                </span>
                              </div>
                              <p className="text-sm text-orange-600 mb-2">
                                Leader: {training.leaderName} ({training.leaderEmail})
                              </p>
                              <p className="text-sm text-orange-700 mb-3">
                                Conversion Rate: {training.conversionRate}% ({training.joiningVisitors} joining visitors)
                              </p>
                              <div className="space-y-1">
                                <p className="text-sm font-medium text-orange-800">Training Areas:</p>
                                {training.recommendedActions.map((area, index) => (
                                  <p key={index} className="text-xs text-orange-600">• {area}</p>
                                ))}
                              </div>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Button
                                size="sm"
                                className="bg-orange-600 hover:bg-orange-700 text-white"
                                disabled={sendingAction === training.teamId}
                                onClick={() => sendSupportAction(
                                  'Training Recommendation',
                                  training.teamId,
                                  `Based on your team's current conversion rate of ${training.conversionRate}%, I'd like to offer additional training in visitor conversion techniques and relationship building. Let's schedule a training session to help improve your team's effectiveness.`,
                                  training.priority!
                                )}
                              >
                                <BookOpen className="h-4 w-4 mr-1" />
                                Schedule Training
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* 4. VISITOR MONITORING ALERTS */}
          {activeTab === 'monitoring' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-purple-50 border border-purple-200">
                <CardHeader>
                  <CardTitle className="text-purple-800 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Active Visitor Monitoring Alerts ({data.actionItems.monitoringAlerts.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {data.actionItems.monitoringAlerts.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <p className="text-green-700 font-medium">Excellent! No visitors are currently at risk of dropping off.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {data.actionItems.monitoringAlerts.map((alert) => (
                        <div key={alert.teamId} className="bg-white p-4 rounded-lg border border-purple-200">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-medium text-purple-800">{alert.teamName}</h4>
                                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                                  {alert.visitorsAtRisk} Visitors At Risk
                                </span>
                              </div>
                              <p className="text-sm text-purple-600 mb-3">
                                Leader: {alert.leaderName} ({alert.leaderEmail})
                              </p>
                              <div className="space-y-1 mb-3">
                                <p className="text-sm font-medium text-purple-800">Recommended Actions:</p>
                                {alert.recommendedActions.map((action, index) => (
                                  <p key={index} className="text-xs text-purple-600">• {action}</p>
                                ))}
                              </div>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Button
                                size="sm"
                                className="bg-purple-600 hover:bg-purple-700 text-white"
                                disabled={sendingAction === alert.teamId}
                                onClick={() => sendSupportAction(
                                  'Visitor Monitoring Alert',
                                  alert.teamId,
                                  `Urgent: Your team has ${alert.visitorsAtRisk} visitors approaching their 3-month monitoring deadline. Please prioritize follow-up meetings and conversion discussions with these visitors to prevent drop-offs.`,
                                  'High'
                                )}
                              >
                                <AlertTriangle className="h-4 w-4 mr-1" />
                                Send Alert
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* 5. RECOGNITION FOR TOP PERFORMERS */}
          {activeTab === 'recognition' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-yellow-50 border border-yellow-200">
                <CardHeader>
                  <CardTitle className="text-yellow-800 flex items-center gap-2">
                    <Crown className="h-5 w-5" />
                    Top Performing Teams Recognition ({data.actionItems.recognition.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.actionItems.recognition.map((recognition) => (
                      <div key={recognition.teamId} className="bg-white p-4 rounded-lg border border-yellow-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                                recognition.rank === 1 ? 'bg-yellow-100 text-yellow-800' :
                                recognition.rank === 2 ? 'bg-gray-100 text-gray-800' :
                                'bg-orange-100 text-orange-800'
                              }`}>
                                {recognition.rank === 1 && <Crown className="h-4 w-4" />}
                                {recognition.rank !== 1 && recognition.rank}
                              </div>
                              <h4 className="font-medium text-yellow-800">{recognition.teamName}</h4>
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                                {recognition.recognitionType}
                              </span>
                            </div>
                            <p className="text-sm text-yellow-600 mb-3">
                              Leader: {recognition.leaderName}
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                              <div className="text-center">
                                <div className="text-lg font-bold text-yellow-800">{recognition.achievements.conversionRate}%</div>
                                <div className="text-xs text-yellow-600">Conversion Rate</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-bold text-yellow-800">{recognition.achievements.totalVisitors}</div>
                                <div className="text-xs text-yellow-600">Total Visitors</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-bold text-yellow-800">{recognition.achievements.activeVisitors}</div>
                                <div className="text-xs text-yellow-600">Active Visitors</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-bold text-yellow-800">{recognition.achievements.growthTrend.toFixed(1)}%</div>
                                <div className="text-xs text-yellow-600">Growth Trend</div>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-yellow-800">Suggested Rewards:</p>
                              {recognition.suggestedRewards.map((reward, index) => (
                                <p key={index} className="text-xs text-yellow-600">• {reward}</p>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button
                              size="sm"
                              className="bg-yellow-600 hover:bg-yellow-700 text-white"
                              disabled={sendingAction === recognition.teamId}
                              onClick={() => sendSupportAction(
                                'Recognition Award',
                                recognition.teamId,
                                `Congratulations! Your protocol team has been selected for the ${recognition.recognitionType} award based on your outstanding performance with ${recognition.achievements.conversionRate}% conversion rate and ${recognition.achievements.growthTrend.toFixed(1)}% growth. Your dedication and excellent work are truly appreciated!`,
                                'Medium'
                              )}
                            >
                              <Award className="h-4 w-4 mr-1" />
                              Send Recognition
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
