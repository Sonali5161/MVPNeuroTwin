/**
 * ML Prediction API Route
 * Proxies requests to the Python ML inference server
 */

import { NextRequest, NextResponse } from 'next/server';

const ML_API_URL = process.env.ML_API_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { modelType, patientData } = body;

    if (!modelType || !patientData) {
      return NextResponse.json(
        { error: 'Missing required fields: modelType and patientData' },
        { status: 400 }
      );
    }

    // Map model types to API endpoints
    const endpointMap: Record<string, string> = {
      conversion: '/predict/conversion',
      tte: '/predict/time-to-event',
      burden: '/predict/caregiver-burden',
    };

    const endpoint = endpointMap[modelType];
    if (!endpoint) {
      return NextResponse.json(
        { error: `Invalid model type: ${modelType}` },
        { status: 400 }
      );
    }

    // Transform patient data to ML API format
    const mlFeatures = {
      age: patientData.age,
      sex: patientData.sex === 'Male' ? 1 : 0,
      mri_score: patientData.mriScore,
      genetic_risk: patientData.geneticRisk,
      amyloid_beta: patientData.bloodBiomarkers?.amyloid || 0,
      tau: patientData.bloodBiomarkers?.tau || 0,
      nfl: patientData.bloodBiomarkers?.nfL || 0,
      cognitive_score: patientData.cognitiveScore,
      sleep_quality: patientData.sleepQuality,
      activity_level: patientData.activityLevel,
      additional_features: [],
    };

    // Call ML API
    const response = await fetch(`${ML_API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mlFeatures),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.detail || 'ML API request failed' },
        { status: response.status }
      );
    }

    const prediction = await response.json();
    return NextResponse.json(prediction);
  } catch (error) {
    console.error('ML API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Health check or get available models
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');

    if (action === 'health') {
      const response = await fetch(`${ML_API_URL}/health`);
      const data = await response.json();
      return NextResponse.json(data);
    }

    if (action === 'models') {
      const response = await fetch(`${ML_API_URL}/models`);
      const data = await response.json();
      return NextResponse.json(data);
    }

    return NextResponse.json({
      message: 'ML Prediction API',
      endpoints: {
        POST: '/api/ml/predict - Make predictions',
        GET: '/api/ml/predict?action=health - Check ML API health',
        GET: '/api/ml/predict?action=models - List available models',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'ML API unavailable', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 503 }
    );
  }
}
