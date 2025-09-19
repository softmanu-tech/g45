import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { User } from '@/lib/models/User';
import { Group } from '@/lib/models/Group';
import { requireSessionAndRoles } from '@/lib/authMiddleware';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        // 1. Strict Authentication
        const { user } = await requireSessionAndRoles(request, ['leader']);
        if (!user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { name, email, phone } = await request.json();
        await dbConnect();

        // Get the leader's group
        const leader = await User.findById(user.id);
        if (!leader || !leader.group) {
            return NextResponse.json({ 
                error: 'Leader does not have an assigned group' 
            }, { status: 400 });
        }

        // Generate a random password for the member
        const password = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the member with the leader's group
        const member = new User({
            name,
            email,
            phone,
            password: hashedPassword,
            role: 'member',
            group: leader.group
        });

        await member.save();

        // Add the member to the group's members array
        await Group.findByIdAndUpdate(
            leader.group,
            { $push: { members: member._id } }
        );

        return NextResponse.json({
            success: true,
            data: {
                member: {
                    _id: member._id,
                    name: member.name,
                    email: member.email,
                    group: leader.group
                },
                password // Only returned for demo, in production don't return this
            }
        });
    } catch (error: unknown) {
        let errorMsg = 'Unknown error';
        if (error instanceof Error) {
            errorMsg = error.message;
        } else if (typeof error === 'string') {
            errorMsg = error;
        }
        console.error('Member creation error:', error);
        return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
    }
}

// Get members for the leader's group
export async function GET(request: Request) {
    try {
        // 1. Strict Authentication
        const { user } = await requireSessionAndRoles(request, ['leader']);
        if (!user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // Get the leader's group
        const leader = await User.findById(user.id);
        if (!leader || !leader.group) {
            return NextResponse.json({ 
                error: 'Leader does not have an assigned group' 
            }, { status: 400 });
        }

        // Find all members in the leader's group
        const members = await User.find({ 
            group: leader.group,
            role: 'member'
        }).select('name email phone');

        return NextResponse.json({ success: true, members });
    } catch (error) {
        return NextResponse.json({ success: false, error }, { status: 500 });
    }
}