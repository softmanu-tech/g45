// src/app/api/events/route.ts
import { NextResponse } from 'next/server'
import  Event  from '@/lib/models/Event'
import { Group } from '@/lib/models/Group'
import { User } from '@/lib/models/User'
import dbConnect from '@/lib/dbConnect'


export async function GET(request: Request) {

    await dbConnect()
    const url = new URL(request.url)
  const page = Number(url.searchParams.get('page')) || 1
  const limit = Number(url.searchParams.get('limit')) || 10
  const groupId = url.searchParams.get('groupId') || undefined
  const startDate = url.searchParams.get('startDate')
  const endDate = url.searchParams.get('endDate')

  const filter: any = {}

  if (groupId) filter.group = groupId
    if (startDate || endDate) {
        filter.date = {}
        if (startDate) filter.date.$gte = new Date(startDate)
        if (endDate) filter.date.$lte = new Date(endDate)
    }
    const skip = (page - 1) * limit

    const events = await Event.find(filter)
        .populate('group', 'name')
        .populate('createdBy', 'name email')
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .lean()

        const total = await Event.countDocuments(filter)
        
        // For each event, fetch attendance data
        const eventsWithAttendance = await Promise.all(events.map(async (event) => {
            try {
                // Get attendance records for this event
                const Attendance = (await import('@/lib/models/Attendance')).default
                const attendanceRecord = await Attendance.findOne({ event: event._id })
            
                const attendanceCount = attendanceRecord?.presentMembers?.length || 0
                const totalMembers = (attendanceRecord?.presentMembers?.length || 0) + (attendanceRecord?.absentMembers?.length || 0)
                const attendanceRate = totalMembers > 0 ? Math.round((attendanceCount / totalMembers) * 100) : 0
                
                return { 
                    ...event, 
                    attendanceCount,
                    totalMembers,
                    attendanceRate
                }
            } catch (error) {
                console.error('Error fetching attendance for event:', event._id, error)
                return {
                    ...event,
                    attendanceCount: 0,
                    totalMembers: 0,
                    attendanceRate: 0
                }
            }
        }))

    return NextResponse.json({
        events: eventsWithAttendance,
        total,
        page,
        limit,
    })
}