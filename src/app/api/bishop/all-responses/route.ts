import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { User } from '@/lib/models/User';
import Event from '@/lib/models/Event';
import { requireSessionAndRoles } from '@/lib/authMiddleware';
import mongoose from 'mongoose';

// Event Response Schema (matching the one in member/event-response/route.ts)
const EventResponseSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  willAttend: { type: Boolean, required: true },
  reason: { type: String }, // Reason for not attending
  responseDate: { type: Date, default: Date.now }
}, { timestamps: true });

const EventResponse = mongoose.models.EventResponse || 
  mongoose.model('EventResponse', EventResponseSchema);

export async function GET(request: Request) {
  try {
    // Strict Authentication - Only bishops can see all responses
    const { user } = await requireSessionAndRoles(request, ['bishop']);
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Get query parameters
    const url = new URL(request.url);
    const days = parseInt(url.searchParams.get('days') || '30'); // Default last 30 days
    const responseType = url.searchParams.get('type'); // 'attending', 'not-attending', or all

    // Date filter for recent responses
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Build response filter
    let responseFilter: any = {
      responseDate: { $gte: startDate }
    };

    if (responseType === 'attending') {
      responseFilter.willAttend = true;
    } else if (responseType === 'not-attending') {
      responseFilter.willAttend = false;
    }

    // Get all responses with full details
    const responses = await EventResponse.find(responseFilter)
      .populate({
        path: 'member',
        select: 'name email phone residence department group',
        populate: {
          path: 'group',
          select: 'name leader',
          populate: {
            path: 'leader',
            select: 'name email'
          }
        }
      })
      .populate({
        path: 'event',
        select: 'title date location group',
        populate: {
          path: 'group',
          select: 'name'
        }
      })
      .sort({ responseDate: -1 })
      .limit(100); // Limit to latest 100 responses

    // Separate responses by type
    const attending = responses.filter(r => r.willAttend);
    const notAttending = responses.filter(r => !r.willAttend);

    // Get summary statistics
    const totalResponses = responses.length;
    const attendingCount = attending.length;
    const notAttendingCount = notAttending.length;
    const responseRate = totalResponses > 0 ? Math.round((attendingCount / totalResponses) * 100) : 0;

    // Group responses by event for better organization
    const responsesByEvent = responses.reduce((acc, response) => {
      const eventId = response.event._id.toString();
      if (!acc[eventId]) {
        acc[eventId] = {
          event: response.event,
          responses: []
        };
      }
      acc[eventId].responses.push(response);
      return acc;
    }, {} as any);

    // Get recent events with their response counts
    const recentEvents = await Event.find({
      date: { $gte: startDate }
    })
    .populate('group', 'name')
    .populate('createdBy', 'name email')
    .sort({ date: -1 })
    .limit(20);

    const eventsWithResponses = await Promise.all(recentEvents.map(async (event) => {
      const eventResponses = await EventResponse.find({ event: event._id });
      const attending = eventResponses.filter(r => r.willAttend).length;
      const notAttending = eventResponses.filter(r => !r.willAttend).length;
      
      return {
        _id: event._id,
        title: event.title,
        date: event.date,
        location: event.location,
        group: event.group,
        createdBy: event.createdBy,
        responses: {
          attending,
          notAttending,
          total: attending + notAttending
        }
      };
    }));

    // Get all members from Member and User models
    const { Member } = require('@/lib/models/Member');
    const members = await Member.find({}).populate('group', 'name').exec();
    const userMembers = await User.find({ role: 'member' }).populate('group', 'name').exec();

    // Members who haven't responded to recent events
    const allMembers = [...members, ...userMembers];
    const recentEventIds = recentEvents.map(e => e._id.toString());
    const membersWithoutResponses = await Promise.all(allMembers.map(async (member) => {
      const memberResponses = await EventResponse.find({ 
        member: member._id,
        event: { $in: recentEventIds }
      });
      
      const respondedEventIds = memberResponses.map(r => r.event.toString());
      const unrespondedEvents = recentEvents.filter(event => 
        !respondedEventIds.includes(event._id.toString())
      );

      return {
        member: {
          _id: member._id,
          name: member.name,
          email: member.email,
          group: member.group
        },
        unrespondedEvents: unrespondedEvents.length,
        unrespondedEventsList: unrespondedEvents.slice(0, 3) // Show first 3
      };
    }));

    const needsFollowUp = membersWithoutResponses
      .filter(m => m.unrespondedEvents > 0)
      .sort((a, b) => b.unrespondedEvents - a.unrespondedEvents)
      .slice(0, 10);

    return NextResponse.json({
      success: true,
      data: {
        responses: {
          attending: attending.map(r => ({
            _id: r._id,
            member: r.member,
            event: r.event,
            responseDate: r.responseDate
          })),
          notAttending: notAttending.map(r => ({
            _id: r._id,
            member: r.member,
            event: r.event,
            reason: r.reason,
            responseDate: r.responseDate
          }))
        },
        summary: {
          totalResponses,
          attendingCount,
          notAttendingCount,
          responseRate,
          daysAnalyzed: days
        },
        responsesByEvent: Object.values(responsesByEvent),
        eventsWithResponses,
        needsFollowUp: needsFollowUp.slice(0, 10),
        insights: {
          mostActiveEvent: eventsWithResponses.reduce((max, event) => 
            event.responses.total > (max?.responses?.total || 0) ? event : max, 
            eventsWithResponses[0]
          ),
          mostApologies: eventsWithResponses.reduce((max, event) => 
            event.responses.notAttending > (max?.responses?.notAttending || 0) ? event : max,
            eventsWithResponses[0]
          ),
          averageResponseRate: eventsWithResponses.length > 0 
            ? Math.round(eventsWithResponses.reduce((sum, event) => {
                const total = event.responses.total;
                return sum + (total > 0 ? (event.responses.attending / total) * 100 : 0);
              }, 0) / eventsWithResponses.length)
            : 0
        }
      }
    });
  } catch (error: unknown) {
    let errorMsg = 'Unknown error';
    if (error instanceof Error) {
      errorMsg = error.message;
    }
    console.error('Bishop all responses fetch error:', error);
    return NextResponse.json(
      { error: `Failed to fetch responses data: ${errorMsg}` },
      { status: 500 }
    );
  }
}
