<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:certificate-editor-boundary -->
# Boundary Rule: Certificate Editor vs Course Editor (SDR-001)

The certificate editor and the course/lesson editor are **physically isolated** at the
routing and entry-point level. The shared code path is the renderer only.

## Forbidden Cross-Boundary Coupling

| Forbidden | Use instead |
|-----------|-------------|
| Adding `mode === 'certificate'` branches to `EditorCanvas.tsx`, `BlockSettings.tsx`, or `EditorHeader.tsx` | New component in `apps/admin/src/components/certificate-editor/` |
| Importing `BlockContent` (the inline lesson renderer) for certificate blocks | Use `CertificateBlockRenderer` from `@projeto/ui` |
| Linking to `/studio/[id]?mode=certificate` (legacy URL) | Link to `/studio/[id]/certificate` |
| Adding `EditorCanvas` to the certificate route | Use `<CertificateEditor>` from `apps/admin/src/components/certificate-editor/CertificateEditor` |

## Authoritative Routes

| Route | Purpose | Component |
|-------|---------|-----------|
| `/studio/[courseId]` | Lesson editor (driven by `?lessonId=`) | `StudioPage` (this app) |
| `/studio/[courseId]/certificate` | Certificate editor (always `mode: 'certificate'`) | `CertificateEditor` (in `apps/admin/src/components/certificate-editor/`) |

The legacy query `?mode=certificate` is **redirected (HTTP 308)** to the dedicated
route by `apps/admin/next.config.ts`. The redirect happens on the edge, before React
hydrates.

## Why this rule exists

In May 2025, a refactor of the lesson `PreviewCanvas` (`ed231f7`) silently removed
the duplex (front/back) rendering of the certificate preview. Four subsequent commits
(`cc1a903`, `a12ec7c`, `98a166e`, `6b8ea7a`) tweaked the preview without noticing the
cert regression. The cause was a single `mode` prop in a 1453-line `EditorCanvas.tsx`
that handled four different modes via `if (isCertMode) { ... }` branches. See
`docs/sdr/SDR-001-certificate-editor-isolation.md` for the full post-mortem.
<!-- END:certificate-editor-boundary -->
