import { useState, useEffect } from 'react';
import { CourseService, AuthService } from '@projeto/core';

interface CourseAccessResult {
  hasAccess: boolean;
  reason: string;
  loading: boolean;
}

export function useCourseAccess(courseId: string | null): CourseAccessResult {
  const [hasAccess, setHasAccess] = useState(true);
  const [reason, setReason] = useState('unknown');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!courseId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const checkAccess = async () => {
      try {
        setLoading(true);
        const profile = await AuthService.getCurrentProfile();
        if (!profile?.id) {
          if (!cancelled) {
            setHasAccess(false);
            setReason('not_authenticated');
          }
          return;
        }

        const result = await CourseService.getStudentCourseAccess(profile.id, courseId);
        if (!cancelled) {
          setHasAccess(result.hasAccess);
          setReason(result.reason);
        }
      } catch {
        if (!cancelled) {
          setHasAccess(false);
          setReason('error');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    checkAccess();

    return () => {
      cancelled = true;
    };
  }, [courseId]);

  return { hasAccess, reason, loading };
}
