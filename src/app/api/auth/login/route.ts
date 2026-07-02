/**
 * Patient Login API
 * Handles user authentication with database
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Demo accounts (for quick testing)
    const demoAccounts = [
      {
        id: 'DEMO-001',
        email: 'dr.smith@neuroresearch.org',
        name: 'Dr. Sarah Mitchell',
        role: 'researcher',
        organization: 'National Institute on Aging',
        password: 'researcher123',
        hipaaConsent: true,
        twoFactorEnabled: true,
        lastLogin: new Date(),
      },
      {
        id: 'DEMO-002',
        email: 'dr.chen@memoryclinic.com',
        name: 'Dr. James Chen',
        role: 'clinician',
        organization: 'Mayo Clinic Neurology',
        password: 'clinician123',
        hipaaConsent: true,
        twoFactorEnabled: true,
        lastLogin: new Date(),
      },
      {
        id: 'DEMO-003',
        email: 'eleanor.m@email.com',
        name: 'Eleanor Mitchell',
        role: 'patient',
        organization: 'Self-enrolled',
        password: 'patient123',
        hipaaConsent: true,
        twoFactorEnabled: false,
        lastLogin: new Date(),
      },
    ];

    // Check demo accounts first
    const demoUser = demoAccounts.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (demoUser) {
      const { password: _, ...userWithoutPassword } = demoUser;
      return NextResponse.json({
        success: true,
        user: userWithoutPassword,
      });
    }

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const hashedPassword = hashPassword(password);
    if (user.password !== hashedPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action: 'LOGIN',
        resource: 'Authentication',
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        status: 'success',
        details: `Successful login for ${user.role} role`,
      },
    });

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
