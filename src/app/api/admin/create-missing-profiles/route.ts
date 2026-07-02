/**
 * Admin endpoint to create patient profiles for existing users who don't have one
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Get all users with role 'patient'
    const patientUsers = await prisma.user.findMany({
      where: { role: 'patient' },
    });

    const results = [];

    for (const user of patientUsers) {
      // Check if patient profile already exists
      const existingProfile = await prisma.patient.findFirst({
        where: { createdById: user.id },
      });

      if (!existingProfile) {
        // Create patient profile
        const patientCount = await prisma.patient.count();
        const patientId = `PT-${String(patientCount + 1).padStart(3, '0')}`;

        const newProfile = await prisma.patient.create({
          data: {
            patientId,
            name: user.name,
            age: 65, // Default age
            sex: 'Female', // Default
            mriScore: 85.0,
            geneticRisk: 0.2,
            amyloidBeta: 100.0,
            tau: 20.0,
            nfL: 15.0,
            cognitiveScore: 28,
            brainAge: 65,
            sleepQuality: 75.0,
            activityLevel: 70.0,
            speechScore: 90.0,
            clinicalNotes: `Profile auto-created for ${user.name}. Initial assessment pending.`,
            createdById: user.id,
          },
        });

        results.push({
          userId: user.id,
          userName: user.name,
          patientId: newProfile.patientId,
          status: 'created',
        });
      } else {
        results.push({
          userId: user.id,
          userName: user.name,
          patientId: existingProfile.patientId,
          status: 'already exists',
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Patient profiles processed',
      results,
    });
  } catch (error) {
    console.error('Create missing profiles error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
