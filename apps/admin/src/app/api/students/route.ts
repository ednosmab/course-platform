import { NextRequest } from 'next/server';
import { StudentService } from '@projeto/core';

/**
 * @description GET /api/students - Lists all students with optional filters.
 * Query params: search, status, courseId, planId.
 * @returns JSON array of students with enrollment counts.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') ?? undefined;
    const status = searchParams.get('status') ?? undefined;
    const courseId = searchParams.get('courseId') ?? undefined;
    const planId = searchParams.get('planId') ?? undefined;

    const students = await StudentService.listStudents({
      search,
      status,
      courseId,
      planId,
    });

    return Response.json(students);
  } catch (error) {
    console.error('Error listing students:', error);
    return Response.json(
      { error: 'Failed to list students' },
      { status: 500 }
    );
  }
}

/**
 * @description POST /api/students - Creates a new student.
 * Body: { email, full_name, role? }
 * @returns JSON of the created student.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, full_name, role } = body;

    if (!email || !full_name) {
      return Response.json(
        { error: 'Email and full_name are required' },
        { status: 400 }
      );
    }

    const student = await StudentService.createStudent({
      email,
      full_name,
      role,
    });

    return Response.json(student, { status: 201 });
  } catch (error) {
    console.error('Error creating student:', error);
    return Response.json(
      { error: 'Failed to create student' },
      { status: 500 }
    );
  }
}
