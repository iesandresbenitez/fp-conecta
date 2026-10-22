-- FP Conecta v2: esquema inicial PostgreSQL.
-- Diseño de partida: revisar con el equipo técnico y el DPD antes de producción.
-- No insertar datos reales en entornos de desarrollo o pruebas.

BEGIN;

CREATE TABLE IF NOT EXISTS app_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identity_subject TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  email TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'active', 'suspended', 'disabled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  family TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin_fp', 'tutor', 'company_user')),
  cycle_id UUID REFERENCES cycles(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK ((role = 'tutor' AND cycle_id IS NOT NULL) OR (role <> 'tutor' AND cycle_id IS NULL)),
  UNIQUE (user_id, role, cycle_id)
);

CREATE TABLE IF NOT EXISTS academic_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  modality TEXT NOT NULL CHECK (modality IN ('FCT', 'DUAL', 'INTERNSHIP', 'OTHER')),
  starts_on DATE NOT NULL,
  ends_on DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'closed', 'archived')),
  CHECK (ends_on >= starts_on),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  internal_ref TEXT NOT NULL UNIQUE,
  cycle_id UUID NOT NULL REFERENCES cycles(id) ON DELETE RESTRICT,
  academic_period_id UUID NOT NULL REFERENCES academic_periods(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'eligible', 'placed', 'withdrawn', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS competencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS student_competencies (
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  competency_id UUID NOT NULL REFERENCES competencies(id) ON DELETE RESTRICT,
  evidence_status TEXT NOT NULL DEFAULT 'unverified'
    CHECK (evidence_status IN ('unverified', 'reported', 'verified')),
  verified_by UUID REFERENCES app_users(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  PRIMARY KEY (student_id, competency_id)
);

CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legal_name TEXT NOT NULL,
  tax_identifier TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'validated', 'suspended', 'rejected')),
  website TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS company_members (
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  membership_role TEXT NOT NULL DEFAULT 'representative'
    CHECK (membership_role IN ('representative', 'manager')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (company_id, user_id)
);

CREATE TABLE IF NOT EXISTS agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
  reference_code TEXT,
  modality TEXT NOT NULL CHECK (modality IN ('FCT', 'DUAL', 'INTERNSHIP', 'OTHER')),
  valid_from DATE NOT NULL,
  valid_until DATE,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'pending_review', 'active', 'expired', 'terminated')),
  document_storage_key TEXT,
  created_by UUID REFERENCES app_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (valid_until IS NULL OR valid_until >= valid_from)
);

CREATE TABLE IF NOT EXISTS placements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
  cycle_id UUID NOT NULL REFERENCES cycles(id) ON DELETE RESTRICT,
  academic_period_id UUID NOT NULL REFERENCES academic_periods(id) ON DELETE RESTRICT,
  agreement_id UUID REFERENCES agreements(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  description TEXT,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  starts_on DATE NOT NULL,
  ends_on DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'pending_validation', 'available', 'filled', 'closed', 'cancelled')),
  created_by UUID REFERENCES app_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (ends_on >= starts_on)
);

CREATE TABLE IF NOT EXISTS placement_competencies (
  placement_id UUID NOT NULL REFERENCES placements(id) ON DELETE CASCADE,
  competency_id UUID NOT NULL REFERENCES competencies(id) ON DELETE RESTRICT,
  required BOOLEAN NOT NULL DEFAULT TRUE,
  weight NUMERIC(5,2) NOT NULL DEFAULT 1 CHECK (weight >= 0),
  PRIMARY KEY (placement_id, competency_id)
);

CREATE TABLE IF NOT EXISTS match_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_period_id UUID NOT NULL REFERENCES academic_periods(id) ON DELETE RESTRICT,
  rule_version TEXT NOT NULL,
  initiated_by UUID REFERENCES app_users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'completed'
    CHECK (status IN ('queued', 'running', 'completed', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  CHECK (completed_at IS NULL OR completed_at >= created_at)
);

CREATE TABLE IF NOT EXISTS match_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_run_id UUID NOT NULL REFERENCES match_runs(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE RESTRICT,
  placement_id UUID NOT NULL REFERENCES placements(id) ON DELETE RESTRICT,
  score NUMERIC(5,2) CHECK (score >= 0 AND score <= 100),
  explanation JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending_review'
    CHECK (status IN ('pending_review', 'accepted', 'rejected', 'superseded')),
  reviewed_by UUID REFERENCES app_users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  review_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (match_run_id, student_id, placement_id)
);

CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE RESTRICT,
  placement_id UUID NOT NULL REFERENCES placements(id) ON DELETE RESTRICT,
  academic_period_id UUID NOT NULL REFERENCES academic_periods(id) ON DELETE RESTRICT,
  tutor_id UUID NOT NULL REFERENCES app_users(id) ON DELETE RESTRICT,
  suggestion_id UUID REFERENCES match_suggestions(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'confirmed'
    CHECK (status IN ('confirmed', 'in_progress', 'completed', 'cancelled')),
  confirmed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  decision_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (ended_at IS NULL OR ended_at >= confirmed_at)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_student_active_assignment_period
  ON assignments(student_id, academic_period_id)
  WHERE status IN ('confirmed', 'in_progress');

CREATE TABLE IF NOT EXISTS assignment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE RESTRICT,
  actor_user_id UUID REFERENCES app_users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  previous_status TEXT,
  new_status TEXT,
  reason TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS privacy_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  purpose_code TEXT NOT NULL,
  legal_basis TEXT NOT NULL,
  notice_version TEXT,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  withdrawn_at TIMESTAMPTZ,
  recorded_by UUID REFERENCES app_users(id) ON DELETE SET NULL,
  notes TEXT,
  CHECK (withdrawn_at IS NULL OR withdrawn_at >= recorded_at)
);

CREATE TABLE IF NOT EXISTS audit_events (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor_user_id UUID REFERENCES app_users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  outcome TEXT NOT NULL CHECK (outcome IN ('success', 'denied', 'failure')),
  request_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_students_cycle_period ON students(cycle_id, academic_period_id);
CREATE INDEX IF NOT EXISTS idx_placements_cycle_period_status ON placements(cycle_id, academic_period_id, status);
CREATE INDEX IF NOT EXISTS idx_placements_company ON placements(company_id);
CREATE INDEX IF NOT EXISTS idx_suggestions_student_status ON match_suggestions(student_id, status);
CREATE INDEX IF NOT EXISTS idx_assignments_placement_status ON assignments(placement_id, status);
CREATE INDEX IF NOT EXISTS idx_audit_events_created_at ON audit_events(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_events_resource ON audit_events(resource_type, resource_id);

COMMIT;
