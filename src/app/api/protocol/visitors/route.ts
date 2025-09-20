import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { User } from '@/lib/models/User';
import { Visitor } from '@/lib/models/Visitor';
import { ProtocolTeam } from '@/lib/models/ProtocolTeam';
import { requireSessionAndRoles } from '@/lib/authMiddleware';
import bcrypt from 'bcryptjs';

// GET visitors for protocol member
export async function GET(request: Request) {
  try {
    const { user } = await requireSessionAndRoles(request, ['protocol']);
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Get protocol member details
    const protocolMember = await User.findById(user.id).populate('protocolTeam');
    if (!protocolMember || !protocolMember.protocolTeam) {
      return NextResponse.json({ 
        error: 'Protocol member not assigned to a team' 
      }, { status: 400 });
    }

    // Get visitors assigned to this protocol member or team
    const visitors = await Visitor.find({
      $or: [
        { assignedProtocolMember: user.id },
        { protocolTeam: protocolMember.protocolTeam._id }
      ]
    })
    .populate('protocolTeam', 'name')
    .populate('assignedProtocolMember', 'name email')
    .sort({ createdAt: -1 });

    // Calculate statistics
    const totalVisitors = visitors.length;
    const joiningVisitors = visitors.filter(v => v.status === 'joining').length;
    const visitingOnly = visitors.filter(v => v.status === 'visiting').length;
    const activeMonitoring = visitors.filter(v => v.monitoringStatus === 'active').length;
    const completedMonitoring = visitors.filter(v => v.monitoringStatus === 'completed').length;
    const convertedToMembers = visitors.filter(v => v.monitoringStatus === 'converted-to-member').length;

    // Get visitors needing attention (milestones overdue, no recent visits)
    const needsAttention = visitors.filter(visitor => {
      if (visitor.status !== 'joining') return false;
      
      // Check for overdue milestones
      const currentWeek = Math.ceil((Date.now() - new Date(visitor.monitoringStartDate || 0).getTime()) / (7 * 24 * 60 * 60 * 1000));
      const completedMilestones = visitor.milestones.filter(m => m.completed).length;
      
      return currentWeek > completedMilestones + 1; // More than 1 week behind
    });

    return NextResponse.json({
      success: true,
      data: {
        visitors,
        protocolMember: {
          name: protocolMember.name,
          email: protocolMember.email,
          team: protocolMember.protocolTeam
        },
        statistics: {
          totalVisitors,
          joiningVisitors,
          visitingOnly,
          activeMonitoring,
          completedMonitoring,
          convertedToMembers,
          needsAttention: needsAttention.length,
          conversionRate: joiningVisitors > 0 ? Math.round((convertedToMembers / joiningVisitors) * 100) : 0
        }
      }
    });
  } catch (error: unknown) {
    console.error('Protocol visitors fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch visitors' },
      { status: 500 }
    );
  }
}

// POST create new visitor
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
      previousChurch,
      emergencyContact
    } = await request.json();

    await dbConnect();

    // Get protocol member details
    const protocolMember = await User.findById(user.id).populate('protocolTeam');
    if (!protocolMember || !protocolMember.protocolTeam) {
      return NextResponse.json({ 
        error: 'Protocol member not assigned to a team' 
      }, { status: 400 });
    }

    // Validate required fields
    if (!name || !email || !type || !status) {
      return NextResponse.json({ 
        error: 'Name, email, type, and status are required' 
      }, { status: 400 });
    }

    // Check if visitor email already exists
    const existingVisitor = await Visitor.findOne({ email });
    if (existingVisitor) {
      return NextResponse.json({ 
        error: 'Visitor with this email already exists' 
      }, { status: 400 });
    }

    // Prepare visitor data
    const visitorData: any = {
      name,
      email,
      phone,
      address,
      age,
      occupation,
      maritalStatus,
      type,
      status,
      protocolTeam: protocolMember.protocolTeam._id,
      assignedProtocolMember: user.id,
      referredBy,
      howDidYouHear,
      previousChurch,
      emergencyContact,
      isActive: true
    };

    // If joining visitor, create account and monitoring system
    if (status === 'joining') {
      const temporaryPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(temporaryPassword, 10);
      
      visitorData.password = hashedPassword;
      visitorData.canLogin = true;
      visitorData.monitoringStartDate = new Date();
      
      // Set monitoring end date (3 months from now)
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 3);
      visitorData.monitoringEndDate = endDate;
      
      // Initialize 12-week milestone tracking
      visitorData.milestones = Array.from({ length: 12 }, (_, index) => ({
        week: index + 1,
        completed: false,
        notes: ''
      }));

      const visitor = new Visitor(visitorData);
      await visitor.save();

      return NextResponse.json({
        success: true,
        data: {
          visitor,
          loginCredentials: {
            email,
            temporaryPassword
          }
        },
        message: 'Joining visitor created with login account'
      });
    } else {
      // Visiting only - no account needed
      visitorData.canLogin = false;
      
      const visitor = new Visitor(visitorData);
      await visitor.save();

      return NextResponse.json({
        success: true,
        data: { visitor },
        message: 'Visiting-only visitor registered successfully'
      });
    }
  } catch (error: unknown) {
    console.error('Visitor creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create visitor' },
      { status: 500 }
    );
  }
}
