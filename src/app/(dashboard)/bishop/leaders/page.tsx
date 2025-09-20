"use client"
import { useState, useEffect } from "react"
import { Users, ArrowLeft, Edit } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { EditLeaderModal } from "@/components/EditLeaderModal"
import { useAlerts } from "@/components/ui/alert-system"

interface Group {
    _id: string
    name: string
}

interface Leader {
    _id: string
    name: string
    email: string
    password?: string
    group?: {
        _id: string
        name: string
    }
}

export default function LeaderManagement() {
    const alerts = useAlerts()
    const searchParams = useSearchParams()
    const targetGroupId = searchParams.get('groupId')
    
    const [leaders, setLeaders] = useState<Leader[]>([])
    const [groups, setGroups] = useState<Group[]>([])
    const [form, setForm] = useState({ name: "", email: "", password: "", groupId: targetGroupId || "" })
    const [isLoading, setIsLoading] = useState(false)
    const [editingLeader, setEditingLeader] = useState<Leader | null>(null)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)

    const fetchLeaders = async () => {
        const res = await fetch("/api/bishop/leaders")
        const data = await res.json()
        setLeaders(data.leaders)
    }

    const fetchGroups = async () => {
        try {
            const res = await fetch("/api/bishop/groups")
            const data = await res.json()
            setGroups(data.groups)
        } catch (err) {
            console.error("Error fetching groups:", err)
        }
    }

    const createLeader = async () => {
        if (!form.name || !form.email || !form.password || !form.groupId) {
            return alerts.warning(
                "Missing Information",
                "Please fill in all required fields before creating a leader.",
                [
                    {
                        label: "OK",
                        action: () => {},
                        variant: "primary"
                    }
                ]
            )
        }

        setIsLoading(true)
        try {
            const res = await fetch("/api/bishop/leaders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            })

            if (res.ok) {
                const leaderName = form.name;
                setForm({ name: "", email: "", password: "", groupId: targetGroupId || "" })
                await fetchLeaders()
                
                alerts.success(
                    "Leader Created Successfully!",
                    `${leaderName} has been added as a leader and assigned to the selected group.`,
                    [
                        {
                            label: "View Leaders",
                            action: () => window.location.reload(),
                            variant: "primary"
                        },
                        {
                            label: "Create Another",
                            action: () => {},
                            variant: "secondary"
                        }
                    ]
                )
            } else {
                const error = await res.json()
                alerts.error(
                    "Failed to Create Leader",
                    error.message || "An error occurred while creating the leader.",
                    [
                        {
                            label: "Try Again",
                            action: () => createLeader(),
                            variant: "primary"
                        }
                    ]
                )
            }
        } catch (err) {
            console.error("Error creating leader:", err)
            alerts.error(
                "Network Error",
                "Failed to create leader. Please check your connection and try again.",
                [
                    {
                        label: "Retry",
                        action: () => createLeader(),
                        variant: "primary"
                    }
                ]
            )
        } finally {
            setIsLoading(false)
        }
    }

    const handleEditLeader = (leader: Leader) => {
        setEditingLeader(leader)
        setIsEditModalOpen(true)
    }

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false)
        setEditingLeader(null)
    }

    const handleLeaderUpdated = async () => {
        await fetchLeaders()
    }

    useEffect(() => {
        Promise.all([fetchLeaders(), fetchGroups()]).catch((err) => console.error("Error initializing data:", err))
    }, [])

    return (
        <div className="min-h-screen bg-blue-300">
            {/* Header */}
            <div className="bg-blue-200/90 backdrop-blur-md border-b border-blue-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-2xl font-bold text-blue-800">Leader Management</h1>
                            <p className="text-sm text-blue-700 mt-1">
                                {targetGroupId ? "Assign or edit leaders for the selected group" : "Create and manage church leaders"}
                            </p>
                        </div>
                        <Link 
                            href="/bishop" 
                            className="inline-flex items-center px-4 py-2 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-800 bg-white/80 backdrop-blur-sm hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Dashboard
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Create Leader Form */}
                <div className="bg-blue-200/90 backdrop-blur-md rounded-lg shadow-sm border border-blue-300 p-6 mb-6">
                    <h2 className="text-lg font-medium text-blue-800 mb-4">Create New Leader</h2>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                placeholder="Leader Name"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="px-3 py-2 border border-blue-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-800 focus:border-blue-800 text-blue-800 placeholder-blue-600 bg-white/90"
                            />
                            <input
                                placeholder="Email (for login)"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                className="px-3 py-2 border border-blue-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-800 focus:border-blue-800 text-blue-800 placeholder-blue-600 bg-white/90"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                type="password"
                                placeholder="Password (for login)"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                className="px-3 py-2 border border-blue-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-800 focus:border-blue-800 text-blue-800 placeholder-blue-600 bg-white/90"
                            />
                            <select
                                value={form.groupId}
                                onChange={(e) => setForm({ ...form, groupId: e.target.value })}
                                className="px-3 py-2 border border-blue-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-800 focus:border-blue-800 text-blue-800 bg-white/90"
                            >
                                <option value="">Select a Group</option>
                                {groups.map((group) => (
                                    <option key={group._id} value={group._id}>
                                        {group.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button
                            onClick={createLeader}
                            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            disabled={isLoading}
                        >
                            {isLoading ? "Creating..." : "Create Leader & Assign Group"}
                        </button>
                    </div>
                </div>

                {/* Leaders List */}
                <div className="bg-blue-200/90 backdrop-blur-md rounded-lg shadow-sm border border-blue-300">
                    <div className="px-6 py-4 border-b border-blue-300">
                        <h2 className="text-lg font-medium text-blue-800">All Leaders</h2>
                    </div>
                    
                    {leaders.length > 0 ? (
                        <div className="divide-y divide-blue-300">
                            {leaders.map((leader: Leader) => (
                                <div key={leader._id} className="px-6 py-4 flex items-center justify-between hover:bg-white/10">
                                    <div>
                                        <h3 className="text-sm font-medium text-blue-800">{leader.name}</h3>
                                        <p className="text-sm text-blue-700">{leader.email}</p>
                                        <p className="text-xs text-blue-600">Group: {leader.group?.name || "Not assigned"}</p>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleEditLeader(leader)}
                                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            <Edit className="h-3 w-3 mr-1" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={async () => {
                                                if (confirm(`Are you sure you want to delete ${leader.name}?`)) {
                                                    await fetch(`/api/bishop/leaders/${leader._id}`, { method: "DELETE" })
                                                    await fetchLeaders()
                                                }
                                            }}
                                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Users className="mx-auto h-12 w-12 text-blue-500" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No leaders yet</h3>
                            <p className="mt-1 text-sm text-blue-600">Create your first leader to get started.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Leader Modal */}
            {editingLeader && (
                <EditLeaderModal
                    leader={editingLeader}
                    groups={groups}
                    isOpen={isEditModalOpen}
                    onClose={handleCloseEditModal}
                    onLeaderUpdated={handleLeaderUpdated}
                />
            )}
        </div>
    )
}
