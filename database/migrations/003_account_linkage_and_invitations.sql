-- FP Conecta v2: vinculación segura cuenta-alumno e invitaciones.
-- Esta migración añade estructuras; NO concede acceso a datos ni activa el flujo de
-- activación de la API. RLS se habilita sin políticas para mantener denegación por defecto.
-- Revisar en entorno aislado con datos ficticios antes de aplicarla. No ejecutar en producción.

BEGIN;

CREATE TABLE IF NOT EXISTS public.student_account_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE RESTRICT,
  user_id UUID NOT NULL REFERENCES public.app_users(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'revoked')),
  linked_by UUID NOT NULL REFERENCES public.app_users(id) ON DELETE RESTRICT,
  linked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_by UUID REFERENCES public.app_users(id) ON DELETE RESTRICT,
  revoked_at TIMESTAMPTZ,
  revocation_reason TEXT,
  CHECK (
    (status = 'active' AND revoked_at IS NULL AND revoked_by IS NULL AND revocation_reason IS NULL)
    OR
    (status = 'revoked' AND revoked_at IS NOT NULL AND revoked_by IS NOT NULL
      AND length(trim(revocation_reason)) > 0)
  )
);

-- Una cuenta solo puede vincularse a un expediente activo y un expediente solo
-- puede tener una cuenta activa. Se conserva el historial revocado.
CREATE UNIQUE INDEX IF NOT EXISTS uq_student_account_links_active_student
  ON public.student_account_links(student_id) WHERE status = 'active';
CREATE UNIQUE INDEX IF NOT EXISTS uq_student_account_links_active_user
  ON public.student_account_links(user_id) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_student_account_links_user_status
  ON public.student_account_links(user_id, status);

CREATE TABLE IF NOT EXISTS public.account_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE RESTRICT,
  recipient_email_normalized TEXT NOT NULL
    CHECK (recipient_email_normalized = lower(trim(recipient_email_normalized))
      AND position('@' IN recipient_email_normalized) > 1),
  token_hash TEXT NOT NULL UNIQUE
    CHECK (token_hash ~ '^[0-9a-f]{64}$'),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'consumed', 'revoked', 'expired')),
  created_by UUID NOT NULL REFERENCES public.app_users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  revoked_by UUID REFERENCES public.app_users(id) ON DELETE RESTRICT,
  revoked_at TIMESTAMPTZ,
  revocation_reason TEXT,
  CHECK (expires_at > created_at),
  CHECK ((status = 'consumed') = (consumed_at IS NOT NULL)),
  CHECK (
    (status = 'revoked' AND revoked_at IS NOT NULL AND revoked_by IS NOT NULL
      AND length(trim(revocation_reason)) > 0)
    OR
    (status <> 'revoked' AND revoked_at IS NULL AND revoked_by IS NULL
      AND revocation_reason IS NULL)
  )
);

-- Solo una invitación pendiente por expediente; las anteriores deben revocarse
-- o expirar antes de emitir una nueva.
CREATE UNIQUE INDEX IF NOT EXISTS uq_account_invitations_pending_student
  ON public.account_invitations(student_id) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_account_invitations_expiry
  ON public.account_invitations(expires_at) WHERE status = 'pending';

-- Denegación por defecto: estas tablas no tienen políticas RLS permisivas.
ALTER TABLE public.student_account_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_invitations ENABLE ROW LEVEL SECURITY;

-- Los eventos de auditoría históricos no se deben alterar desde operaciones normales.
-- Esta protección complementa, pero no sustituye, la separación de privilegios del DB.
CREATE OR REPLACE FUNCTION public.reject_audit_event_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'audit_events_are_append_only';
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_events_no_update_delete ON public.audit_events;
CREATE TRIGGER trg_audit_events_no_update_delete
  BEFORE UPDATE OR DELETE ON public.audit_events
  FOR EACH ROW EXECUTE FUNCTION public.reject_audit_event_mutation();

COMMIT;
