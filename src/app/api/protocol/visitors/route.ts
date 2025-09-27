import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { requireSessionAndRoles } from '@/lib/authMiddleware';

// Import models in dependency order to ensure proper registration
import '@/lib/models/Group';
import '@/lib/models/Notification';
import '@/lib/models/ProtocolTeam';
import '@/lib/models/Visitor';
import '@/lib/models/User';

// Import model classes
import { User } from '@/lib/models/User';
import { ProtocolTeam } from '@/lib/models/ProtocolTeam';
import { Visitor } from '@/lib/models/Visitor';

// GET visitors for protocol member - Simplified version
export async function GET(request: Request) {
  try {
    const { user } = await requireSessionAndRoles(request, ['protocol']);
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Get protocol member details
    const protocolMember = await User.findById(user.id);
    if (!protocolMember) {
      return NextResponse.json({ 
        error: 'Protocol member not found' 
      }, { status: 400 });
    }

    // Get protocol team details
    let protocolTeam = null;
    if (protocolMember.protocolTeam) {
      protocolTeam = await ProtocolTeam.findById(protocolMember.protocolTeam);
    }

    // Get all visitors assigned to this protocol member
    const visitors = await Visitor.find({
      $or: [
        { assignedProtocolMember: user.id },
        { protocolTeam: protocolMember.protocolTeam }
      ]
    }).sort({ createdAt: -1 });

    // Calculate statistics
    const totalVisitors = visitors.length;
    const joiningVisitors = visitors.filter(v => v.type === 'joining').length;
    const visitingOnly = visitors.filter(v => v.type === 'visiting').length;
    const activeMonitoring = visitors.filter(v => v.status === 'monitoring').length;
    const completedMonitoring = visitors.filter(v => v.status === 'completed').length;
    const convertedToMembers = visitors.filter(v => v.status === 'converted').length;
    const needsAttention = visitors.filter(v => v.status === 'needs-attention').length;
    
    // Calculate conversion rate
    const conversionRate = totalVisitors > 0 ? Math.round((convertedToMembers / totalVisitors) * 100) : 0;

    const dashboardData = {
      protocolMember: {
        name: protocolMember.name,
        email: protocolMember.email,
        profilePicture: protocolMember.profilePicture,
        team: {
          name: protocolTeam?.name || 'Protocol Team',
          description: protocolTeam?.description || 'Visitor management and integration team'
        }
      },
      visitors: visitors.map(visitor => ({
        _id: visitor._id,
        name: visitor.name,
        email: visitor.email,
        phone: visitor.phone,
        address: visitor.address,
        type: visitor.type,
        status: visitor.status,
        monitoringStatus: visitor.monitoringStatus || 'inactive',
        attendanceRate: visitor.attendanceRate || 0,
        monitoringProgress: visitor.monitoringProgress || 0,
        daysRemaining: visitor.monitoringEndDate ? 
          Math.max(0, Math.ceil((new Date(visitor.monitoringEndDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : 0,
        createdAt: visitor.createdAt
      })),
      statistics: {
        totalVisitors,
        joiningVisitors,
        visitingOnly,
        activeMonitoring,
        completedMonitoring,
        convertedToMembers,
        needsAttention,
        conversionRate
      }
    };

    return NextResponse.json({
      success: true,
      data: dashboardData
    });
  } catch (error: unknown) {
    console.error('Protocol visitors error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch protocol dashboard data' },
      { status: 500 }
    );
  }
}

// POST create new visitor - Simplified version  
export async function POST(request: Request) {
  try {
    const { user } = await requireSessionAndRoles(request, ['protocol']);
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      name,
      email,
      phone,
      address,
      age,
      occupation,
      maritalStatus,
      type,
      status,
      referredBy,
      howDidYouHear,
      emergencyContact
    } = await request.json();

    await dbConnect();

    // Get protocol member details
    const protocolMember = await User.findById(user.id);
    if (!protocolMember) {
      return NextResponse.json({ 
        error: 'Protocol member not found' 
      }, { status: 400 });
    }

    // Validate required fields
    if (!name || !email || !type || !status) {
      return NextResponse.json({ 
        error: 'Name, email, type, and status are required' 
      }, { status: 400 });
    }

    // Get protocol team for this member
    let protocolTeam = null;
    if (protocolMember.protocolTeam) {
      protocolTeam = await ProtocolTeam.findById(protocolMember.protocolTeam);
    }

    // Create new visitor
    const visitor = new Visitor({
      name,
      email,
      phone,
      address,
      age: age ? Number(age) : undefined,
      occupation,
      maritalStatus,
      type,
      status,
      referredBy,
      howDidYouHear,
      emergencyContact,
      assignedProtocolMember: user.id,
      protocolTeam: protocolMember.protocolTeam,
      monitoringStartDate: type === 'joining' ? new Date() : undefined,
      monitoringEndDate: type === 'joining' ? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) : undefined, // 90 days from now
      monitoringStatus: type === 'joining' ? 'active' : 'inactive',
      attendanceRate: 0,
      monitoringProgress: 0
    });

    await visitor.save();

    return NextResponse.json({
      success: true,
      message: 'Visitor registered successfully',
      data: {
        _id: visitor._id,
        name: visitor.name,
        email: visitor.email,
        phone: visitor.phone,
        type: visitor.type,
        status: visitor.status,
        createdAt: visitor.createdAt
      }
    });
  } catch (error: unknown) {
    console.error('Create visitor error:', error);
    return NextResponse.json(
      { error: 'Failed to create visitor' },
      { status: 500 }
    );
  }
}