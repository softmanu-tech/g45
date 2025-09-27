import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { User } from "@/lib/models/User";
import { Group } from "@/lib/models/Group";
import { Attendance } from "@/lib/models/Attendance";
import Event from "@/lib/models/Event";
import { requireSessionAndRoles } from "@/lib/authMiddleware";

export const dynamic = 'force-dynamic';
import { Types } from "mongoose";

interface Leader {
  _id: Types.ObjectId;
  name: string;
  email: string;
}

interface GroupWithLeader {
  _id: Types.ObjectId;
  name: string;
  leader?: Leader | null;
}

export async function GET(request: Request) {
  const { user } = await requireSessionAndRoles(request, ["bishop"]);
  if (!user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await dbConnect();

    const url = new URL(request.url);
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");
    const groupId = url.searchParams.get("groupId");

    let dateFilter = {};
    if (from || to) {
      dateFilter = {
        date: {
          ...(from ? { $gte: new Date(from) } : {}),
          ...(to ? { $lte: new Date(to) } : {}),
        },
      };
    }

    // Basic stats
    const [leadersCount, groupsCount, membersCount, attendanceRecords] =
      await Promise.all([
        User.countDocuments({ role: "leader" }),
        Group.countDocuments(),
        User.countDocuments({ role: "member" }),
        Attendance.find(dateFilter).lean(),
      ]);

    const totalAttendance = attendanceRecords.reduce(
      (sum, record) => sum + (record.presentMembers?.length || 0),
      0
    );

    // Get all groups with their leaders
    const groupQuery = groupId ? { _id: groupId } : {};
    const groups = await Group.find(groupQuery)
      .populate<{ leader: Leader }>("leader", "name email")
      .lean()
      .exec();

    // Get detailed stats for each group
    const detailedStats = await Promise.all(
      groups.map(async (group) => {
        const g = group as unknown as GroupWithLeader;
        
        // Get members in this group
        const members = await User.find({ group: g._id, role: "member" })
          .select("name email")
          .lean();
        
        // Get events for this group
        const events = await Event.find({ 
          group: g._id,
          ...dateFilter
        })
        .sort({ date: -1 })
        .populate("createdBy", "name email")
        .lean();
        
        // Get attendance records for this group
        const attendanceData = await Attendance.find({ 
          group: g._id,
          ...dateFilter
        })
        .populate("event", "title date")
        .populate("presentMembers", "name email")
        .populate("absentMembers", "name email")
        .sort({ date: -1 })
        .lean();
        
        // Calculate attendance rate for each event
        const eventAttendance = events.map(event => {
          const attendance = attendanceData.find(a => 
            a.event && a.event._id.toString() === event._id.toString()
          );
          
          const presentCount = attendance?.presentMembers?.length || 0;
          const absentCount = attendance?.absentMembers?.length || 0;
          const totalCount = presentCount + absentCount;
          const attendanceRate = totalCount > 0 ? (presentCount / totalCount) * 100 : 0;
          
          return {
            eventId: event._id.toString(),
            title: event.title,
            date: event.date,
            location: event.location,
            presentCount,
            absentCount,
            attendanceRate: Math.round(attendanceRate),
            createdBy: event.createdBy
          };
        });
        
        // Calculate member attendance stats
        const memberAttendance = members.map(member => {
          const presentCount = attendanceData.filter(a => 
            a.presentMembers.some(m => m._id.toString() === (member._id as any).toString())
          ).length;
          
          const absentCount = attendanceData.filter(a => 
            a.absentMembers.some(m => m._id.toString() === (member._id as any).toString())
          ).length;
          
          const totalEvents = presentCount + absentCount;
          const attendanceRate = totalEvents > 0 ? (presentCount / totalEvents) * 100 : 0;
          
          return {
            memberId: (member._id as any).toString(),
            name: member.name,
            email: member.email,
            presentCount,
            absentCount,
            attendanceRate: Math.round(attendanceRate)
          };
        });
        
        // Calculate overall group attendance rate
        const totalPresent = attendanceData.reduce(
          (sum, record) => sum + (record.presentMembers?.length || 0), 0
        );
        const totalAbsent = attendanceData.reduce(
          (sum, record) => sum + (record.absentMembers?.length || 0), 0
        );
        const totalAttendees = totalPresent + totalAbsent;
        const groupAttendanceRate = totalAttendees > 0 
          ? (totalPresent / totalAttendees) * 100 
          : 0;

        return {
          groupId: g._id.toString(),
          groupName: g.name,
          leaderName: g.leader?.name || "Unassigned",
          leaderEmail: g.leader?.email || "N/A",
          memberCount: members.length,
          eventCount: events.length,
          attendanceCount: attendanceData.length,
          attendanceRate: Math.round(groupAttendanceRate),
          events: eventAttendance,
          members: memberAttendance
        };
      })
    );

    return NextResponse.json({
      stats: {
        totalLeaders: leadersCount,
        totalGroups: groupsCount,
        totalMembers: membersCount,
        totalAttendance,
      },
      groups: detailedStats,
      filter: { from, to, groupId },
    });
  } catch (error) {
    console.error("Error fetching bishop dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
