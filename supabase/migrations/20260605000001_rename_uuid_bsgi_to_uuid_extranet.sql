-- Migration: Rename uuid_bsgi to uuid_extranet (CONFID-01)
-- Reason: CONFID-01 prohibits any reference to confidential entities in versioned artifacts.
-- The column stores an official validation code issued by an external certificate validation authority.
-- Generic naming keeps the codebase free of commercial target references.

alter table public.certificates
    rename column uuid_bsgi to uuid_extranet;

-- Update the table comment to reflect the generic naming
comment on column public.certificates.uuid_extranet is
    'Unique official validation code issued by the external certificate validation authority';
