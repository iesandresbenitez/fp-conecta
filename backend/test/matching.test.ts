import test from "node:test";
import assert from "node:assert/strict";
import { suggestMatches, type Candidate, type Placement } from "../dist/matching/suggest.js";

const candidates: Candidate[] = [
  { id: "candidate-a", cycleCode: "CYCLE-A", periodCode: "P1", eligible: true, competencies: new Set(["JS", "SQL"]) },
  { id: "candidate-b", cycleCode: "CYCLE-A", periodCode: "P1", eligible: true, competencies: new Set(["JS"]) },
  { id: "candidate-c", cycleCode: "CYCLE-B", periodCode: "P1", eligible: true, competencies: new Set(["JS", "SQL"]) },
  { id: "candidate-d", cycleCode: "CYCLE-A", periodCode: "P1", eligible: false, competencies: new Set(["JS", "SQL"]) }
];

const placements: Placement[] = [
  { id: "placement-1", cycleCode: "CYCLE-A", periodCode: "P1", requiredCompetencies: new Set(["JS", "SQL"]), capacityAvailable: 1 },
  { id: "placement-closed", cycleCode: "CYCLE-A", periodCode: "P1", requiredCompetencies: new Set(["JS"]), capacityAvailable: 0 }
];

test("only suggests eligible candidates matching cycle, period, and mandatory competencies", () => {
  const result = suggestMatches(candidates, placements);
  assert.deepEqual(result.map((item) => item.candidateId), ["candidate-a"]);
  assert.equal(result[0]?.score, 100);
  assert.deepEqual(result[0]?.matchedCompetencies, ["JS", "SQL"]);
  assert.deepEqual(result[0]?.missingCompetencies, []);
});

test("suggestions are deterministic and do not assign candidates", () => {
  const first = suggestMatches(candidates, placements);
  const second = suggestMatches(candidates, placements);
  assert.deepEqual(first, second);
  assert.ok(first.every((item) => "explanation" in item));
  assert.ok(first.every((item) => !("assignmentStatus" in item)));
});

test("no mandatory competencies yields a transparent full score, not an assignment", () => {
  const result = suggestMatches(
    [candidates[0]!],
    [{ id: "placement-open", cycleCode: "CYCLE-A", periodCode: "P1", requiredCompetencies: new Set(), capacityAvailable: 2 }]
  );
  assert.equal(result[0]?.score, 100);
  assert.match(result[0]?.explanation.join(" ") ?? "", /no define competencias obligatorias/);
});
