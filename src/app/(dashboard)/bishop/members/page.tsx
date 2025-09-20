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
  Search,
  Filter,
  ArrowLeft,
  Phone,
  MapPin,
  Building,
  Mail,
  TrendingUp,
  Award,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  BarChart3
} from "lucide-react"

interface Member {
  _id: string
  name: string
  email: string
  phone?: string
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
  type?: string
}

interface MembersData {
  members: Member[]
  summary: {
    totalMembers: number
    overallAttendanceRate: number
    excellentMembers: number
    goodMembers: number
    averageMembers: number
    poorMembers: number
    activeMembers: number
    inactiveMembers: number
  }
}

export default function BishopMembersPage() {
  const alerts = useAlerts()
  
  const [data, setData] = useState<MembersData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [ratingFilter, setRatingFilter] = useState<string>('all')
  const [groupFilter, setGroupFilter] = useState<string>('all')

  const fetchMembers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/bishop/members', {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch members data")
      }

      const result = await response.json()
      if (result.success) {
        setData(result.data)
      } else {
        throw new Error(result.error || "Failed to fetch members data")
      }
    } catch (err) {
      console.error("Error fetching members:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch members")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMembers()
  }, [])

  // Filter members based on search and filters
  const filteredMembers = data?.members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (member.phone && member.phone.includes(searchTerm))
    
    const matchesRating = ratingFilter === 'all' || member.rating === ratingFilter
    
    const matchesGroup = groupFilter === 'all' || 
                        (member.group && member.group.name === groupFilter)
    
    return matchesSearch && matchesRating && matchesGroup
  }) || []

  // Get unique groups for filter
  const uniqueGroups = [...new Set(data?.members.map(m => m.group?.name).filter(Boolean))]

  if (loading) {
    return <Loading message="Loading all members..." size="lg" />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-blue-300 flex items-center justify-center px-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg max-w-md text-center">
          <strong>Error:</strong> {error}
          <button 
            onClick={fetchMembers}
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
          <p className="text-blue-800">No members data available.</p>
          <Link href="/bishop">
            <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">
              Back to Dashboard
            </Button>
          </Link>
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
                  All Members Management
                </h1>
                <p className="text-xs sm:text-sm text-blue-700 mt-1">
                  {data.summary.totalMembers} members across all groups
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 space-y-6">
        
        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <Card className="bg-blue-200/90 backdrop-blur-md border border-blue-300">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-lg sm:text-xl font-bold text-blue-800">{data.summary.totalMembers}</div>
              <div className="text-xs sm:text-sm text-blue-600">Total Members</div>
            </CardContent>
          </Card>
          
          <Card className="bg-green-100 border border-green-300">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-lg sm:text-xl font-bold text-green-800">{data.summary.excellentMembers}</div>
              <div className="text-xs sm:text-sm text-green-600">Excellent</div>
            </CardContent>
          </Card>
          
          <Card className="bg-blue-100 border border-blue-300">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-lg sm:text-xl font-bold text-blue-800">{data.summary.goodMembers}</div>
              <div className="text-xs sm:text-sm text-blue-600">Good</div>
            </CardContent>
          </Card>
          
          <Card className="bg-yellow-100 border border-yellow-300">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-lg sm:text-xl font-bold text-yellow-800">{data.summary.averageMembers}</div>
              <div className="text-xs sm:text-sm text-yellow-600">Average</div>
            </CardContent>
          </Card>
          
          <Card className="bg-red-100 border border-red-300">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-lg sm:text-xl font-bold text-red-800">{data.summary.poorMembers}</div>
              <div className="text-xs sm:text-sm text-red-600">Poor</div>
            </CardContent>
          </Card>
          
          <Card className="bg-purple-100 border border-purple-300">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-lg sm:text-xl font-bold text-purple-800">{data.summary.overallAttendanceRate}%</div>
              <div className="text-xs sm:text-sm text-purple-600">Church Avg</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="bg-blue-200/90 backdrop-blur-md border border-blue-300">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/90"
                  />
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={ratingFilter}
                  onChange={(e) => setRatingFilter(e.target.value)}
                  className="px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/90 text-sm"
                >
                  <option value="all">All Ratings</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Average">Average</option>
                  <option value="Poor">Poor</option>
                </select>
                
                <select
                  value={groupFilter}
                  onChange={(e) => setGroupFilter(e.target.value)}
                  className="px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/90 text-sm"
                >
                  <option value="all">All Groups</option>
                  {uniqueGroups.map(group => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Members List */}
        <Card className="bg-blue-200/90 backdrop-blur-md border border-blue-300">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center gap-2">
              <Users className="h-5 w-5" />
              All Members ({filteredMembers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredMembers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-blue-400 mb-4" />
                <p className="text-blue-600">
                  {searchTerm || ratingFilter !== 'all' || groupFilter !== 'all' 
                    ? 'No members match your filters' 
                    : 'No members found'}
                </p>
              </div>
            ) : (
              <>
                {/* Mobile Card Layout */}
                <div className="block lg:hidden space-y-4">
                  {filteredMembers.map((member) => (
                    <motion.div
                      key={member._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white/80 rounded-lg border border-blue-200 p-4"
                    >
                      <div className="space-y-3">
                        {/* Header */}
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-blue-800">{member.name}</h3>
                            <p className="text-sm text-blue-600">{member.email}</p>
                            <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                              {member.group?.name || 'No Group'}
                            </span>
                          </div>
                          {member.attendanceRate !== undefined && (
                            <div className={`px-3 py-1 rounded-lg text-center ${ 
                              member.attendanceRate >= 80 ? 'bg-green-100 text-green-800' :
                              member.attendanceRate >= 60 ? 'bg-blue-100 text-blue-800' :
                              member.attendanceRate >= 40 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              <div className="text-lg font-bold">{member.attendanceRate}%</div>
                              <div className="text-xs">{member.rating}</div>
                            </div>
                          )}
                        </div>
                        
                        {/* Contact Information */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          {member.phone && (
                            <div className="flex items-center gap-2 text-blue-600">
                              <Phone className="h-4 w-4" />
                              <span>{member.phone}</span>
                            </div>
                          )}
                          {member.residence && (
                            <div className="flex items-center gap-2 text-blue-600">
                              <MapPin className="h-4 w-4" />
                              <span>{member.residence}</span>
                            </div>
                          )}
                          {member.department && (
                            <div className="flex items-center gap-2 text-blue-600">
                              <Building className="h-4 w-4" />
                              <span>{member.department}</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Performance Stats */}
                        {member.attendanceCount !== undefined && (
                          <div className="flex justify-between items-center pt-2 border-t border-blue-200 text-sm">
                            <span className="text-blue-600">
                              Present: {member.attendanceCount}/{member.totalEvents || 0} events
                            </span>
                            {member.lastAttendanceDate && (
                              <span className="text-blue-500">
                                Last: {format(new Date(member.lastAttendanceDate), "MMM dd, yyyy")}
                              </span>
                            )}
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
                        <th className="text-left p-3 text-sm font-medium text-blue-800">Member</th>
                        <th className="text-left p-3 text-sm font-medium text-blue-800">Contact Info</th>
                        <th className="text-left p-3 text-sm font-medium text-blue-800">Performance</th>
                        <th className="text-left p-3 text-sm font-medium text-blue-800">Group</th>
                        <th className="text-left p-3 text-sm font-medium text-blue-800">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMembers.map((member) => (
                        <motion.tr
                          key={member._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="border-b border-blue-200 hover:bg-white/50 transition-colors"
                        >
                          <td className="p-3">
                            <div>
                              <div className="font-medium text-blue-800">{member.name}</div>
                              <div className="text-sm text-blue-600">{member.email}</div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="space-y-1 text-sm">
                              {member.phone && (
                                <div className="flex items-center gap-1 text-blue-600">
                                  <Phone className="h-3 w-3" />
                                  <span>{member.phone}</span>
                                </div>
                              )}
                              {member.residence && (
                                <div className="flex items-center gap-1 text-blue-600">
                                  <MapPin className="h-3 w-3" />
                                  <span>{member.residence}</span>
                                </div>
                              )}
                              {member.department && (
                                <div className="flex items-center gap-1 text-blue-600">
                                  <Building className="h-3 w-3" />
                                  <span>{member.department}</span>
                                </div>
                              )}
                              {!member.phone && !member.residence && !member.department && (
                                <span className="text-blue-500 text-sm">No contact info</span>
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            {member.attendanceRate !== undefined ? (
                              <div className="space-y-1">
                                <div className={`inline-block px-2 py-1 rounded text-sm font-medium ${ 
                                  member.attendanceRate >= 80 ? 'bg-green-100 text-green-800' :
                                  member.attendanceRate >= 60 ? 'bg-blue-100 text-blue-800' :
                                  member.attendanceRate >= 40 ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {member.attendanceRate}%
                                </div>
                                <div className="text-xs text-blue-600">
                                  {member.attendanceCount}/{member.totalEvents || 0} events
                                </div>
                              </div>
                            ) : (
                              <span className="text-blue-500 text-sm">No data</span>
                            )}
                          </td>
                          <td className="p-3">
                            <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {member.group?.name || 'No Group'}
                            </span>
                          </td>
                          <td className="p-3">
                            {member.rating && (
                              <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${ 
                                member.rating === 'Excellent' ? 'bg-green-100 text-green-800' :
                                member.rating === 'Good' ? 'bg-blue-100 text-blue-800' :
                                member.rating === 'Average' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {member.rating}
                              </span>
                            )}
                            {member.lastAttendanceDate && (
                              <div className="text-xs text-blue-500 mt-1">
                                Last: {format(new Date(member.lastAttendanceDate), "MMM dd")}
                              </div>
                            )}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/bishop">
            <Button variant="outline" className="border-blue-300 text-blue-800 hover:bg-blue-50">
              Back to Dashboard
            </Button>
          </Link>
          <Link href="/bishop/groups">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Manage Groups
            </Button>
          </Link>
          <Link href="/bishop/leaders">
            <Button variant="outline" className="border-blue-300 text-blue-800 hover:bg-blue-50">
              View Leaders
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
