'use client';
import { useEffect, useState } from 'react';
import { Users, ArrowLeft, UserCheck } from 'lucide-react';
import Link from 'next/link';

interface Group {
    _id: string;
    name: string;
    members: [];
    leader?: {
        _id: string;
        name: string;
        email: string;
    };
}

export default function GroupManagement() {
    const [groups, setGroups] = useState([]);
    const [groupName, setGroupName] = useState('');

    const fetchGroups = async () => {
        const res = await fetch('/api/bishop/groups');
        const data = await res.json();
        setGroups(data.groups);
    };

    const createGroup = async () => {
        try {
            const res = await fetch('/api/bishop/groups', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: groupName }),
            });
            
            if (res.ok) {
                setGroupName('');
                await fetchGroups();
                
                // Show success feedback  
                const groupNameToShow = groupName;
                
                // Trigger refresh on main dashboard (if it's open in another tab)
                if (window.opener) {
                    window.opener.postMessage('refresh-dashboard', '*');
                }
                
                // Show success message
                const successDiv = document.createElement('div');
                successDiv.className = 'fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50';
                successDiv.innerHTML = `✅ Group "${groupNameToShow}" created successfully!`;
                document.body.appendChild(successDiv);
                
                setTimeout(() => {
                    document.body.removeChild(successDiv);
                }, 3000);
            } else {
                const error = await res.json();
                alert(`Error: ${error.message || 'Failed to create group'}`);
            }
        } catch (err) {
            console.error('Error creating group:', err);
            alert('Failed to create group. Please try again.');
        }
    };

    const deleteGroup = async (id: string) => {
        await fetch(`/api/bishop/groups/${id}`, { method: 'DELETE' });
        await fetchGroups();
    };

    useEffect(() => {
        fetchGroups().then();
    }, []);

    return (
        <div className="min-h-screen bg-blue-300">
            {/* Header */}
            <div className="bg-blue-200/90 backdrop-blur-md border-b border-blue-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-2xl font-bold text-blue-800">Group Management</h1>
                            <p className="text-sm text-blue-700 mt-1">Create and manage church groups</p>
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
                {/* Create Group Form */}
                <div className="bg-blue-200/90 backdrop-blur-md rounded-lg shadow-sm border border-blue-300 p-6 mb-6">
                    <h2 className="text-lg font-medium text-blue-800 mb-4">Create New Group</h2>
                    <div className="flex gap-4">
                        <input 
                            placeholder="Enter group name" 
                            value={groupName} 
                            onChange={(e) => setGroupName(e.target.value)} 
                            className="flex-1 px-3 py-2 border border-blue-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-800 focus:border-blue-800 text-blue-800 placeholder-blue-600 bg-white/90"
                        />
                        <button 
                            onClick={createGroup} 
                            disabled={!groupName.trim()}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Add Group
                        </button>
                    </div>
                </div>

                {/* Groups List */}
                <div className="bg-blue-200/90 backdrop-blur-md rounded-lg shadow-sm border border-blue-300">
                    <div className="px-6 py-4 border-b border-blue-300">
                        <h2 className="text-lg font-medium text-blue-800">All Groups</h2>
                    </div>
                    
                    {groups.length > 0 ? (
                        <div className="divide-y divide-blue-300">
                            {groups.map((group: Group) => (
                                <div key={group._id} className="px-6 py-4 flex items-center justify-between hover:bg-white/10">
                                    <div className="flex-1">
                                        <h3 className="text-sm font-medium text-blue-800">{group.name}</h3>
                                        <p className="text-sm text-blue-700">{group.members.length} members</p>
                                        <p className="text-xs text-blue-600">
                                            Leader: {group.leader?.name || "No leader assigned"}
                                        </p>
                                    </div>
                                    <div className="flex space-x-2">
                                        <Link
                                            href={`/bishop/leaders?groupId=${group._id}`}
                                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                        >
                                            <UserCheck className="h-3 w-3 mr-1" />
                                            {group.leader ? "Change Leader" : "Assign Leader"}
                                        </Link>
                                        <button 
                                            onClick={() => deleteGroup(group._id)} 
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
                            <Users className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No groups yet</h3>
                            <p className="mt-1 text-sm text-gray-500">Create your first group to get started.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
