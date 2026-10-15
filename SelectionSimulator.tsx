import React, { useState, useMemo } from 'react';
import { Sliders, Download, Search, CheckCircle, Filter, ArrowUpDown, ChevronRight, Layers, Building2 } from 'lucide-react';
import { TeamEntry, SelectionConfig, SimulationResult, SelectedTeamResult } from '../types';
import { runSelectionSimulation, normalizeCollegeName } from '../utils/selectionAlgorithm';

interface SelectionSimulatorProps {
  teams: TeamEntry[];
  onInspectRank?: (rank: number) => void;
}

export const SelectionSimulator: React.FC<SelectionSimulatorProps> = ({
  teams,
  onInspectRank,
}) => {
  // Configuration options
  const [config, setConfig] = useState<SelectionConfig>({
    totalSlots: 360,
    stage4CapX: 5,
    stage5CapY: 2,
    minProblemsSolved: 1,
  });

  // Table filters & controls
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<'all' | 'stage_3_top50' | 'stage_4_51_100' | 'stage_5_101_140' | 'stage_6_pass1' | 'stage_7_repeat'>('all');
  const [sortField, setSortField] = useState<'seatNumber' | 'rank' | 'college'>('seatNumber');
  const [sortAsc, setSortAsc] = useState(true);
  const [showConfigDrawer, setShowConfigDrawer] = useState(false);

  // Run simulation
  const simulation: SimulationResult = useMemo(() => {
    return runSelectionSimulation(teams, config);
  }, [teams, config]);

  // Unique colleges in selected pool
  const uniqueSelectedCollegesCount = useMemo(() => {
    const colSet = new Set<string>();
    for (const s of simulation.selectedTeams) {
      colSet.add(normalizeCollegeName(s.team.college));
    }
    return colSet.size;
  }, [simulation]);

  // Filtered and sorted selected teams
  const displayedTeams = useMemo(() => {
    let list = [...simulation.selectedTeams];

    if (stageFilter !== 'all') {
      list = list.filter((t) => t.stage === stageFilter);
    }

    if (searchQuery.trim()) {
      const q = normalizeCollegeName(searchQuery);
      list = list.filter((t) => {
        const normCol = normalizeCollegeName(t.team.college);
        const rankStr = String(t.team.rank);
        const seatStr = String(t.seatNumber);
        return normCol.includes(q) || rankStr.includes(q) || seatStr.includes(q);
      });
    }

    list.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'seatNumber') comparison = a.seatNumber - b.seatNumber;
      else if (sortField === 'rank') comparison = a.team.rank - b.team.rank;
      else comparison = a.team.college.localeCompare(b.team.college);
      return sortAsc ? comparison : -comparison;
    });

    return list;
  }, [simulation, stageFilter, searchQuery, sortField, sortAsc]);

  const handleExportCSV = () => {
    const headers = ['Seat Number', 'Contest Rank', 'College Name', 'Selection Stage', 'Institution Team Count'];
    const rows = simulation.selectedTeams.map((t) => [
      t.seatNumber,
      t.team.rank,
      `"${t.team.college.replace(/"/g, '""')}"`,
      `"${t.stageLabel}"`,
      t.institutionTeamCountAtSelection,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ICPC_India_Selected_360_Teams_X${config.stage4CapX}_Y${config.stage5CapY}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSort = (field: 'seatNumber' | 'rank' | 'college') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const resetConfig = () => {
    setConfig({
      totalSlots: 360,
      stage4CapX: 5,
      stage5CapY: 2,
      minProblemsSolved: 1,
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 py-5 sm:px-6 sm:py-8">
      {/* Page Title & Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-amber-800 mb-1">
            <span>Algorithm Simulator</span>
            <span>·</span>
            <span>Preliminary to Regional</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            General Team Selection — {config.totalSlots} Slots
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl">
            Simulates verified ICPC ranking rules with institutional caps across Ranks 1–50, 51–100 (Cap X={config.stage4CapX}), 101–140 (Cap Y={config.stage5CapY}), and multi-pass distribution (141+).
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          <button
            type="button"
            onClick={() => setShowConfigDrawer(!showConfigDrawer)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-700 bg-white border border-stone-300 rounded-lg hover:bg-stone-50 transition-colors shadow-xs"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-600" />
            <span>Configure Caps (X, Y)</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-stone-900 rounded-lg hover:bg-stone-800 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Configuration Slider Panel */}
      {showConfigDrawer && (
        <div className="mb-6 p-5 bg-amber-50/70 border border-amber-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-700" />
              Institutional Limit Parameters (Steps 4 & 5)
            </h3>
            <button
              type="button"
              onClick={resetConfig}
              className="text-xs text-amber-800 hover:underline font-medium"
            >
              Reset to Defaults (X=5, Y=2, Slots=360)
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <label htmlFor="capXInput" className="font-semibold text-stone-800">
                  Step 4 Cap X (Ranks 51–100)
                </label>
                <span className="font-mono font-bold text-amber-800 tabular-nums">
                  {config.stage4CapX} teams / college
                </span>
              </div>
              <input
                id="capXInput"
                type="range"
                min="1"
                max="10"
                value={config.stage4CapX}
                onChange={(e) => setConfig({ ...config, stage4CapX: parseInt(e.target.value, 10) })}
                className="w-full accent-amber-600 cursor-pointer"
              />
              <p className="text-[11px] text-stone-500 mt-1">
                Max teams from one institution across ranks 1–100.
              </p>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <label htmlFor="capYInput" className="font-semibold text-stone-800">
                  Step 5 Cap Y (Ranks 101–140)
                </label>
                <span className="font-mono font-bold text-amber-800 tabular-nums">
                  {config.stage5CapY} teams / college
                </span>
              </div>
              <input
                id="capYInput"
                type="range"
                min="1"
                max="6"
                value={config.stage5CapY}
                onChange={(e) => setConfig({ ...config, stage5CapY: parseInt(e.target.value, 10) })}
                className="w-full accent-amber-600 cursor-pointer"
              />
              <p className="text-[11px] text-stone-500 mt-1">
                Max total teams from one institution across ranks 1–140.
              </p>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <label htmlFor="slotsInput" className="font-semibold text-stone-800">
                  Total General Slots
                </label>
                <span className="font-mono font-bold text-amber-800 tabular-nums">
                  {config.totalSlots} slots
                </span>
              </div>
              <input
                id="slotsInput"
                type="range"
                min="100"
                max="500"
                step="10"
                value={config.totalSlots}
                onChange={(e) => setConfig({ ...config, totalSlots: parseInt(e.target.value, 10) })}
                className="w-full accent-amber-600 cursor-pointer"
              />
              <p className="text-[11px] text-stone-500 mt-1">
                Default standard ICPC regional general quota is 360.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 block">
            Step 3: Top 50
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black font-mono text-stone-900 tabular-nums">
              {simulation.stageCounts.stage3}
            </span>
            <span className="text-xs text-stone-500">outright</span>
          </div>
          <span className="text-[11px] text-stone-500 mt-1 block">
            No institutional cap
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 block">
            Step 4: Ranks 51–100
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black font-mono text-stone-900 tabular-nums">
              {simulation.stageCounts.stage4}
            </span>
            <span className="text-xs text-stone-500">selected</span>
          </div>
          <span className="text-[11px] text-stone-500 mt-1 block">
            Capped at {config.stage4CapX} per college
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 block">
            Step 5: Ranks 101–140
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black font-mono text-stone-900 tabular-nums">
              {simulation.stageCounts.stage5}
            </span>
            <span className="text-xs text-stone-500">selected</span>
          </div>
          <span className="text-[11px] text-stone-500 mt-1 block">
            Capped at {config.stage5CapY} per college
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 block">
            Steps 6 & 7: Passes
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black font-mono text-stone-900 tabular-nums">
              {simulation.stageCounts.stage6_and_repeat}
            </span>
            <span className="text-xs text-stone-500">pass slots</span>
          </div>
          <span className="text-[11px] text-stone-500 mt-1 block">
            One team per inst / pass
          </span>
        </div>

        <div className="bg-amber-50/80 p-4 rounded-xl border border-amber-200 shadow-xs col-span-2 lg:col-span-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-800 block">
            Colleges Represented
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black font-mono text-amber-900 tabular-nums">
              {uniqueSelectedCollegesCount}
            </span>
            <span className="text-xs text-amber-700">unique</span>
          </div>
          <span className="text-[11px] text-amber-800 mt-1 block font-medium">
            Total {simulation.totalSlotsUsed} / {config.totalSlots} Slots
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs mb-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search selected teams by college name, rank, or seat #..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
          />
        </div>

        {/* Stage Filter Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setStageFilter('all')}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors ${
              stageFilter === 'all'
                ? 'bg-stone-900 text-white font-semibold'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            All ({simulation.selectedTeams.length})
          </button>
          <button
            type="button"
            onClick={() => setStageFilter('stage_3_top50')}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors ${
              stageFilter === 'stage_3_top50'
                ? 'bg-amber-600 text-white font-semibold'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Ranks 1–50 ({simulation.stageCounts.stage3})
          </button>
          <button
            type="button"
            onClick={() => setStageFilter('stage_4_51_100')}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors ${
              stageFilter === 'stage_4_51_100'
                ? 'bg-amber-600 text-white font-semibold'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Ranks 51–100 ({simulation.stageCounts.stage4})
          </button>
          <button
            type="button"
            onClick={() => setStageFilter('stage_5_101_140')}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors ${
              stageFilter === 'stage_5_101_140'
                ? 'bg-amber-600 text-white font-semibold'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Ranks 101–140 ({simulation.stageCounts.stage5})
          </button>
          <button
            type="button"
            onClick={() => setStageFilter('stage_6_pass1')}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors ${
              stageFilter === 'stage_6_pass1'
                ? 'bg-amber-600 text-white font-semibold'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Pass 1 (New Inst)
          </button>
          <button
            type="button"
            onClick={() => setStageFilter('stage_7_repeat')}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors ${
              stageFilter === 'stage_7_repeat'
                ? 'bg-amber-600 text-white font-semibold'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Pass 2+
          </button>
        </div>
      </div>

      {/* Selected Teams Roster Table */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase text-[11px] font-semibold">
              <tr>
                <th
                  onClick={() => handleSort('seatNumber')}
                  className="py-3 px-4 cursor-pointer hover:text-stone-900 select-none whitespace-nowrap"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Seat #</span>
                    <ArrowUpDown className="w-3 h-3 text-stone-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('rank')}
                  className="py-3 px-4 cursor-pointer hover:text-stone-900 select-none whitespace-nowrap"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Preliminary Rank</span>
                    <ArrowUpDown className="w-3 h-3 text-stone-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('college')}
                  className="py-3 px-4 cursor-pointer hover:text-stone-900 select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Institution</span>
                    <ArrowUpDown className="w-3 h-3 text-stone-400" />
                  </div>
                </th>
                <th className="py-3 px-4 whitespace-nowrap">
                  Selection Stage & Rule
                </th>
                <th className="py-3 px-4 text-center whitespace-nowrap">
                  Inst. Slot Count
                </th>
                <th className="py-3 px-4 text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {displayedTeams.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-500">
                    No teams found matching the current filter or search criteria.
                  </td>
                </tr>
              ) : (
                displayedTeams.map((row) => (
                  <tr key={row.team.id} className="hover:bg-amber-50/40 transition-colors">
                    <td className="py-2.5 px-4 font-mono font-bold text-amber-900 tabular-nums">
                      #{row.seatNumber}
                    </td>
                    <td className="py-2.5 px-4 font-mono font-semibold text-stone-800 tabular-nums">
                      Rank #{row.team.rank}
                    </td>
                    <td className="py-2.5 px-4 font-medium text-stone-900 max-w-sm truncate">
                      {row.team.college}
                    </td>
                    <td className="py-2.5 px-4 text-stone-600">
                      <span className="text-[11px] font-medium block">
                        {row.stageLabel}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono font-semibold text-stone-700 tabular-nums">
                      Team #{row.institutionTeamCountAtSelection}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      {onInspectRank && (
                        <button
                          type="button"
                          onClick={() => onInspectRank(row.team.rank)}
                          className="text-xs text-amber-700 hover:text-amber-900 hover:underline font-semibold"
                        >
                          Seat Breakdown
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="py-3 px-4 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-2">
          <div>
            Showing <span className="font-semibold text-stone-800 tabular-nums">{displayedTeams.length}</span> of{' '}
            <span className="font-semibold text-stone-800 tabular-nums">{simulation.selectedTeams.length}</span> qualified teams
          </div>
          <div>
            Cutoff Rank: <span className="font-mono font-bold text-stone-800 tabular-nums">Rank #{simulation.selectedTeams[simulation.selectedTeams.length - 1]?.team.rank ?? '—'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
