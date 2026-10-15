import React, { useState, useMemo } from 'react';
import { Search, CheckCircle2, AlertCircle, ArrowRight, Building, Award, Info, Hash } from 'lucide-react';
import { TeamEntry } from '../types';
import { calculateQuickSeatNumber, normalizeCollegeName } from '../utils/selectionAlgorithm';
import { MAX_RANK } from '../data/ranklist';

interface SeatFinderProps {
  teams: TeamEntry[];
  initialRank?: number | null;
  onSelectRank?: (rank: number) => void;
}

export const SeatFinder: React.FC<SeatFinderProps> = ({ teams, initialRank = 1558, onSelectRank }) => {
  const [rankInput, setRankInput] = useState<string>(String(initialRank ?? 1558));
  const [searchedRank, setSearchedRank] = useState<number | null>(initialRank ?? 1558);
  const [collegeQuery, setCollegeQuery] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  React.useEffect(() => {
    if (initialRank !== null && initialRank !== undefined) {
      setRankInput(String(initialRank));
      setSearchedRank(initialRank);
    }
  }, [initialRank]);

  // College suggestions based on query
  const matchingColleges = useMemo(() => {
    if (!collegeQuery.trim() || collegeQuery.length < 2) return [];
    const query = normalizeCollegeName(collegeQuery);
    const seen = new Set<string>();
    const matches: { name: string; count: number; bestRank: number }[] = [];

    for (const t of teams) {
      const norm = normalizeCollegeName(t.college);
      if (norm.includes(query)) {
        if (!seen.has(t.college)) {
          seen.add(t.college);
          const colTeams = teams.filter(item => item.college === t.college);
          matches.push({
            name: t.college,
            count: colTeams.length,
            bestRank: Math.min(...colTeams.map(item => item.rank)),
          });
        }
      }
      if (matches.length >= 8) break;
    }
    return matches;
  }, [collegeQuery, teams]);

  const handleCalculate = (targetRankNum?: number) => {
    const rankToTest = targetRankNum !== undefined ? targetRankNum : parseInt(rankInput.trim(), 10);
    if (isNaN(rankToTest) || rankToTest < 1 || rankToTest > MAX_RANK) {
      setErrorMessage(`Please enter a valid rank between 1 and ${MAX_RANK}.`);
      setSearchedRank(null);
      return;
    }

    setErrorMessage(null);
    setSearchedRank(rankToTest);
    setRankInput(String(rankToTest));
    if (onSelectRank) onSelectRank(rankToTest);
  };

  const calculationResult = useMemo(() => {
    if (searchedRank === null) return null;
    return calculateQuickSeatNumber(searchedRank, teams);
  }, [searchedRank, teams]);

  // All teams from the searched college
  const collegeRoster = useMemo(() => {
    if (!calculationResult?.collegeName) return [];
    const norm = normalizeCollegeName(calculationResult.collegeName);
    return teams
      .filter(t => normalizeCollegeName(t.college) === norm)
      .sort((a, b) => a.rank - b.rank);
  }, [calculationResult, teams]);

  const quickPresets = [1, 42, 50, 98, 140, 145, 1558, 2026, 3200];

  return (
    <div className="w-full max-w-4xl mx-auto px-3 py-5 sm:px-6 sm:py-8">
      {/* Intro Box */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-amber-800 bg-amber-100/70 border border-amber-200 rounded-full mb-2.5">
          ICPC India Preliminary · Tentative Ranklist Lookup
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-stone-900 tracking-tight">
          College Seat <span className="text-amber-600">Number Finder</span>
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-stone-600 max-w-2xl mx-auto">
          Calculate the tentative regional seat number for any rank using the verified institutional skipping rules and 360 General Slots quota.
        </p>
      </div>

      {/* Main Calculator Card */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-4 sm:p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {/* Left: Rank Input */}
          <div>
            <label htmlFor="rankInput" className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
              Enter Official Rank (1–{MAX_RANK})
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <Hash className="w-4 h-4" />
                </div>
                <input
                  id="rankInput"
                  type="number"
                  min="1"
                  max={MAX_RANK}
                  value={rankInput}
                  onChange={(e) => setRankInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                  placeholder="e.g. 1558"
                  className="w-full pl-9 pr-3 py-2.5 text-sm sm:text-base font-mono font-medium rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              <button
                type="button"
                onClick={() => handleCalculate()}
                className="px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 active:bg-amber-800 rounded-xl transition-colors shadow-xs shrink-0"
              >
                Find Seat
              </button>
            </div>

            {/* Quick Presets */}
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-stone-500 mr-1">Quick ranks:</span>
              {quickPresets.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleCalculate(r)}
                  className="px-2 py-1 text-xs font-mono font-medium bg-stone-100 hover:bg-amber-100 hover:text-amber-800 text-stone-700 rounded-md border border-stone-200 transition-colors"
                >
                  #{r}
                </button>
              ))}
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          {/* Right: Search by College Name */}
          <div>
            <label htmlFor="collegeSearch" className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
              Or Lookup by College Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                id="collegeSearch"
                type="text"
                value={collegeQuery}
                onChange={(e) => setCollegeQuery(e.target.value)}
                placeholder="e.g. IIT Delhi, BITS, Medhavi..."
                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            {matchingColleges.length > 0 && (
              <div className="mt-2 bg-white border border-stone-200 rounded-xl shadow-lg max-h-56 overflow-y-auto divide-y divide-stone-100">
                {matchingColleges.map((match) => (
                  <button
                    key={match.name}
                    type="button"
                    onClick={() => {
                      setCollegeQuery(match.name);
                      handleCalculate(match.bestRank);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-amber-50 flex items-center justify-between transition-colors"
                  >
                    <div className="truncate mr-2">
                      <div className="text-xs font-medium text-stone-900 truncate">{match.name}</div>
                      <div className="text-[11px] text-stone-500">
                        {match.count} {match.count === 1 ? 'team' : 'teams'} in ranklist
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="text-xs font-mono font-semibold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-md">
                        Best #{match.bestRank}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
            <p className="mt-2 text-[11px] text-stone-500">
              Type 2+ letters to find institutions and jump directly to their top-ranked team.
            </p>
          </div>
        </div>

        {/* Calculation Result Section */}
        {calculationResult && calculationResult.isRankInPool && (
          <div className="mt-8 pt-6 border-t border-stone-200">
            <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-6 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-amber-800">
                    Calculated Regional Seat
                  </span>
                  <div className="flex items-baseline gap-2 sm:gap-3 mt-1">
                    <span className="text-4xl sm:text-5xl md:text-6xl font-black font-mono tracking-tight text-amber-900 tabular-nums">
                      #{calculationResult.seatNumber}
                    </span>
                    <span className="text-xs sm:text-sm font-medium text-stone-600">
                      of 360 General Slots
                    </span>
                  </div>
                </div>

                <div className="sm:text-right">
                  {calculationResult.isEligibleFor360 ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold rounded-lg shadow-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Within 360 General Cutoff</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-100 border border-rose-300 text-rose-900 text-xs font-bold rounded-lg shadow-xs">
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                      <span>Beyond 360 Cutoff</span>
                    </div>
                  )}
                  <div className="text-xs text-stone-500 mt-1.5 font-medium">
                    {calculationResult.isEligibleFor360
                      ? `${360 - (calculationResult.seatNumber ?? 0)} general buffer slots remaining`
                      : `Exceeds 360 limit by ${(calculationResult.seatNumber ?? 0) - 360} seats`}
                  </div>
                </div>
              </div>

              {/* Institution and Formula Breakdown */}
              <div className="mt-5 pt-4 border-t border-amber-200/60 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-stone-500 block">Institution</span>
                  <span className="font-semibold text-stone-900 text-sm mt-0.5 block">
                    {calculationResult.collegeName}
                  </span>
                </div>

                <div>
                  <span className="text-stone-500 block">Calculation Method</span>
                  <span className="font-medium text-stone-800 mt-0.5 block">
                    {calculationResult.isInTop140 ? (
                      'Ranks 1–140: Direct preliminary pool'
                    ) : (
                      <>
                        <span className="font-mono font-bold">140</span> base +{' '}
                        <span className="font-mono font-bold text-amber-800">{calculationResult.newCollegesCount}</span> new institutions
                      </>
                    )}
                  </span>
                </div>

                <div>
                  <span className="text-stone-500 block">Status Note</span>
                  <span className="text-stone-700 mt-0.5 block leading-relaxed">
                    {calculationResult.cutoffComparison.message}
                  </span>
                </div>
              </div>
            </div>

            {/* College Roster Table (other teams from this college) */}
            {collegeRoster.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-stone-500" />
                    All {collegeRoster.length} Teams from {calculationResult.collegeName}
                  </h3>
                  <span className="text-xs text-stone-500">
                    Preliminary Rank List
                  </span>
                </div>

                <div className="border border-stone-200 rounded-xl overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[480px]">
                    <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase font-semibold text-[11px]">
                      <tr>
                        <th className="py-2.5 px-3">Team Rank</th>
                        <th className="py-2.5 px-3">Team Name</th>
                        <th className="py-2.5 px-3">Preliminary Pool Zone</th>
                        <th className="py-2.5 px-3 text-right">Individual Seat Calc</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {collegeRoster.map((t, index) => {
                        const tSeat = calculateQuickSeatNumber(t.rank, teams);
                        const isCurrent = t.rank === searchedRank;
                        return (
                          <tr
                            key={t.id}
                            className={`transition-colors ${
                              isCurrent ? 'bg-amber-100/70 font-semibold text-stone-900' : 'hover:bg-stone-50 text-stone-700'
                            }`}
                          >
                            <td className="py-2 px-3 font-mono font-bold tabular-nums">
                              #{t.rank} {index === 0 && <span className="ml-1 text-[10px] text-amber-700 uppercase font-normal">(Top)</span>}
                            </td>
                            <td className="py-2 px-3">
                              {t.teamName || `Team ${index + 1}`}
                            </td>
                            <td className="py-2 px-3">
                              {t.rank <= 50 ? (
                                <span className="text-emerald-700">Ranks 1–50 (No Cap)</span>
                              ) : t.rank <= 100 ? (
                                <span className="text-blue-700">Ranks 51–100 (Cap X)</span>
                              ) : t.rank <= 140 ? (
                                <span className="text-purple-700">Ranks 101–140 (Cap Y)</span>
                              ) : (
                                <span className="text-stone-600">Rank 141+ (Pass Rule)</span>
                              )}
                            </td>
                            <td className="py-2 px-3 text-right font-mono tabular-nums">
                              <button
                                type="button"
                                onClick={() => handleCalculate(t.rank)}
                                className="text-amber-700 hover:underline font-bold"
                              >
                                #{tSeat.seatNumber ?? '—'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Official Counting Rule Explanation */}
        <div className="mt-8 pt-6 border-t border-stone-200 text-xs text-stone-600 bg-stone-50 rounded-xl p-4">
          <div className="flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-stone-800 text-xs block mb-1">
                How Seat Numbers Are Calculated for Ranks &gt; 140
              </strong>
              <p className="leading-relaxed">
                Colleges already listed in ranks 1–140 are skipped. Each college first appearing after rank 140 is counted only once.
                The seat number is <strong>140 plus the number of new colleges counted up to the entered rank</strong>.
                If this number is $\le 360$, that institution qualifies a team for the 360 General Slots pool.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
