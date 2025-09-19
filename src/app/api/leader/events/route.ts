import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { User } from '@/lib/models/User';
import { requireSessionAndRoles } from '@/lib/authMiddleware';
import Event from '@/lib/models/Event';

// Create a new event
export async function POST(request: Request) {
  try {
    // 1. Strict Authentication
    const { user } = await requireSessionAndRoles(request, ['leader']);
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, date, location, description } = await request.json();
    await dbConnect();

    // Get the leader's group
    const leader = await User.findById(user.id);
    if (!leader || !leader.group) {
      return NextResponse.json({ 
        error: 'Leader does not have an assigned group' 
      }, { status: 400 });
    }

    // Create the event
    const event = new Event({
      title,
      date: new Date(date),
      location,
      description,
      group: leader.group,
      createdBy: user.id,
      attendance: []
    });

    await event.save();

    return NextResponse.json({
      success: true,
      data: event
    });
  } catch (error: unknown) {
    let errorMsg = 'Unknown error';
    if (error instanceof Error) {
      errorMsg = error.message;
    } else if (typeof error === 'string') {
      errorMsg = error;
    }
    console.error('Event creation error:', error);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

// Get all events for the leader's group
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
      : undefined;
    const endDate = url.searchParams.get('endDate') 
      ? new Date(url.searchParams.get('endDate') as string) 
      : undefined;

    await dbConnect();

    // Get the leader's group
    const leader = await User.findById(user.id);
    if (!leader || !leader.group) {
      return NextResponse.json({ 
        error: 'Leader does not have an assigned group' 
      }, { status: 400 });
    }

    // Build query
    const query: any = { group: leader.group };
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = startDate;
      if (endDate) query.date.$lte = endDate;
    }

    // Find all events for the leader's group
    const events = await Event.find(query)
      .sort({ date: -1 })
      .populate('createdBy', 'name email');

    return NextResponse.json({
      success: true,
      data: events
    });
  } catch (error: unknown) {
    let errorMsg = 'Unknown error';
    if (error instanceof Error) {
      errorMsg = error.message;
    } else if (typeof error === 'string') {
      errorMsg = error;
    }
    console.error('Events retrieval error:', error);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}