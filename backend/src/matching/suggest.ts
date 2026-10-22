export type Candidate = {
  id: string;
  cycleCode: string;
  periodCode: string;
  eligible: boolean;
  competencies: ReadonlySet<string>;
};

export type Placement = {
  id: string;
  cycleCode: string;
  periodCode: string;
  requiredCompetencies: ReadonlySet<string>;
  preferredCompetencies: ReadonlySet<string>;
  capacityAvailable: number;
};

export type Suggestion = {
  candidateId: string;
  placementId: string;
  score: number;
  matchedCompetencies: string[];
  missingCompetencies: string[];
  matchedPreferredCompetencies: string[];
  explanation: string[];
};

export const MATCH_RULE_VERSION = "0.1.1";

/**
 * Transparent deterministic suggestions only. This function does not assign
 * anyone, reserve capacity, or make a decision on behalf of a tutor.
 * Required criteria are gates; preferred competencies rank eligible candidates.
 * Candidate and placement inputs must already be authorized and minimized.
 */
export function suggestMatches(
  candidates: readonly Candidate[],
  placements: readonly Placement[]
): Suggestion[] {
  const suggestions: Suggestion[] = [];

  for (const placement of placements) {
    if (placement.capacityAvailable <= 0) continue;

    for (const candidate of candidates) {
      if (!candidate.eligible) continue;
      if (candidate.cycleCode !== placement.cycleCode) continue;
      if (candidate.periodCode !== placement.periodCode) continue;

      const required = [...placement.requiredCompetencies].sort();
      const matched = required.filter((code) => candidate.competencies.has(code));
      const missing = required.filter((code) => !candidate.competencies.has(code));
      if (missing.length > 0) continue;

      const preferred = [...placement.preferredCompetencies].sort();
      const matchedPreferred = preferred.filter((code) => candidate.competencies.has(code));
      const score = preferred.length === 0
        ? 100
        : Math.round((matchedPreferred.length / preferred.length) * 100);

      suggestions.push({
        candidateId: candidate.id,
        placementId: placement.id,
        score,
        matchedCompetencies: matched,
        missingCompetencies: missing,
        matchedPreferredCompetencies: matchedPreferred,
        explanation: [
          "Cumple los requisitos de elegibilidad configurados.",
          "El ciclo y el periodo coinciden con la plaza.",
          "Cumple todas las competencias obligatorias.",
          preferred.length === 0
            ? "No hay competencias preferentes configuradas; la puntuación no distingue entre candidatos."
            : `Coincide con ${matchedPreferred.length} de ${preferred.length} competencias preferentes.`
        ]
      });
    }
  }

  return suggestions.sort((a, b) =>
    a.placementId.localeCompare(b.placementId) ||
    b.score - a.score ||
    a.candidateId.localeCompare(b.candidateId)
  );
}
