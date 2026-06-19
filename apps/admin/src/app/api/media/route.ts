import { NextRequest } from 'next/server';
import { MediaService, AuthService } from '@projeto/core';

/**
 * @description GET /api/media - Lists all media files with optional filters.
 * Query params: type, courseId, search.
 * @returns JSON array of media files.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') ?? undefined;
    const courseId = searchParams.get('courseId') ?? undefined;
    const search = searchParams.get('search') ?? undefined;

    const media = await MediaService.listMedia({
      type,
      courseId,
      search,
    });

    return Response.json(media);
  } catch (error) {
    console.error('Error listing media:', error);
    return Response.json(
      { error: 'Failed to list media' },
      { status: 500 }
    );
  }
}

/**
 * @description POST /api/media - Uploads a new media file.
 * Body: FormData with file and optional courseId.
 * @returns JSON of the created media file.
 */
export async function POST(request: NextRequest) {
  try {
    const rawFormData: any = await request.formData();
    const file = rawFormData.get('file') as File | null;
    const courseId = rawFormData.get('courseId') as string | null;

    if (!file) {
      return Response.json(
        { error: 'File is required' },
        { status: 400 }
      );
    }

    // Validate file size (100MB max)
    const MAX_SIZE = 100 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return Response.json(
        { error: 'File size exceeds 100MB limit' },
        { status: 400 }
      );
    }

    // Validate MIME type
    const ALLOWED_TYPES = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      'video/mp4', 'video/webm', 'video/ogg',
      'application/pdf',
    ];
    if (!ALLOWED_TYPES.includes(file.type)) {
      return Response.json(
        { error: 'File type not allowed' },
        { status: 400 }
      );
    }

    // Get current user
    const profile = await AuthService.getCurrentProfile();
    if (!profile) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const media = await MediaService.uploadMedia(
      file,
      profile.id,
      courseId ?? undefined
    );

    return Response.json(media, { status: 201 });
  } catch (error) {
    console.error('Error uploading media:', error);
    return Response.json(
      { error: 'Failed to upload media' },
      { status: 500 }
    );
  }
}
