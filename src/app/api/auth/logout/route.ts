import { NextResponse } from 'next/server';
import { connectToDB, Session } from '@/lib/db';

export async function POST(request: Request) {
  try {
    await connectToDB();
    const { employeeId } = await request.json();
    
    if (!employeeId) {
      return NextResponse.json({ 
        error: 'Employee ID is required' 
      }, { status: 400 });
    }
    
    // Find and deactivate session
    const session = await Session.findOneAndUpdate(
      { employeeId, isActive: true },
      { 
        isActive: false,
        logoutTime: new Date()
      },
      { new: true }
    );
    
    if (!session) {
      return NextResponse.json({ 
        error: 'No active session found' 
      }, { status: 404 });
    }
    
    return NextResponse.json({
      message: 'Logout successful',
      session
    });
    
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
