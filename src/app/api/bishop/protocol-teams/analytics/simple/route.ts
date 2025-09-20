import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { ProtocolTeam } from '@/lib/models/ProtocolTeam';
import { Visitor } from '@/lib/models/Visitor';
import { requireSessionAndRoles } from '@/lib/authMiddleware';

// GET simplified protocol teams analytics
export async function GET(request: Request) {
  try {
    const { user } = await requireSessionAndRoles(request, ['bishop']);
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Get all active protocol teams
    const protocolTeams = await ProtocolTeam.find({ isActive: true })
      .populate('leader', 'name email')
      .populate('members', 'name email')
      .sort({ createdAt: -1 });

    console.log('Found protocol teams:', protocolTeams.length);

    // Get all visitors
    let allVisitors = [];
    try {
      allVisitors = await Visitor.find({}).exec();
      console.log('Found visitors:', allVisitors.length);
    } catch (err) {
      console.log('Error fetching visitors:', err);
      allVisitors = [];
    }

    // Calculate basic analytics for each team
    const teamAnalytics = protocolTeams.map((team) => {
      const teamVisitors = allVisitors.filter(v => 
        v.protocolTeam && v.protocolTeam.toString() === team._id.toString()
      );
      
      console.log(`Team ${team.name} has ${teamVisitors.length} visitors`);

      const totalVisitors = teamVisitors.length;
      const joiningVisitors = teamVisitors.filter(v => v.status === 'joining').length;
      const visitingOnly = teamVisitors.filter(v => v.status === 'visiting').length;
      const convertedMembers = teamVisitors.filter(v => v.monitoringStatus === 'converted-to-member').length;
      const conversionRate = joiningVisitors > 0 ? Math.round((convertedMembers / joiningVisitors) * 100) : 0;

      // Simple monthly data (last 6 months)
      const monthlyGrowth = [];
      const now = new Date();
      
      for (let i = 5; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        
        const monthVisitors = teamVisitors.filter(v => {
          const visitorDate = new Date(v.createdAt);
          return visitorDate >= monthStart && visitorDate <= monthEnd;
        });

        monthlyGrowth.push({
          month: monthStart.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          totalVisitors: monthVisitors.length,
          joining: monthVisitors.filter(v => v.status === 'joining').length,
          visiting: monthVisitors.filter(v => v.status === 'visiting').length,
          conversions: monthVisitors.filter(v => v.monitoringStatus === 'converted-to-member').length,
          cumulativeTotal: teamVisitors.filter(v => new Date(v.createdAt) <= monthEnd).length
        });
      }

      // Member performance
      const memberPerformance = team.members.map((member) => {
        const memberVisitors = teamVisitors.filter(v => 
          v.assignedProtocolMember && v.assignedProtocolMember.toString() === member._id.toString()
        );
        const memberConversions = memberVisitors.filter(v => v.monitoringStatus === 'converted-to-member').length;
        
        return {
          memberId: member._id,
          name: member.name,
          email: member.email,
          assignedVisitors: memberVisitors.length,
          conversions: memberConversions,
          conversionRate: memberVisitors.length > 0 ? Math.round((memberConversions / memberVisitors.length) * 100) : 0,
          isLeader: member._id.toString() === team.leader._id.toString()
        };
      });

      // Performance score (simple calculation)
      const performanceScore = Math.round(
        (conversionRate * 0.4) + 
        (Math.min(totalVisitors / 5, 1) * 30) + 
        (team.members.length > 1 ? 20 : 10) + 
        10 // Base score
      );

      return {
        teamId: team._id,
        teamName: team.name,
        teamDescription: team.description,
        leader: {
          name: team.leader.name,
          email: team.leader.email
        },
        memberCount: team.members.length,
        createdAt: team.createdAt,
        statistics: {
          totalVisitors,
          joiningVisitors,
          visitingOnly,
          activeMonitoring: teamVisitors.filter(v => v.monitoringStatus === 'active').length,
          completedMonitoring: teamVisitors.filter(v => v.monitoringStatus === 'completed').length,
          convertedMembers,
          conversionRate
        },
        growth: {
          monthlyGrowth,
          growthTrend: 0,
          trendDirection: 'stable' as const,
          performanceScore
        },
        memberPerformance
      };
    });

    // Church stats
    const churchStats = {
      totalTeams: protocolTeams.length,
      totalVisitors: allVisitors.length,
      totalJoining: allVisitors.filter(v => v.status === 'joining').length,
      totalConversions: allVisitors.filter(v => v.monitoringStatus === 'converted-to-member').length,
      averageConversionRate: teamAnalytics.length > 0 ? 
        Math.round(teamAnalytics.reduce((sum, team) => sum + team.statistics.conversionRate, 0) / teamAnalytics.length) : 0,
      topPerformingTeam: teamAnalytics.length > 0 ? 
        teamAnalytics.reduce((top, current) => current.growth.performanceScore > top.growth.performanceScore ? current : top) : null
    };

    // Team rankings
    const teamRankings = teamAnalytics
      .sort((a, b) => b.growth.performanceScore - a.growth.performanceScore)
      .map((team, index) => ({
        rank: index + 1,
        teamId: team.teamId,
        teamName: team.teamName,
        performanceScore: team.growth.performanceScore,
        totalVisitors: team.statistics.totalVisitors,
        conversionRate: team.statistics.conversionRate,
        growthTrend: team.growth.growthTrend,
        trendDirection: team.growth.trendDirection
      }));

    // Simple church growth
    const churchGrowth = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthVisitors = allVisitors.filter(v => {
        const visitorDate = new Date(v.createdAt);
        return visitorDate >= monthStart && visitorDate <= monthEnd;
      });

      churchGrowth.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        totalVisitors: monthVisitors.length,
        joining: monthVisitors.filter(v => v.status === 'joining').length,
        visiting: monthVisitors.filter(v => v.status === 'visiting').length,
        conversions: monthVisitors.filter(v => v.monitoringStatus === 'converted-to-member').length
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        teamAnalytics,
        churchStats,
        teamRankings,
        churchGrowth,
        insights: {
          fastestGrowingTeam: teamRankings.find(team => team.performanceScore > 70),
          highestConversionTeam: teamRankings[0],
          teamsNeedingAttention: teamRankings.filter(team => team.performanceScore < 50).length,
          totalActiveVisitors: allVisitors.filter(v => v.monitoringStatus === 'active').length
        }
      }
    });
  } catch (error: unknown) {
    console.error('Protocol teams simple analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch protocol teams analytics: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
