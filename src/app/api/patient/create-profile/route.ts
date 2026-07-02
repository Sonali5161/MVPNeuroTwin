/**
 * Create Patient Medical Profile
 * Creates a patient medical record linked to user account
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, age, sex } = body;

    if (!userId || !name) {
      return NextResponse.json(
        { error: 'Missing required fields: userId and name are required' },
        { status: 400 }
      );
    }

    if (!age || !sex) {
      return NextResponse.json(
        { error: 'Age and gender are required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Generate patient ID
    const patientCount = await prisma.patient.count();
    const patientId = `PT-${String(patientCount + 1).padStart(3, '0')}`;

    // Create patient profile with provided values
    const patient = await prisma.patient.create({
      data: {
        patientId,
        name,
        age,
        sex,
        mriScore: 85.0, // Default healthy values
        geneticRisk: 0.2,
        amyloidBeta: 100.0,
        tau: 20.0,
        nfL: 15.0,
        cognitiveScore: 28,
        brainAge: age, // Brain age defaults to actual age
        sleepQuality: 75.0,
        activityLevel: 70.0,
        speechScore: 90.0,
        clinicalNotes: 'Newly registered patient. Initial assessment pending.',
        createdById: userId,
      },
    });

    return NextResponse.json({
      success: true,
      patient,
    });
  } catch (error) {
    console.error('Create patient profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Get patient profile for this user
    const patient = await prisma.patient.findFirst({
      where: { createdById: userId },
    });

    if (!patient) {
      return NextResponse.json(
        { error: 'No patient profile found', needsProfile: true },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      patient,
    });
  } catch (error) {
    console.error('Get patient profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
