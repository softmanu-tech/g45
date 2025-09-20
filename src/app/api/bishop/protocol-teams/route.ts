import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { User } from '@/lib/models/User';
import { ProtocolTeam } from '@/lib/models/ProtocolTeam';
import { requireSessionAndRoles } from '@/lib/authMiddleware';
import bcrypt from 'bcryptjs';

// GET all protocol teams
export async function GET(request: Request) {
  try {
    const { user } = await requireSessionAndRoles(request, ['bishop']);
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const protocolTeams = await ProtocolTeam.find({ isActive: true })
      .populate('leader', 'name email phone')
      .populate('members', 'name email phone')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    // Get team statistics
    const teamsWithStats = await Promise.all(protocolTeams.map(async (team) => {
      const { Visitor } = await import('@/lib/models/Visitor');
      
      const totalVisitors = await Visitor.countDocuments({ protocolTeam: team._id });
      const joiningVisitors = await Visitor.countDocuments({ 
        protocolTeam: team._id, 
        status: 'joining' 
      });
      const activeMonitoring = await Visitor.countDocuments({ 
        protocolTeam: team._id, 
        monitoringStatus: 'active' 
      });
      const convertedMembers = await Visitor.countDocuments({ 
        protocolTeam: team._id, 
        monitoringStatus: 'converted-to-member' 
      });

      return {
        ...team.toObject(),
        stats: {
          totalVisitors,
          joiningVisitors,
          activeMonitoring,
          convertedMembers,
          conversionRate: joiningVisitors > 0 ? Math.round((convertedMembers / joiningVisitors) * 100) : 0
        }
      };
    }));

    return NextResponse.json({
      success: true,
      data: teamsWithStats
    });
  } catch (error: unknown) {
    console.error('Protocol teams fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch protocol teams' },
      { status: 500 }
    );
  }
}

// POST create new protocol team
export async function POST(request: Request) {
  try {
    const { user } = await requireSessionAndRoles(request, ['bishop']);
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      name, 
      description, 
      leaderName, 
      leaderEmail, 
      responsibilities 
    } = await request.json();

    await dbConnect();

    // Validate required fields
    if (!name || !leaderName || !leaderEmail) {
      return NextResponse.json({ 
        error: 'Team name, leader name, and leader email are required' 
      }, { status: 400 });
    }

    // Check if team name already exists
    const existingTeam = await ProtocolTeam.findOne({ name });
    if (existingTeam) {
      return NextResponse.json({ 
        error: 'Protocol team with this name already exists' 
      }, { status: 400 });
    }

    // Create protocol team leader account
    const temporaryPassword = Math.random().toString(36).slice(-10);
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    const protocolLeader = new User({
      name: leaderName,
      email: leaderEmail,
      password: hashedPassword,
      role: 'protocol'
    });

    await protocolLeader.save();

    // Create protocol team
    const protocolTeam = new ProtocolTeam({
      name,
      description,
      leader: protocolLeader._id,
      members: [protocolLeader._id], // Leader is also a member
      responsibilities: responsibilities || [
        'Welcome and register visitors',
        'Monitor joining visitors progress',
        'Collect visitor feedback and experiences',
        'Report to bishop on visitor engagement',
        'Assist visitors with church integration'
      ],
      createdBy: user.id
    });

    await protocolTeam.save();

    // Update the leader's protocolTeam reference
    protocolLeader.protocolTeam = protocolTeam._id;
    await protocolLeader.save();

    return NextResponse.json({
      success: true,
      data: {
        team: protocolTeam,
        leader: {
          _id: protocolLeader._id,
          name: protocolLeader.name,
          email: protocolLeader.email,
          temporaryPassword // Return for initial setup
        }
      },
      message: 'Protocol team created successfully'
    });
  } catch (error: unknown) {
    console.error('Protocol team creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create protocol team' },
      { status: 500 }
    );
  }
}
