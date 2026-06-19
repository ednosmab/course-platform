import { NextRequest } from 'next/server';
import { StudentService } from '@projeto/core';

/**
 * @description GET /api/students/[studentId]/progress - Gets progress summary for a student.
 * @returns JSON array of progress records with course/lesson info.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const { studentId } = await params;
    const progress = await StudentService.getStudentProgress(studentId);
    return Response.json(progress);
  } catch (error) {
    console.error('Error getting student progress:', error);
    return Response.json(
      { error: 'Failed to get student progress' },
      { status: 500 }
    );
  }
}
