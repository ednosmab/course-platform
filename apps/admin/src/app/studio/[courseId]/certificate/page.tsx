'use client';

import React, { use } from 'react';
import { CertificateEditor } from '../../../../components/certificate-editor/CertificateEditor';

/**
 * Rota dedicada ao editor de certificado (SDR-001).
 *
 * Substitui a antiga convenção `?mode=certificate` na rota
 * `/studio/[courseId]/page.tsx`. A URL antiga é preservada por
 * redirect 308 no ficheiro `page.tsx` original, garantindo que
 * links existentes (configurações, deep links) continuam a
 * funcionar.
 */
export default function CertificateStudioPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  return <CertificateEditor courseId={courseId} />;
}
