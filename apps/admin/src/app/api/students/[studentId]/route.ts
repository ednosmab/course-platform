import type { NextRequest } from 'next/server';
import { StudentService } from '@projeto/core';

/**
 * @description GET /api/students/[studentId] - Retrieves a single student.
 * @returns JSON of the student.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const { studentId } = await params;
    const student = await StudentService.getStudentById(studentId);
    return Response.json(student);
  } catch (error) {
    console.error('Error getting student:', error);
    return Response.json(
      { error: 'Student not found' },
      { status: 404 }
    );
  }
}

/**
 * @description PUT /api/students/[studentId] - Updates a student.
 * Body: { email?, full_name?, role? }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const { studentId } = await params;
    const body = await request.json();

    await StudentService.updateStudent(studentId, body);
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error updating student:', error);
    return Response.json(
      { error: 'Failed to update student' },
      { status: 500 }
    );
  }
}

/**
 * @description DELETE /api/students/[studentId] - Deletes a student.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const { studentId } = await params;
    await StudentService.deleteStudent(studentId);
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting student:', error);
    return Response.json(
      { error: 'Failed to delete student' },
      { status: 500 }
    );
  }
}
