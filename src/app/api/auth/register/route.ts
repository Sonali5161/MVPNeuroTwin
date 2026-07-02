/**
 * Patient Registration API
 * Handles new user registration with database persistence
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

// Hash password (in production, use bcrypt)
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, role, organization, hipaaConsent, age, sex } = body;

    // Validation
    if (!name || !email || !password || !role || !organization) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!hipaaConsent) {
      return NextResponse.json(
        { error: 'HIPAA consent is required' },
        { status: 400 }
      );
    }

    // Validate age and sex for patient role
    if (role === 'patient') {
      if (!age || !sex) {
        return NextResponse.json(
          { error: 'Age and gender are required for patient registration' },
          { status: 400 }
        );
      }
      if (age < 1 || age > 120) {
        return NextResponse.json(
          { error: 'Please enter a valid age between 1 and 120' },
          { status: 400 }
        );
      }
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Create new user
    const hashedPassword = hashPassword(password);
    
    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name,
        password: hashedPassword,
        role,
        organization,
        hipaaConsent,
        twoFactorEnabled: false,
        lastLogin: new Date(),
      },
    });

    // If role is 'patient', create a patient medical profile automatically
    let patientProfile = null;
    if (role === 'patient') {
      const patientCount = await prisma.patient.count();
      const patientId = `PT-${String(patientCount + 1).padStart(3, '0')}`;
      
      // Use provided age and sex from registration form
      const patientAge = age || 65;
      const patientSex = sex || 'Female';
      
      patientProfile = await prisma.patient.create({
        data: {
          patientId,
          name: newUser.name,
          age: patientAge,
          sex: patientSex,
          mriScore: 85.0,
          geneticRisk: 0.2,
          amyloidBeta: 100.0,
          tau: 20.0,
          nfL: 15.0,
          cognitiveScore: 28,
          brainAge: patientAge, // Brain age defaults to actual age
          sleepQuality: 75.0,
          activityLevel: 70.0,
          speechScore: 90.0,
          clinicalNotes: 'Newly registered patient. Initial assessment pending.',
          createdById: newUser.id,
        },
      });
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: newUser.id,
        userName: newUser.name,
        userRole: newUser.role,
        action: 'REGISTER',
        resource: 'Account Creation',
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        status: 'success',
        details: `New ${newUser.role} account created`,
      },
    });

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      patientProfile,
      message: 'Account created successfully',
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
