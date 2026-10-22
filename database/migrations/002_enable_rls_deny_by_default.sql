-- FP Conecta v2: baseline de seguridad para tablas del esquema public.
-- Esta migración activa RLS sin crear políticas de acceso.
-- Resultado intencionado: los roles API no obtienen acceso a filas hasta que
-- se diseñen y revisen políticas explícitas. El backend todavía no debe usar
-- este esquema para datos de negocio.
--
-- Revisar en un proyecto de pruebas con datos ficticios antes de aplicar.
-- No aplicar a producción sin revisión técnica e institucional.

BEGIN;

ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_competencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.placements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.placement_competencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.privacy_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;

COMMIT;
