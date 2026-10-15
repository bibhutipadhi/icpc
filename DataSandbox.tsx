import React, { useState } from 'react';
import { Layers, Plus, Trash2, RotateCcw, AlertTriangle, CheckCircle, Search } from 'lucide-react';
import { TeamEntry } from '../types';
import { INITIAL_TEAMS } from '../data/ranklist';

interface DataSandboxProps {
  teams: TeamEntry[];
  setTeams: React.Dispatch<React.SetStateAction<TeamEntry[]>>;
  onReset: () => void;
}

export const DataSandbox: React.FC<DataSandboxProps> = ({ teams, setTeams, onReset }) => {
  const [newRank, setNewRank] = useState('');
  const [newCollege, setNewCollege] = useState('');
  const [newTeamName, setNewTeamName] = useState('');
  const [newSolved, setNewSolved] = useState('1');
  const [searchFilter, setSearchFilter] = useState('');

  const handleAddTeam = (e: React.FormEvent) => {
    e.preventDefault();
    const rankNum = parseInt(newRank.trim(), 10);
    const solvedNum = parseInt(newSolved.trim(), 10);

    if (isNaN(rankNum) || rankNum < 1 || !newCollege.trim()) {
      return;
    }

    const newEntry: TeamEntry = {
      id: `custom_${Date.now()}`,
      rank: rankNum,
      college: newCollege.trim(),
      teamName: newTeamName.trim() || `Team ${teams.length + 1}`,
      problemsSolved: isNaN(solvedNum) ? 1 : solvedNum,
      isDiscarded: solvedNum < 1,
    };

    setTeams((prev) => [...prev, newEntry].sort((a, b) => a.rank - b.rank));
    setNewRank('');
    setNewCollege('');
    setNewTeamName('');
    setNewSolved('1');
  };

  const handleToggleSolved = (id: string) => {
    setTeams((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextSolved = t.problemsSolved === 0 ? 1 : 0;
          return {
            ...t,
            problemsSolved: nextSolved,
            isDiscarded: nextSolved === 0,
          };
        }
        return t;
      })
    );
  };

  const handleRemoveTeam = (id: string) => {
    setTeams((prev) => prev.filter((t) => t.id !== id));
  };

  const zeroSolveCount = teams.filter((t) => t.problemsSolved < 1).length;
  const eligibleCount = teams.length - zeroSolveCount;

  const filteredTeams = teams.filter((t) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return t.college.toLowerCase().includes(q) || String(t.rank).includes(q);
  }).slice(0, 100);

  return (
    <div className="w-full max-w-7xl mx-auto px-3 py-5 sm:px-6 sm:py-8">
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-amber-800 mb-1">
            <span>Contest Data Sandbox</span>
            <span>·</span>
            <span>Step 1 Verification</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Team Verification & Problem Filter Sandbox
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl">
            Test Rule 1 ("Discard any team that could not solve a single problem in the Preliminary Online Contest") and simulate rank corrections or team adjustments.
          </p>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-700 bg-white border border-stone-300 rounded-lg hover:bg-stone-50 transition-colors shadow-xs self-start md:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
          <span>Restore Official ICPC Ranklist</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-stone-200">
          <span className="text-xs text-stone-500 uppercase tracking-wider block font-semibold">
            Total Teams in Pool
          </span>
          <span className="text-2xl font-bold font-mono text-stone-900 mt-1 block tabular-nums">
            {teams.length}
          </span>
          <span className="text-[11px] text-stone-500 mt-0.5 block">
            Ranked Preliminary Submissions
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200">
          <span className="text-xs text-stone-500 uppercase tracking-wider block font-semibold">
            Eligible (Solved &ge; 1 Problem)
          </span>
          <span className="text-2xl font-bold font-mono text-emerald-800 mt-1 block tabular-nums">
            {eligibleCount}
          </span>
          <span className="text-[11px] text-emerald-700 mt-0.5 block">
            Proceeding to Step 2–7 Selection
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200">
          <span className="text-xs text-stone-500 uppercase tracking-wider block font-semibold">
            Discarded (0 Solved)
          </span>
          <span className="text-2xl font-bold font-mono text-rose-800 mt-1 block tabular-nums">
            {zeroSolveCount}
          </span>
          <span className="text-[11px] text-rose-700 mt-0.5 block">
            Dropped by Rule 1 Filter
          </span>
        </div>
      </div>

      {/* Add Custom Team Form */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs mb-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-3 flex items-center gap-2">
          <Plus className="w-4 h-4 text-amber-600" />
          Add / Test Custom Team in Ranklist
        </h3>

        <form onSubmit={handleAddTeam} className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-stone-600 mb-1">Rank</label>
            <input
              type="number"
              min="1"
              required
              value={newRank}
              onChange={(e) => setNewRank(e.target.value)}
              placeholder="e.g. 142"
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold text-stone-600 mb-1">College Name</label>
            <input
              type="text"
              required
              value={newCollege}
              onChange={(e) => setNewCollege(e.target.value)}
              placeholder="e.g. Test University of Technology"
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-stone-600 mb-1">Problems Solved</label>
            <input
              type="number"
              min="0"
              max="15"
              required
              value={newSolved}
              onChange={(e) => setNewSolved(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full px-4 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors shadow-xs"
            >
              Add Team
            </button>
          </div>
        </form>
      </div>

      {/* Interactive Table with 0-Problem Solved Toggle */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="p-3 bg-stone-50 border-b border-stone-200 flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-stone-400">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter teams to toggle solved problems..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
          <span className="text-[11px] text-stone-500">
            Showing first {filteredTeams.length} teams
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase text-[10px] font-semibold">
              <tr>
                <th className="py-2.5 px-4">Rank</th>
                <th className="py-2.5 px-4">College Name</th>
                <th className="py-2.5 px-4 text-center">Problems Solved</th>
                <th className="py-2.5 px-4">Step 1 Status</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredTeams.map((t) => {
                const isZero = t.problemsSolved < 1;
                return (
                  <tr key={t.id} className={isZero ? 'bg-rose-50/50' : 'hover:bg-stone-50'}>
                    <td className="py-2 px-4 font-mono font-bold text-stone-900 tabular-nums">
                      #{t.rank}
                    </td>
                    <td className="py-2 px-4 font-medium text-stone-800">
                      {t.college}
                    </td>
                    <td className="py-2 px-4 text-center font-mono tabular-nums">
                      <span className={`px-2 py-0.5 rounded font-bold text-xs ${isZero ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                        {t.problemsSolved}
                      </span>
                    </td>
                    <td className="py-2 px-4">
                      {isZero ? (
                        <span className="inline-flex items-center gap-1 text-rose-700 font-semibold text-xs">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Dropped (0 Solved)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-xs">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Eligible
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-4 text-right flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleSolved(t.id)}
                        className="text-xs text-stone-600 hover:text-stone-900 underline"
                      >
                        {isZero ? 'Set 1 Solved' : 'Set 0 Solved'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveTeam(t.id)}
                        className="text-stone-400 hover:text-rose-600"
                        title="Remove Team"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
