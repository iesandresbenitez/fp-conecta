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
  capacityAvailable: number;
};

export type Suggestion = {
  candidateId: string;
  placementId: string;
  score: number;
  matchedCompetencies: string[];
  missingCompetencies: string[];
  explanation: string[];
};

export const MATCH_RULE_VERSION = "0.1.0";

/**
 * Transparent deterministic suggestions only. This function does not assign
 * anyone, reserve capacity, or make a decision on behalf of a tutor.
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

      const score = required.length === 0
        ? 100
        : Math.round((matched.length / required.length) * 100);

      suggestions.push({
        candidateId: candidate.id,
        placementId: placement.id,
        score,
        matchedCompetencies: matched,
        missingCompetencies: missing,
        explanation: [
          "Cumple los requisitos de elegibilidad configurados.",
          "El ciclo y el periodo coinciden con la plaza.",
          required.length === 0
            ? "La plaza no define competencias obligatorias."
            : "Cumple todas las competencias obligatorias."
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
