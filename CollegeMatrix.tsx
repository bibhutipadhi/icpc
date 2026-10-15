import React, { useState, useMemo } from 'react';
import { Building2, Search, ArrowUpDown, CheckCircle, ChevronDown, ChevronRight, Award } from 'lucide-react';
import { TeamEntry, SimulationResult } from '../types';
import { runSelectionSimulation, normalizeCollegeName } from '../utils/selectionAlgorithm';

interface CollegeMatrixProps {
  teams: TeamEntry[];
  onSelectRank?: (rank: number) => void;
}

export const CollegeMatrix: React.FC<CollegeMatrixProps> = ({ teams, onSelectRank }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'qualified' | 'not_qualified'>('all');
  const [sortField, setSortField] = useState<'selected' | 'total' | 'bestRank' | 'name'>('selected');
  const [sortAsc, setSortAsc] = useState(false);
  const [expandedCollege, setExpandedCollege] = useState<string | null>(null);

  // Run simulation with standard parameters
  const simulation: SimulationResult = useMemo(() => {
    return runSelectionSimulation(teams);
  }, [teams]);

  // Aggregate institution data
  const institutionsList = useMemo(() => {
    const list: {
      name: string;
      totalTeams: number;
      selectedCount: number;
      bestRank: number;
      seats: number[];
      teams: TeamEntry[];
    }[] = [];

    simulation.institutionStats.forEach((stat, key) => {
      if (stat.teams.length > 0) {
        list.push({
          name: stat.teams[0].college,
          totalTeams: stat.totalTeams,
          selectedCount: stat.selectedTeams,
          bestRank: stat.bestRank,
          seats: stat.seats.sort((a, b) => a - b),
          teams: stat.teams.sort((a, b) => a.rank - b.rank),
        });
      }
    });

    return list;
  }, [simulation]);

  const filteredColleges = useMemo(() => {
    let result = [...institutionsList];

    if (statusFilter === 'qualified') {
      result = result.filter(c => c.selectedCount > 0);
    } else if (statusFilter === 'not_qualified') {
      result = result.filter(c => c.selectedCount === 0);
    }

    if (searchQuery.trim()) {
      const q = normalizeCollegeName(searchQuery);
      result = result.filter(c => normalizeCollegeName(c.name).includes(q));
    }

    result.sort((a, b) => {
      let comp = 0;
      if (sortField === 'selected') comp = a.selectedCount - b.selectedCount;
      else if (sortField === 'total') comp = a.totalTeams - b.totalTeams;
      else if (sortField === 'bestRank') comp = a.bestRank - b.bestRank; // lower rank is better
      else comp = a.name.localeCompare(b.name);

      // For bestRank, default ascending is best (rank 1 > rank 100)
      if (sortField === 'bestRank') {
        return sortAsc ? comp : -comp;
      }
      return sortAsc ? comp : -comp;
    });

    return result;
  }, [institutionsList, statusFilter, searchQuery, sortField, sortAsc]);

  const handleSort = (field: 'selected' | 'total' | 'bestRank' | 'name') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(field === 'name' || field === 'bestRank');
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 py-5 sm:px-6 sm:py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-amber-800 mb-1">
          <span>Institutional Analysis</span>
          <span>·</span>
          <span>Representation Matrix</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
          College Roster & Qualification Matrix
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl">
          Track how institutional limits affect every university. See which teams qualified, which seats they secured, and why lower-ranked teams were skipped.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs mb-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search institution name (e.g. IIT, NIT, IIIT, BITS, Vellore)..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              statusFilter === 'all'
                ? 'bg-stone-900 text-white font-semibold'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            All Institutions ({institutionsList.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('qualified')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              statusFilter === 'qualified'
                ? 'bg-emerald-700 text-white font-semibold'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Qualified ({institutionsList.filter(c => c.selectedCount > 0).length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('not_qualified')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              statusFilter === 'not_qualified'
                ? 'bg-stone-700 text-white font-semibold'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Unrepresented ({institutionsList.filter(c => c.selectedCount === 0).length})
          </button>
        </div>
      </div>

      {/* College List Table */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase text-[11px] font-semibold">
              <tr>
                <th
                  onClick={() => handleSort('name')}
                  className="py-3 px-4 cursor-pointer hover:text-stone-900 select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Institution Name</span>
                    <ArrowUpDown className="w-3 h-3 text-stone-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('selected')}
                  className="py-3 px-4 cursor-pointer hover:text-stone-900 select-none text-center whitespace-nowrap"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Qualified Teams</span>
                    <ArrowUpDown className="w-3 h-3 text-stone-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('total')}
                  className="py-3 px-4 cursor-pointer hover:text-stone-900 select-none text-center whitespace-nowrap"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Total Teams</span>
                    <ArrowUpDown className="w-3 h-3 text-stone-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('bestRank')}
                  className="py-3 px-4 cursor-pointer hover:text-stone-900 select-none text-center whitespace-nowrap"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Best Rank</span>
                    <ArrowUpDown className="w-3 h-3 text-stone-400" />
                  </div>
                </th>
                <th className="py-3 px-4 whitespace-nowrap">
                  Allocated Seats
                </th>
                <th className="py-3 px-4 text-right">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredColleges.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-500">
                    No institutions found matching your search.
                  </td>
                </tr>
              ) : (
                filteredColleges.map((c) => {
                  const isExpanded = expandedCollege === c.name;
                  return (
                    <React.Fragment key={c.name}>
                      <tr
                        onClick={() => setExpandedCollege(isExpanded ? null : c.name)}
                        className={`cursor-pointer transition-colors ${
                          isExpanded ? 'bg-amber-50/50' : 'hover:bg-stone-50/80'
                        }`}
                      >
                        <td className="py-3 px-4 font-semibold text-stone-900 flex items-center gap-2">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-amber-600 shrink-0" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-stone-400 shrink-0" />
                          )}
                          <span className="truncate max-w-md">{c.name}</span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold tabular-nums">
                          {c.selectedCount > 0 ? (
                            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-emerald-800 bg-emerald-100 font-bold text-xs">
                              {c.selectedCount} {c.selectedCount === 1 ? 'slot' : 'slots'}
                            </span>
                          ) : (
                            <span className="text-stone-400 font-normal">0</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-stone-600 tabular-nums">
                          {c.totalTeams}
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-semibold text-stone-800 tabular-nums">
                          #{c.bestRank}
                        </td>
                        <td className="py-3 px-4 font-mono text-stone-700 tabular-nums">
                          {c.seats.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {c.seats.map(s => (
                                <span key={s} className="px-1.5 py-0.5 bg-stone-100 text-stone-800 rounded font-semibold text-[11px]">
                                  #{s}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-stone-400">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-xs text-amber-700 font-semibold hover:underline">
                            {isExpanded ? 'Hide teams' : 'View teams'}
                          </span>
                        </td>
                      </tr>

                      {/* Expanded View for College Teams */}
                      {isExpanded && (
                        <tr className="bg-amber-50/30">
                          <td colSpan={6} className="px-6 py-4">
                            <div className="bg-white rounded-lg border border-amber-200/80 p-4">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-3 flex items-center justify-between">
                                <span>Complete Roster for {c.name} ({c.teams.length} teams)</span>
                                <span className="text-[11px] text-stone-500 font-normal">
                                  {c.selectedCount} selected / {c.totalTeams - c.selectedCount} not selected
                                </span>
                              </h4>

                              <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                  <thead className="bg-stone-50 text-stone-500 uppercase text-[10px]">
                                    <tr>
                                      <th className="py-1.5 px-3">Rank</th>
                                      <th className="py-1.5 px-3">Team Name</th>
                                      <th className="py-1.5 px-3">Selection Status</th>
                                      <th className="py-1.5 px-3">Assigned Seat / Reason</th>
                                      <th className="py-1.5 px-3 text-right">Action</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-stone-100">
                                    {c.teams.map((t) => {
                                      const sel = simulation.selectedTeams.find(s => s.team.id === t.id);
                                      const unsel = simulation.unselectedTeams.find(u => u.team.id === t.id);
                                      return (
                                        <tr key={t.id} className="hover:bg-stone-50">
                                          <td className="py-2 px-3 font-mono font-bold text-stone-900 tabular-nums">
                                            #{t.rank}
                                          </td>
                                          <td className="py-2 px-3 font-medium text-stone-700">
                                            {t.teamName}
                                          </td>
                                          <td className="py-2 px-3">
                                            {sel ? (
                                              <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                                                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                                Selected
                                              </span>
                                            ) : (
                                              <span className="text-stone-500">
                                                Not Selected
                                              </span>
                                            )}
                                          </td>
                                          <td className="py-2 px-3 text-stone-600">
                                            {sel ? (
                                              <span className="font-mono font-bold text-amber-900">
                                                Seat #{sel.seatNumber} ({sel.stageLabel})
                                              </span>
                                            ) : (
                                              <span className="text-stone-500 text-[11px]">
                                                {unsel?.reason || 'Exceeded quota or skipped'}
                                              </span>
                                            )}
                                          </td>
                                          <td className="py-2 px-3 text-right">
                                            {onSelectRank && (
                                              <button
                                                type="button"
                                                onClick={() => onSelectRank(t.rank)}
                                                className="text-amber-700 font-semibold hover:underline"
                                              >
                                                Inspect
                                              </button>
                                            )}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
