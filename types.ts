export interface TeamEntry {
  id: string;
  rank: number;
  college: string;
  teamName?: string;
  problemsSolved: number; // For Rule 1: filter teams with 0 solved
  isDiscarded?: boolean;
}

export type SelectionStage =
  | 'stage_1_filter'
  | 'stage_2_rank'
  | 'stage_3_top50'
  | 'stage_4_51_100'
  | 'stage_5_101_140'
  | 'stage_6_pass1'
  | 'stage_7_repeat';

export interface SelectedTeamResult {
  seatNumber: number;
  team: TeamEntry;
  stage: SelectionStage;
  stageLabel: string;
  passNumber?: number;
  institutionTeamCountAtSelection: number;
}

export interface SelectionConfig {
  totalSlots: number; // default 360
  stage4CapX: number; // ranks 51-100 cap per institution (default 5)
  stage5CapY: number; // ranks 101-140 cap per institution (default 2)
  minProblemsSolved: number; // default 1
}

export interface SimulationResult {
  selectedTeams: SelectedTeamResult[];
  discardedTeams: TeamEntry[];
  unselectedTeams: {
    team: TeamEntry;
    reason: string;
  }[];
  institutionStats: Map<string, {
    totalTeams: number;
    selectedTeams: number;
    seats: number[];
    bestRank: number;
    teams: TeamEntry[];
  }>;
  stageCounts: {
    stage3: number;
    stage4: number;
    stage5: number;
    stage6_and_repeat: number;
  };
  totalSlotsUsed: number;
}
