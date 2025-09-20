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
  Shield,
  ArrowLeft,
  Phone,
  Mail,
  Award,
  TrendingUp,
  Target,
  CheckCircle,
  AlertTriangle,
  Plus
} from "lucide-react"

interface ProtocolTeam {
  _id: string
  name: string
  description?: string
  leader: {
    _id: string
    name: string
    email: string
    phone?: string
  }
  members: {
    _id: string
    name: string
    email: string
    phone?: string
  }[]
  responsibilities: string[]
  stats: {
    totalVisitors: number
    joiningVisitors: number
    activeMonitoring: number
    convertedMembers: number
    conversionRate: number
  }
  createdAt: string
}

export default function ProtocolTeamsPage() {
  const alerts = useAlerts()
  
  const [teams, setTeams] = useState<ProtocolTeam[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateTeam, setShowCreateTeam] = useState(false)
  const [showCredentials, setShowCredentials] = useState(false)
  const [newLeaderCredentials, setNewLeaderCredentials] = useState<{email: string, password: string} | null>(null)
  const [selectedTeam, setSelectedTeam] = useState<ProtocolTeam | null>(null)
  const [showTeamDetails, setShowTeamDetails] = useState(false)
  const [newTeam, setNewTeam] = useState({
    name: '',
    description: '',
    leaderName: '',
    leaderEmail: '',
    responsibilities: [
      'Welcome and register visitors',
      'Monitor joining visitors progress',
      'Collect visitor feedback and experiences',
      'Report to bishop on visitor engagement',
      'Assist visitors with church integration'
    ]
  })

  const fetchTeams = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/bishop/protocol-teams', {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch protocol teams")
      }

      const result = await response.json()
      if (result.success) {
        setTeams(result.data)
      } else {
        throw new Error(result.error || "Failed to fetch protocol teams")
      }
    } catch (err) {
      console.error("Error fetching protocol teams:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch protocol teams")
    } finally {
      setLoading(false)
    }
  }

  const createTeam = async () => {
    try {
      const response = await fetch('/api/bishop/protocol-teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newTeam)
      })

      if (response.ok) {
        const result = await response.json()
        
        // Store credentials for display
        setNewLeaderCredentials({
          email: result.data.leader.email,
          password: result.data.leader.temporaryPassword
        })
        
        setShowCreateTeam(false)
        setShowCredentials(true)
        
        // Reset form
        setNewTeam({
          name: '',
          description: '',
          leaderName: '',
          leaderEmail: '',
          responsibilities: [
            'Welcome and register visitors',
            'Monitor joining visitors progress',
            'Collect visitor feedback and experiences',
            'Report to bishop on visitor engagement',
            'Assist visitors with church integration'
          ]
        })
        
        fetchTeams()
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create team')
      }
    } catch (error) {
      alerts.error("Failed to Create Team", error instanceof Error ? error.message : "Please try again.")
    }
  }

  useEffect(() => {
    fetchTeams()
  }, [])

  if (loading) {
    return <Loading message="Loading protocol teams..." size="lg" />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-blue-300 flex items-center justify-center px-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg max-w-md text-center">
          <strong>Error:</strong> {error}
          <button 
            onClick={fetchTeams}
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
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4 sm:py-6">
            <div className="flex items-center gap-4">
              <Link href="/bishop">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-800 hover:bg-blue-100 p-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 hover:from-blue-100 hover:to-blue-200"
                  style={{
                    boxShadow: '0 8px 16px rgba(59, 130, 246, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.6)'
                  }}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-blue-800">
                  Protocol Teams Management
                </h1>
                <p className="text-xs sm:text-sm text-blue-700 mt-1">
                  Manage visitor protocol teams and their performance
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowCreateTeam(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Team
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 space-y-6">
        
        {/* Teams Overview */}
        {teams.length === 0 ? (
          <div className="text-center py-12">
            <Shield className="mx-auto h-16 w-16 text-blue-400 mb-4" />
            <h3 className="text-xl font-medium text-blue-800 mb-2">No Protocol Teams Yet</h3>
            <p className="text-blue-600 mb-6">Create your first protocol team to manage visitors</p>
            <Button
              onClick={() => setShowCreateTeam(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Team
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {teams.map((team) => (
              <motion.div
                key={team._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="bg-blue-200/90 backdrop-blur-md border border-blue-300 h-full">
                  <CardHeader>
                    <CardTitle className="text-blue-800 flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      {team.name}
                    </CardTitle>
                    {team.description && (
                      <p className="text-sm text-blue-600">{team.description}</p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    
                    {/* Team Leader */}
                    <div className="bg-white/80 p-3 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-800 mb-2">Team Leader</h4>
                      <div className="space-y-1">
                        <div className="font-medium text-blue-700">{team.leader.name}</div>
                        <div className="text-sm text-blue-600 flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {team.leader.email}
                        </div>
                        {team.leader.phone && (
                          <div className="text-sm text-blue-600 flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {team.leader.phone}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Performance Stats */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-green-50 p-3 rounded border border-green-200 text-center">
                        <div className="text-lg font-bold text-green-800">{team.stats.totalVisitors}</div>
                        <div className="text-xs text-green-600">Total Visitors</div>
                      </div>
                      <div className="bg-blue-50 p-3 rounded border border-blue-200 text-center">
                        <div className="text-lg font-bold text-blue-800">{team.stats.joiningVisitors}</div>
                        <div className="text-xs text-blue-600">Joining</div>
                      </div>
                      <div className="bg-purple-50 p-3 rounded border border-purple-200 text-center">
                        <div className="text-lg font-bold text-purple-800">{team.stats.activeMonitoring}</div>
                        <div className="text-xs text-purple-600">Monitoring</div>
                      </div>
                      <div className="bg-emerald-50 p-3 rounded border border-emerald-200 text-center">
                        <div className="text-lg font-bold text-emerald-800">{team.stats.conversionRate}%</div>
                        <div className="text-xs text-emerald-600">Conversion</div>
                      </div>
                    </div>

                    {/* Team Members */}
                    <div className="bg-white/80 p-3 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-800 mb-2">
                        Team Members ({team.members.length})
                      </h4>
                      <div className="space-y-1 max-h-24 overflow-y-auto">
                        {team.members.map((member) => (
                          <div key={member._id} className="text-sm text-blue-600">
                            {member.name}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-blue-300 text-blue-800 hover:bg-blue-50"
                        onClick={() => {
                          setSelectedTeam(team)
                          setShowTeamDetails(true)
                        }}
                      >
                        View Details
                      </Button>
                      <Link href={`/bishop/protocol-teams/${team._id}/manage`}>
                        <Button
                          size="sm"
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Manage
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create Team Modal */}
      {showCreateTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">
                Create New Protocol Team
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-blue-800 mb-2">Team Name</label>
                    <input
                      type="text"
                      value={newTeam.name}
                      onChange={(e) => setNewTeam({...newTeam, name: e.target.value})}
                      placeholder="e.g., Main Protocol Team"
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-800 mb-2">Leader Name</label>
                    <input
                      type="text"
                      value={newTeam.leaderName}
                      onChange={(e) => setNewTeam({...newTeam, leaderName: e.target.value})}
                      placeholder="Protocol team leader name"
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-blue-800 mb-2">Leader Email</label>
                  <input
                    type="email"
                    value={newTeam.leaderEmail}
                    onChange={(e) => setNewTeam({...newTeam, leaderEmail: e.target.value})}
                    placeholder="leader@church.com"
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-blue-800 mb-2">Description</label>
                  <textarea
                    value={newTeam.description}
                    onChange={(e) => setNewTeam({...newTeam, description: e.target.value})}
                    placeholder="Brief description of the team's focus..."
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-800 mb-2">Responsibilities</label>
                  <div className="space-y-2">
                    {newTeam.responsibilities.map((responsibility, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-blue-700">{responsibility}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => setShowCreateTeam(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={createTeam}
                  disabled={!newTeam.name.trim() || !newTeam.leaderName.trim() || !newTeam.leaderEmail.trim()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Create Team
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Credentials Modal */}
      {showCredentials && newLeaderCredentials && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-4 text-center">
                🎉 Protocol Team Created Successfully!
              </h3>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-green-800 mb-3">Protocol Leader Login Credentials:</h4>
                
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded border">
                    <div className="text-xs text-blue-800 font-medium mb-1">Email:</div>
                    <div className="flex items-center justify-between">
                      <code className="text-sm font-mono text-green-800">{newLeaderCredentials.email}</code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(newLeaderCredentials.email)
                          alerts.success("Copied!", "Email copied to clipboard")
                        }}
                        className="text-xs px-2 py-1"
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded border">
                    <div className="text-xs text-blue-800 font-medium mb-1">Password:</div>
                    <div className="flex items-center justify-between">
                      <code className="text-sm font-mono text-green-800">{newLeaderCredentials.password}</code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(newLeaderCredentials.password)
                          alerts.success("Copied!", "Password copied to clipboard")
                        }}
                        className="text-xs px-2 py-1"
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-3 rounded border border-blue-200">
                    <div className="text-xs text-blue-800 font-medium mb-1">Complete Login Details:</div>
                    <div className="text-sm text-blue-800 space-y-1">
                      <div>📧 Email: {newLeaderCredentials.email}</div>
                      <div>🔐 Password: {newLeaderCredentials.password}</div>
                      <div>🌐 Login URL: http://localhost:3000</div>
                      <div>🛡️ Role: Protocol Team Leader</div>
                    </div>
                    <Button
                      size="sm"
                      className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => {
                        const loginDetails = `Protocol Leader Login Credentials:\n\nEmail: ${newLeaderCredentials.email}\nPassword: ${newLeaderCredentials.password}\nLogin URL: http://localhost:3000\nRole: Protocol Team Leader\n\nPlease save these credentials securely and share them with the protocol leader.`
                        navigator.clipboard.writeText(loginDetails)
                        alerts.success("Copied!", "Complete login details copied to clipboard")
                      }}
                    >
                      Copy All Details
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <Button
                  onClick={() => {
                    setShowCredentials(false)
                    setNewLeaderCredentials(null)
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Team Details Modal */}
      {showTeamDetails && selectedTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-blue-800 flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  {selectedTeam.name} - Details
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowTeamDetails(false)
                    setSelectedTeam(null)
                  }}
                >
                  ✕
                </Button>
              </div>
              
              <div className="space-y-6">
                {/* Team Information */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-800 mb-3">Team Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-blue-800 font-medium">Team Name:</div>
                      <div className="font-medium text-blue-700">{selectedTeam.name}</div>
                    </div>
                    <div>
                      <div className="text-blue-800 font-medium">Created:</div>
                      <div className="font-medium text-blue-700">{format(new Date(selectedTeam.createdAt), "MMM dd, yyyy")}</div>
                    </div>
                    {selectedTeam.description && (
                      <div className="md:col-span-2">
                        <div className="text-blue-800 font-medium">Description:</div>
                        <div className="font-medium text-blue-700">{selectedTeam.description}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Leader Details */}
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-800 mb-3">Team Leader</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-green-800">{selectedTeam.leader.name}</div>
                        <div className="text-sm text-green-600 flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {selectedTeam.leader.email}
                        </div>
                        {selectedTeam.leader.phone && (
                          <div className="text-sm text-green-600 flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {selectedTeam.leader.phone}
                          </div>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(selectedTeam.leader.email)
                          alerts.success("Copied!", "Leader email copied to clipboard")
                        }}
                      >
                        Copy Email
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Performance Stats */}
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h4 className="font-medium text-purple-800 mb-3">Team Performance</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-purple-800">{selectedTeam.stats.totalVisitors}</div>
                      <div className="text-xs text-purple-600">Total Visitors</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-800">{selectedTeam.stats.joiningVisitors}</div>
                      <div className="text-xs text-blue-600">Joining</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-800">{selectedTeam.stats.convertedMembers}</div>
                      <div className="text-xs text-green-600">Converted</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-indigo-800">{selectedTeam.stats.conversionRate}%</div>
                      <div className="text-xs text-indigo-600">Success Rate</div>
                    </div>
                  </div>
                </div>

                {/* Responsibilities */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-800 mb-3">Team Responsibilities</h4>
                  <div className="space-y-2">
                    {selectedTeam.responsibilities.map((responsibility, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-blue-700">{responsibility}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Team Members */}
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                  <h4 className="font-medium text-indigo-800 mb-3">Team Members ({selectedTeam.members.length})</h4>
                  <div className="space-y-2">
                    {selectedTeam.members.map((member) => (
                      <div key={member._id} className="flex items-center justify-between bg-white p-2 rounded border">
                        <div>
                          <div className="font-medium text-indigo-700">{member.name}</div>
                          <div className="text-sm text-indigo-600">{member.email}</div>
                        </div>
                        {member.phone && (
                          <div className="text-sm text-indigo-500">{member.phone}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => {
                    setShowTeamDetails(false)
                    setSelectedTeam(null)
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Close
                </Button>
                <Link href={`/bishop/protocol-teams/${selectedTeam._id}/manage`}>
                  <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                    Manage Team
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
