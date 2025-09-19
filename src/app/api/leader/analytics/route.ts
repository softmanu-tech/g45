import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { User } from '@/lib/models/User';
import { requireSessionAndRoles } from '@/lib/authMiddleware';
import mongoose from 'mongoose';
import Event from '@/lib/models/Event';
import { Attendance } from '@/lib/models/Attendance';

export async function GET(request: Request) {
    try {
        // 1. Strict Authentication
        const { user } = await requireSessionAndRoles(request, ['leader']);
        if (!user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Parse query parameters
        const url = new URL(request.url);
        const startDate = url.searchParams.get('startDate') 
            ? new Date(url.searchParams.get('startDate') as string) 
            : new Date(new Date().setDate(new Date().getDate() - 30)); // Default to last 30 days
        const endDate = url.searchParams.get('endDate') 
            ? new Date(url.searchParams.get('endDate') as string) 
            : new Date();

        await dbConnect();

        // Get the leader's group
        const leader = await User.findById(user.id);
        if (!leader || !leader.group) {
            return NextResponse.json({ 
                error: 'Leader does not have an assigned group' 
            }, { status: 400 });
        }

        // Get all members in the leader's group
        const members = await User.find({ 
            group: leader.group,
            role: 'member'
        }).select('_id name email phone');

        // Get all attendance records for the leader's group within the date range
        const attendanceRecords = await Attendance.find({
            group: leader.group,
            date: { $gte: startDate, $lte: endDate }
        });

        // Get all events for the leader's group within the date range
        const events = await Event.find({
            group: leader.group,
            date: { $gte: startDate, $lte: endDate }
        });

        // Calculate attendance statistics for each member
        const memberAnalytics = members.map(member => {
            const memberAttendance = {
                present: 0,
                absent: 0,
                total: 0,
                percentage: 0
            };

            // Count present and absent for each attendance record
            attendanceRecords.forEach(record => {
                if (record.presentMembers.some(id => id.toString() === member._id.toString())) {
                    memberAttendance.present++;
                } else if (record.absentMembers.some(id => id.toString() === member._id.toString())) {
                    memberAttendance.absent++;
                }
            });

            memberAttendance.total = memberAttendance.present + memberAttendance.absent;
            memberAttendance.percentage = memberAttendance.total > 0 
                ? Math.round((memberAttendance.present / memberAttendance.total) * 100) 
                : 0;

            return {
                member: {
                    _id: member._id,
                    name: member.name,
                    email: member.email,
                    phone: member.phone
                },
                attendance: memberAttendance,
                // Calculate trend (improved, declined, stable)
                trend: calculateTrend(member._id, attendanceRecords)
            };
        });

        // Sort members by attendance percentage (highest to lowest)
        memberAnalytics.sort((a, b) => b.attendance.percentage - a.attendance.percentage);

        // Calculate overall group statistics
        const groupStats = {
            totalMembers: members.length,
            totalEvents: events.length,
            totalAttendanceRecords: attendanceRecords.length,
            averageAttendance: calculateAverageAttendance(attendanceRecords)
        };

        return NextResponse.json({
            success: true,
            data: {
                groupStats,
                memberAnalytics
            }
        });
    } catch (error: unknown) {
        let errorMsg = 'Unknown error';
        if (error instanceof Error) {
            errorMsg = error.message;
        } else if (typeof error === 'string') {
            errorMsg = error;
        }
        console.error('Leader analytics error:', error);
        return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
    }
}

// Helper function to calculate attendance trend for a member
function calculateTrend(memberId: mongoose.Types.ObjectId, attendanceRecords: any[]) {
    // Sort attendance records by date
    const sortedRecords = [...attendanceRecords].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // If we have less than 2 records, we can't calculate a trend
    if (sortedRecords.length < 2) {
        return 'insufficient data';
    }
    
    // Split records into two halves to compare
    const midpoint = Math.floor(sortedRecords.length / 2);
    const firstHalf = sortedRecords.slice(0, midpoint);
    const secondHalf = sortedRecords.slice(midpoint);
    
    // Calculate attendance percentage for each half
    const firstHalfPresent = firstHalf.filter(record => 
        record.presentMembers.some((id: mongoose.Types.ObjectId) => id.toString() === memberId.toString())
    ).length;
    
    const secondHalfPresent = secondHalf.filter(record => 
        record.presentMembers.some((id: mongoose.Types.ObjectId) => id.toString() === memberId.toString())
    ).length;
    
    const firstHalfPercentage = firstHalfPresent / firstHalf.length * 100;
    const secondHalfPercentage = secondHalfPresent / secondHalf.length * 100;
    
    // Determine trend
    const difference = secondHalfPercentage - firstHalfPercentage;
    if (difference >= 10) return 'improved';
    if (difference <= -10) return 'declined';
    return 'stable';
}

// Helper function to calculate average attendance percentage
function calculateAverageAttendance(attendanceRecords: any[]) {
    if (attendanceRecords.length === 0) return 0;
    
    let totalPercentage = 0;
    
    attendanceRecords.forEach(record => {
        const total = record.presentMembers.length + record.absentMembers.length;
        if (total > 0) {
            const percentage = (record.presentMembers.length / total) * 100;
            totalPercentage += percentage;
        }
    });
    
    return Math.round(totalPercentage / attendanceRecords.length);
}