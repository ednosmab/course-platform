-- Migration: Rename index certificates_uuid_bsgi_key to certificates_uuid_extranet_key (CONFID-01)
-- Reason: Post-revision of certificates.uuid_bsgi -> uuid_extranet. PostgreSQL automatically
-- updated the column reference inside the unique index but did not rename the index name itself.
-- This migration completes the rename for naming consistency with CONFID-01.

alter index public.certificates_uuid_bsgi_key
    rename to certificates_uuid_extranet_key;
