import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { User } from '@/lib/models/User';
import { Attendance } from '@/lib/models/Attendance';
import Event from '@/lib/models/Event';
import Member from '@/lib/models/Member';
import { requireSessionAndRoles } from '@/lib/authMiddleware';

export async function GET(request: Request) {
  try {
    // Strict Authentication
    const { user } = await requireSessionAndRoles(request, ['leader']);
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Get the leader's group
    const leader = await User.findById(user.id).populate('group');
    if (!leader || !leader.group) {
      return NextResponse.json({ 
        error: 'Leader does not have an assigned group' 
      }, { status: 400 });
    }

    const groupId = leader.group._id;

    // Get date range (default to last 6 months)
    const url = new URL(request.url);
    const months = parseInt(url.searchParams.get('months') || '6');
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    // Get all attendance records for the group
    const attendanceRecords = await Attendance.find({
      group: groupId,
      date: { $gte: startDate }
    })
    .populate('event', 'title date')
    .populate('presentMembers', 'name email')
    .populate('absentMembers', 'name email')
    .sort({ date: 1 });

    // Get all events for the group
    const events = await Event.find({
      group: groupId,
      date: { $gte: startDate }
    }).sort({ date: 1 });

    // Get all group members
    const groupMembers = await Member.find({ group: groupId });
    const totalMembers = groupMembers.length;

    // Monthly performance data
    const monthlyData = [];
    const currentDate = new Date();
    
    for (let i = months - 1; i >= 0; i--) {
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 0);
      
      const monthAttendance = attendanceRecords.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= monthStart && recordDate <= monthEnd;
      });
      
      const monthEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= monthStart && eventDate <= monthEnd;
      });

      const totalPresent = monthAttendance.reduce((sum, record) => 
        sum + (record.presentMembers?.length || 0), 0
      );
      const totalAbsent = monthAttendance.reduce((sum, record) => 
        sum + (record.absentMembers?.length || 0), 0
      );
      const totalAttendees = totalPresent + totalAbsent;
      const attendanceRate = totalAttendees > 0 ? (totalPresent / totalAttendees) * 100 : 0;

      monthlyData.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        eventsCount: monthEvents.length,
        attendanceRecords: monthAttendance.length,
        presentCount: totalPresent,
        absentCount: totalAbsent,
        attendanceRate: Math.round(attendanceRate * 10) / 10,
        averageAttendance: monthAttendance.length > 0 ? Math.round((totalPresent / monthAttendance.length) * 10) / 10 : 0
      });
    }

    // Member performance analysis
    const memberPerformance = groupMembers.map(member => {
      const memberAttendance = attendanceRecords.filter(record => 
        record.presentMembers?.some(p => p._id.toString() === member._id.toString()) ||
        record.absentMembers?.some(a => a._id.toString() === member._id.toString())
      );
      
      const presentRecords = attendanceRecords.filter(record => 
        record.presentMembers?.some(p => p._id.toString() === member._id.toString())
      );
      
      const attendanceRate = memberAttendance.length > 0 
        ? (presentRecords.length / memberAttendance.length) * 100 
        : 0;

      return {
        memberId: member._id,
        memberName: member.name,
        totalEvents: memberAttendance.length,
        presentCount: presentRecords.length,
        absentCount: memberAttendance.length - presentRecords.length,
        attendanceRate: Math.round(attendanceRate * 10) / 10,
        rating: attendanceRate >= 80 ? 'Excellent' : attendanceRate >= 60 ? 'Good' : attendanceRate >= 40 ? 'Average' : 'Poor'
      };
    }).sort((a, b) => b.attendanceRate - a.attendanceRate);

    // Overall group statistics
    const totalPresent = attendanceRecords.reduce((sum, record) => 
      sum + (record.presentMembers?.length || 0), 0
    );
    const totalAbsent = attendanceRecords.reduce((sum, record) => 
      sum + (record.absentMembers?.length || 0), 0
    );
    const totalAttendees = totalPresent + totalAbsent;
    const overallAttendanceRate = totalAttendees > 0 ? (totalPresent / totalAttendees) * 100 : 0;

    // Trend analysis
    const recentMonths = monthlyData.slice(-3);
    const previousMonths = monthlyData.slice(-6, -3);
    const recentAvg = recentMonths.length > 0 
      ? recentMonths.reduce((sum, month) => sum + month.attendanceRate, 0) / recentMonths.length 
      : 0;
    const previousAvg = previousMonths.length > 0 
      ? previousMonths.reduce((sum, month) => sum + month.attendanceRate, 0) / previousMonths.length 
      : 0;
    
    const trend = recentAvg > previousAvg ? 'improving' : recentAvg < previousAvg ? 'declining' : 'stable';
    const trendPercentage = previousAvg > 0 ? Math.round(((recentAvg - previousAvg) / previousAvg) * 100 * 10) / 10 : 0;

    return NextResponse.json({
      success: true,
      data: {
        groupInfo: {
          groupId: leader.group._id,
          groupName: leader.group.name,
          leaderName: leader.name,
          totalMembers,
          totalEvents: events.length,
          totalAttendanceRecords: attendanceRecords.length
        },
        overallStats: {
          attendanceRate: Math.round(overallAttendanceRate * 10) / 10,
          totalPresent,
          totalAbsent,
          averageAttendancePerEvent: attendanceRecords.length > 0 
            ? Math.round((totalPresent / attendanceRecords.length) * 10) / 10 
            : 0
        },
        trend: {
          direction: trend,
          percentage: trendPercentage,
          description: trend === 'improving' 
            ? `Attendance improved by ${Math.abs(trendPercentage)}% in recent months`
            : trend === 'declining'
            ? `Attendance declined by ${Math.abs(trendPercentage)}% in recent months`
            : 'Attendance has remained stable'
        },
        monthlyData,
        memberPerformance: memberPerformance.slice(0, 20), // Top 20 members
        insights: {
          bestMonth: monthlyData.reduce((best, month) => 
            month.attendanceRate > best.attendanceRate ? month : best, 
            monthlyData[0] || { month: 'N/A', attendanceRate: 0 }
          ),
          worstMonth: monthlyData.reduce((worst, month) => 
            month.attendanceRate < worst.attendanceRate ? month : worst, 
            monthlyData[0] || { month: 'N/A', attendanceRate: 100 }
          ),
          excellentMembers: memberPerformance.filter(m => m.rating === 'Excellent').length,
          needsAttention: memberPerformance.filter(m => m.rating === 'Poor').length
        }
      }
    });
  } catch (error: unknown) {
    let errorMsg = 'Unknown error';
    if (error instanceof Error) {
      errorMsg = error.message;
    }
    console.error('Group performance analytics error:', error);
    return NextResponse.json(
      { error: `Failed to fetch group performance data: ${errorMsg}` },
      { status: 500 }
    );
  }
}
