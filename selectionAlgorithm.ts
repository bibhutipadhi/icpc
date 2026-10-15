import { TeamEntry, SelectedTeamResult, SelectionConfig, SimulationResult, SelectionStage } from '../types';

/**
 * Normalizes college name for consistent matching
 */
export function normalizeCollegeName(name: string): string {
  return String(name || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * Runs the ICPC India 360 General Team Selection Algorithm
 * according to the 7-step criteria:
 * 1. Filter: discard teams with 0 solved problems
 * 2. Rank: sort remaining teams by verified contest rank
 * 3. Ranks 1-50: outright selection, no institutional limit
 * 4. Ranks 51-100: capped at X per institution total (counting 1-50)
 * 5. Ranks 101-140: capped at Y per institution total (counting 1-100)
 * 6. Ranks 141+: one team per institution per pass (colleges with 0 selected in 1-140)
 * 7. Repeat passes until 360 slots filled or pool exhausted
 */
export function runSelectionSimulation(
  rawTeams: TeamEntry[],
  config: SelectionConfig = {
    totalSlots: 360,
    stage4CapX: 5,
    stage5CapY: 2,
    minProblemsSolved: 1,
  }
): SimulationResult {
  // Step 1: Filter teams that solved 0 problems
  const eligibleTeams: TeamEntry[] = [];
  const discardedTeams: TeamEntry[] = [];

  for (const t of rawTeams) {
    if (t.problemsSolved < config.minProblemsSolved) {
      discardedTeams.push({ ...t, isDiscarded: true });
    } else {
      eligibleTeams.push({ ...t, isDiscarded: false });
    }
  }

  // Step 2: Rank remaining teams by verified rank ascending
  eligibleTeams.sort((a, b) => a.rank - b.rank);

  const selectedTeams: SelectedTeamResult[] = [];
  const selectedTeamIds = new Set<string>();
  const institutionCounts = new Map<string, number>();
  const unselectedReasons = new Map<string, string>();

  const getCollegeCount = (college: string) => {
    const key = normalizeCollegeName(college);
    return institutionCounts.get(key) || 0;
  };

  const incrementCollegeCount = (college: string) => {
    const key = normalizeCollegeName(college);
    institutionCounts.set(key, (institutionCounts.get(key) || 0) + 1);
  };

  let currentSeat = 1;

  // Step 3: Ranks 1 to 50 — outright, no institutional limit
  for (const team of eligibleTeams) {
    if (team.rank <= 50) {
      if (currentSeat <= config.totalSlots) {
        incrementCollegeCount(team.college);
        selectedTeams.push({
          seatNumber: currentSeat++,
          team,
          stage: 'stage_3_top50',
          stageLabel: 'Step 3: Ranks 1–50 (No Institutional Limit)',
          institutionTeamCountAtSelection: getCollegeCount(team.college),
        });
        selectedTeamIds.add(team.id);
      }
    }
  }

  // Step 4: Ranks 51 to 100 — capped at X per institution total
  for (const team of eligibleTeams) {
    if (team.rank > 50 && team.rank <= 100) {
      const currentCollegeCount = getCollegeCount(team.college);
      if (currentCollegeCount < config.stage4CapX && currentSeat <= config.totalSlots) {
        incrementCollegeCount(team.college);
        selectedTeams.push({
          seatNumber: currentSeat++,
          team,
          stage: 'stage_4_51_100',
          stageLabel: `Step 4: Ranks 51–100 (Capped at ${config.stage4CapX}/college)`,
          institutionTeamCountAtSelection: getCollegeCount(team.college),
        });
        selectedTeamIds.add(team.id);
      } else if (currentCollegeCount >= config.stage4CapX) {
        unselectedReasons.set(team.id, `Exceeded Step 4 cap of ${config.stage4CapX} teams for this institution`);
      }
    }
  }

  // Step 5: Ranks 101 to 140 — capped at Y per institution total
  for (const team of eligibleTeams) {
    if (team.rank > 100 && team.rank <= 140) {
      const currentCollegeCount = getCollegeCount(team.college);
      if (currentCollegeCount < config.stage5CapY && currentSeat <= config.totalSlots) {
        incrementCollegeCount(team.college);
        selectedTeams.push({
          seatNumber: currentSeat++,
          team,
          stage: 'stage_5_101_140',
          stageLabel: `Step 5: Ranks 101–140 (Capped at ${config.stage5CapY}/college)`,
          institutionTeamCountAtSelection: getCollegeCount(team.college),
        });
        selectedTeamIds.add(team.id);
      } else if (currentCollegeCount >= config.stage5CapY) {
        unselectedReasons.set(team.id, `Exceeded Step 5 cap of ${config.stage5CapY} teams for this institution`);
      }
    }
  }

  // Step 6: Ranks 141+ — Pass 1:
  // "Look at remaining ranked teams from institutions with no teams selected yet in steps 1–5.
  // Take the highest-ranked unselected team from each of those eligible institutions."
  const collegesWithSelectionsIn1To140 = new Set<string>();
  for (const sel of selectedTeams) {
    collegesWithSelectionsIn1To140.add(normalizeCollegeName(sel.team.college));
  }

  const pass1CollegesSelected = new Set<string>();
  for (const team of eligibleTeams) {
    if (currentSeat > config.totalSlots) break;
    if (team.rank > 140 && !selectedTeamIds.has(team.id)) {
      const norm = normalizeCollegeName(team.college);
      // Only institutions with 0 teams selected yet in steps 1-5, and at most 1 in pass 1
      if (!collegesWithSelectionsIn1To140.has(norm) && !pass1CollegesSelected.has(norm)) {
        incrementCollegeCount(team.college);
        pass1CollegesSelected.add(norm);
        selectedTeams.push({
          seatNumber: currentSeat++,
          team,
          stage: 'stage_6_pass1',
          stageLabel: 'Step 6: Ranks 141+ Pass 1 (First team from unrepresented college)',
          passNumber: 1,
          institutionTeamCountAtSelection: getCollegeCount(team.college),
        });
        selectedTeamIds.add(team.id);
      }
    }
  }

  // Step 7: Repeat passes if slots remain
  // "If slots remain, repeat step 6 with the next-highest-ranked unselected team from each institution.
  // Continue until all 360 General Slots are filled or no eligible teams remain."
  let currentPass = 2;
  while (currentSeat <= config.totalSlots) {
    const unselectedPool = eligibleTeams.filter(t => !selectedTeamIds.has(t.id));
    if (unselectedPool.length === 0) break;

    const passCollegesSelectedThisRound = new Set<string>();
    let selectedAnyInThisPass = false;

    for (const team of unselectedPool) {
      if (currentSeat > config.totalSlots) break;
      const norm = normalizeCollegeName(team.college);
      if (!passCollegesSelectedThisRound.has(norm)) {
        passCollegesSelectedThisRound.add(norm);
        incrementCollegeCount(team.college);
        selectedTeams.push({
          seatNumber: currentSeat++,
          team,
          stage: 'stage_7_repeat',
          stageLabel: `Step 7: Pass ${currentPass} (Next-highest team from college)`,
          passNumber: currentPass,
          institutionTeamCountAtSelection: getCollegeCount(team.college),
        });
        selectedTeamIds.add(team.id);
        selectedAnyInThisPass = true;
      }
    }

    if (!selectedAnyInThisPass) {
      break;
    }
    currentPass++;
    if (currentPass > 20) break; // Safeguard against infinite loops
  }

  // Build unselected list with reasons
  const unselectedTeams: { team: TeamEntry; reason: string }[] = [];
  for (const team of eligibleTeams) {
    if (!selectedTeamIds.has(team.id)) {
      const reason = unselectedReasons.get(team.id) ||
        (currentSeat > config.totalSlots
          ? 'Quota full: All 360 General Slots filled before reaching this team in pass order'
          : 'Not selected during institutional pass rounds');
      unselectedTeams.push({ team, reason });
    }
  }

  // Build institution statistics
  const institutionStats = new Map<string, {
    totalTeams: number;
    selectedTeams: number;
    seats: number[];
    bestRank: number;
    teams: TeamEntry[];
  }>();

  for (const t of rawTeams) {
    const key = normalizeCollegeName(t.college);
    if (!institutionStats.has(key)) {
      institutionStats.set(key, {
        totalTeams: 0,
        selectedTeams: 0,
        seats: [],
        bestRank: t.rank,
        teams: [],
      });
    }
    const stat = institutionStats.get(key)!;
    stat.totalTeams++;
    stat.bestRank = Math.min(stat.bestRank, t.rank);
    stat.teams.push(t);
  }

  for (const sel of selectedTeams) {
    const key = normalizeCollegeName(sel.team.college);
    const stat = institutionStats.get(key);
    if (stat) {
      stat.selectedTeams++;
      stat.seats.push(sel.seatNumber);
    }
  }

  const stageCounts = {
    stage3: selectedTeams.filter(t => t.stage === 'stage_3_top50').length,
    stage4: selectedTeams.filter(t => t.stage === 'stage_4_51_100').length,
    stage5: selectedTeams.filter(t => t.stage === 'stage_5_101_140').length,
    stage6_and_repeat: selectedTeams.filter(t => t.stage === 'stage_6_pass1' || t.stage === 'stage_7_repeat').length,
  };

  return {
    selectedTeams,
    discardedTeams,
    unselectedTeams,
    institutionStats,
    stageCounts,
    totalSlotsUsed: selectedTeams.length,
  };
}

/**
 * Quick Seat Number Finder for a given rank according to the Tentative Rank List formula:
 * "Colleges already listed in ranks 1–140 are skipped. Each college first appearing after rank 140
 * is counted only once. The seat number is 140 plus the number of new colleges counted up to the entered rank."
 */
export function calculateQuickSeatNumber(
  targetRank: number,
  allTeams: TeamEntry[]
): {
  targetRank: number;
  collegeName?: string;
  isRankInPool: boolean;
  isInTop140: boolean;
  seatNumber: number | null;
  newCollegesCount: number;
  isEligibleFor360: boolean;
  cutoffComparison: {
    status: 'secured_top140' | 'secured_seat_pass1' | 'beyond_360_quota' | 'not_found';
    message: string;
  };
} {
  const sorted = [...allTeams].sort((a, b) => a.rank - b.rank);
  const targetRow = sorted.find(t => t.rank === targetRank);

  if (!targetRow) {
    return {
      targetRank,
      isRankInPool: false,
      isInTop140: false,
      seatNumber: null,
      newCollegesCount: 0,
      isEligibleFor360: false,
      cutoffComparison: {
        status: 'not_found',
        message: `Rank ${targetRank} is not present in the contest ranklist.`,
      },
    };
  }

  const alreadyInFirst140 = new Set<string>();
  for (const row of sorted) {
    if (row.rank <= 140) {
      alreadyInFirst140.add(normalizeCollegeName(row.college));
    }
  }

  if (targetRank <= 140) {
    return {
      targetRank,
      collegeName: targetRow.college,
      isRankInPool: true,
      isInTop140: true,
      seatNumber: targetRank, // Inside preliminary pool 1-140
      newCollegesCount: 0,
      isEligibleFor360: true,
      cutoffComparison: {
        status: 'secured_top140',
        message: `Rank ${targetRank} is inside the top 140 pool (Rank <= 140). Subject to Steps 3-5 institutional caps.`,
      },
    };
  }

  const newColleges = new Set<string>();
  for (const row of sorted) {
    if (row.rank <= 140 || row.rank > targetRank) continue;
    const key = normalizeCollegeName(row.college);
    if (key && !alreadyInFirst140.has(key)) {
      newColleges.add(key);
    }
  }

  const seatNumber = 140 + newColleges.size;
  const isEligibleFor360 = seatNumber <= 360;

  return {
    targetRank,
    collegeName: targetRow.college,
    isRankInPool: true,
    isInTop140: false,
    seatNumber,
    newCollegesCount: newColleges.size,
    isEligibleFor360,
    cutoffComparison: {
      status: isEligibleFor360 ? 'secured_seat_pass1' : 'beyond_360_quota',
      message: isEligibleFor360
        ? `Seat #${seatNumber} is WITHIN the 360 General Slots! (${360 - seatNumber} buffer seats remain after this rank).`
        : `Seat #${seatNumber} is BEYOND the 360 General Slots cutoff by ${seatNumber - 360} seats.`,
    },
  };
}
