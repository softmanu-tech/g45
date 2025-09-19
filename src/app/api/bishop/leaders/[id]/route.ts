import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { User } from '@/lib/models/User';
import bcrypt from 'bcrypt';

// ✏️ UPDATE a leaders
export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        const { name, email, group, password } = await req.json();
        await dbConnect();

        const updateData: any = { name, email, group };

        // Only update password if provided
        if (password && password.trim()) {
            const hashedPassword = await bcrypt.hash(password.trim(), 10);
            updateData.password = hashedPassword;
        }

        const updatedLeader = await User.findByIdAndUpdate(
            params.id,
            updateData,
            { new: true }
        );

        return NextResponse.json({ success: true, leader: updatedLeader });
    } catch (error) {
        console.log(error)
        return NextResponse.json({ success: false, error}, { status: 500 });
    }
}

// DELETE a leaders
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
    try {
        await dbConnect();
        await User.findByIdAndDelete(params.id);
        return NextResponse.json({ success: true, message: 'Leader deleted' });
    } catch (error) {
        console.log(error)
        return NextResponse.json({ success: false, error }, { status: 500 });
    }
}
