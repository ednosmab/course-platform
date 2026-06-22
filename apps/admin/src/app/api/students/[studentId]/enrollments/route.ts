import type { NextRequest } from 'next/server';
import { StudentService } from '@projeto/core';

/**
 * @description GET /api/students/[studentId]/enrollments - Lists enrollments for a student.
 * @returns JSON array of enrollments.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const { studentId } = await params;
    const enrollments = await StudentService.getEnrollmentsByStudent(studentId);
    return Response.json(enrollments);
  } catch (error) {
    console.error('Error listing enrollments:', error);
    return Response.json(
      { error: 'Failed to list enrollments' },
      { status: 500 }
    );
  }
}

/**
 * @description POST /api/students/[studentId]/enrollments - Enrolls a student.
 * Body: { courseId?, planId?, expiresAt? }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const { studentId } = await params;
    const body = await request.json();
    const { courseId, planId, expiresAt } = body;

    if (courseId) {
      await StudentService.assignToCourse(studentId, courseId, expiresAt);
    } else if (planId) {
      await StudentService.assignToPlan(studentId, planId);
    } else {
      return Response.json(
        { error: 'courseId or planId is required' },
        { status: 400 }
      );
    }

    return Response.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Error enrolling student:', error);
    return Response.json(
      { error: 'Failed to enroll student' },
      { status: 500 }
    );
  }
}

/**
 * @description DELETE /api/students/[studentId]/enrollments - Removes an enrollment.
 * Body: { enrollmentId }
 */
export async function DELETE(
  request: NextRequest
) {
  try {
    const body = await request.json();
    const { enrollmentId } = body;

    if (!enrollmentId) {
      return Response.json(
        { error: 'enrollmentId is required' },
        { status: 400 }
      );
    }

    await StudentService.removeEnrollment(enrollmentId);
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error removing enrollment:', error);
    return Response.json(
      { error: 'Failed to remove enrollment' },
      { status: 500 }
    );
  }
}

/**
 * @description PUT /api/students/[studentId]/enrollments - Updates enrollment status.
 * Body: { enrollmentId, status }
 */
export async function PUT(
  request: NextRequest
) {
  try {
    const body = await request.json();
    const { enrollmentId, status } = body;

    if (!enrollmentId || !status) {
      return Response.json(
        { error: 'enrollmentId and status are required' },
        { status: 400 }
      );
    }

    await StudentService.updateEnrollmentStatus(enrollmentId, status);
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error updating enrollment:', error);
    return Response.json(
      { error: 'Failed to update enrollment' },
      { status: 500 }
    );
  }
}
