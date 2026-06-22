import type { NextRequest } from 'next/server';
import { MediaService } from '@projeto/core';

/**
 * @description GET /api/media/[mediaId] - Retrieves a single media file.
 * @returns JSON of the media file.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ mediaId: string }> }
) {
  try {
    const { mediaId } = await params;
    const media = await MediaService.getMediaById(mediaId);
    return Response.json(media);
  } catch (error) {
    console.error('Error getting media:', error);
    return Response.json(
      { error: 'Media not found' },
      { status: 404 }
    );
  }
}

/**
 * @description DELETE /api/media/[mediaId] - Deletes a media file.
 * Checks if file is in use before deletion.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ mediaId: string }> }
) {
  try {
    const { mediaId } = await params;
    await MediaService.deleteMedia(mediaId);
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting media:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete media';
    return Response.json(
      { error: message },
      { status: 500 }
    );
  }
}
