import { NextResponse } from 'next/server';
import { connectToDB, User, Session } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { headers } from 'next/headers';

export async function POST(request: Request) {
  try {
    await connectToDB();
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({
        error: 'Email and password are required'
      }, { status: 400 });
    }

    // Find user by email
    const user = await User.findOne({ email, isActive: true });
    if (!user) {
      return NextResponse.json({
        error: 'Invalid email or password'
      }, { status: 401 });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json({
        error: 'Invalid email or password'
      }, { status: 401 });
    }

    // Get client info
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || '';
    const forwarded = headersList.get('x-forwarded-for');
    const ipAddress = forwarded ? forwarded.split(',')[0] : 'unknown';

    // Create or update session
    const existingSession = await Session.findOne({
      userId: user._id,
      isActive: true
    });

    if (existingSession) {
      // Update existing session
      existingSession.lastActivity = new Date();
      existingSession.userAgent = userAgent;
      existingSession.ipAddress = ipAddress;
      await existingSession.save();
    } else {
      // Create new session
      await Session.create({
        userId: user._id,
        employeeId: user.employeeId,
        loginTime: new Date(),
        isActive: true,
        lastActivity: new Date(),
        userAgent,
        ipAddress
      });
    }

    // Update user's last login
    user.lastLogin = new Date();
    await user.save();

    // Return user data (without password)
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId,
      site: user.site,
      allocatedSites: user.allocatedSites,
      currentStatus: user.currentStatus,
      lastLogin: user.lastLogin
    };

    return NextResponse.json({
      message: 'Login successful',
      user: userData
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 });
  }
}
