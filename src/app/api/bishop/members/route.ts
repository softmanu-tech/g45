import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { User } from '@/lib/models/User';
import Member from '@/lib/models/Member';
import { Group } from '@/lib/models/Group';
import { Attendance } from '@/lib/models/Attendance';
import { requireSessionAndRoles } from '@/lib/authMiddleware';

export async function GET(request: Request) {
  try {
    // Strict Authentication
    const { user } = await requireSessionAndRoles(request, ['bishop']);
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Get all members across all groups
    const members = await Member.find()
      .populate('group', 'name')
      .populate('leader', 'name email')
      .sort({ name: 1 });

    // Also get User-based members (in case some are stored as Users)
    const userMembers = await User.find({ role: 'member' })
      .populate('group', 'name')
      .sort({ name: 1 });

    // Get attendance data for each member
    const membersWithAttendance = await Promise.all([
      ...members.map(async (member) => {
        const attendanceRecords = await Attendance.find({
          $or: [
            { presentMembers: member._id },
            { absentMembers: member._id }
          ]
        }).populate('event', 'title date');

        const presentCount = attendanceRecords.filter(record => 
          record.presentMembers.includes(member._id)
        ).length;
        
        const totalRecords = attendanceRecords.length;
        const attendanceRate = totalRecords > 0 ? (presentCount / totalRecords) * 100 : 0;
        
        const lastAttendance = attendanceRecords
          .filter(record => record.presentMembers.includes(member._id))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

        return {
          _id: member._id,
          name: member.name,
          email: member.email,
          phone: member.phone || '',
          residence: member.residence || '',
          department: member.department || '',
          group: member.group || { name: 'No Group' },
          leader: member.leader || { name: 'No Leader' },
          attendanceCount: presentCount,
          totalEvents: totalRecords,
          attendanceRate: Math.round(attendanceRate),
          lastAttendanceDate: lastAttendance ? lastAttendance.date : null,
          rating: attendanceRate >= 80 ? 'Excellent' : 
                  attendanceRate >= 60 ? 'Good' : 
                  attendanceRate >= 40 ? 'Average' : 'Poor',
          type: 'member'
        };
      }),
      ...userMembers.map(async (member) => {
        const attendanceRecords = await Attendance.find({
          $or: [
            { presentMembers: member._id },
            { absentMembers: member._id }
          ]
        }).populate('event', 'title date');

        const presentCount = attendanceRecords.filter(record => 
          record.presentMembers.includes(member._id)
        ).length;
        
        const totalRecords = attendanceRecords.length;
        const attendanceRate = totalRecords > 0 ? (presentCount / totalRecords) * 100 : 0;
        
        const lastAttendance = attendanceRecords
          .filter(record => record.presentMembers.includes(member._id))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

        return {
          _id: member._id,
          name: member.name,
          email: member.email,
          phone: member.phone || '',
          residence: member.residence || '',
          department: member.department || '',
          group: member.group || { name: 'No Group' },
          leader: null,
          attendanceCount: presentCount,
          totalEvents: totalRecords,
          attendanceRate: Math.round(attendanceRate),
          lastAttendanceDate: lastAttendance ? lastAttendance.date : null,
          rating: attendanceRate >= 80 ? 'Excellent' : 
                  attendanceRate >= 60 ? 'Good' : 
                  attendanceRate >= 40 ? 'Average' : 'Poor',
          type: 'user'
        };
      })
    ]);

    // Remove duplicates and sort by name
    const uniqueMembers = membersWithAttendance
      .filter((member, index, self) => 
        index === self.findIndex(m => m.email === member.email)
      )
      .sort((a, b) => a.name.localeCompare(b.name));

    // Calculate summary statistics
    const totalMembers = uniqueMembers.length;
    const excellentMembers = uniqueMembers.filter(m => m.rating === 'Excellent').length;
    const goodMembers = uniqueMembers.filter(m => m.rating === 'Good').length;
    const averageMembers = uniqueMembers.filter(m => m.rating === 'Average').length;
    const poorMembers = uniqueMembers.filter(m => m.rating === 'Poor').length;
    
    const overallAttendanceRate = uniqueMembers.length > 0 
      ? Math.round(uniqueMembers.reduce((sum, member) => sum + member.attendanceRate, 0) / uniqueMembers.length)
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        members: uniqueMembers,
        summary: {
          totalMembers,
          overallAttendanceRate,
          excellentMembers,
          goodMembers,
          averageMembers,
          poorMembers,
          activeMembers: uniqueMembers.filter(m => m.totalEvents > 0).length,
          inactiveMembers: uniqueMembers.filter(m => m.totalEvents === 0).length
        }
      }
    });
  } catch (error: unknown) {
    let errorMsg = 'Unknown error';
    if (error instanceof Error) {
      errorMsg = error.message;
    }
    console.error('Bishop members fetch error:', error);
    return NextResponse.json(
      { error: `Failed to fetch members data: ${errorMsg}` },
      { status: 500 }
    );
  }
}
