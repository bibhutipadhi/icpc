import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { SeatFinder } from './components/SeatFinder';
import { SelectionSimulator } from './components/SelectionSimulator';
import { CollegeMatrix } from './components/CollegeMatrix';
import { RulesExplainer } from './components/RulesExplainer';
import { DataSandbox } from './components/DataSandbox';
import { INITIAL_TEAMS } from './data/ranklist';
import { runSelectionSimulation } from './utils/selectionAlgorithm';
import { TeamEntry } from './types';

export default function App() {
  const [teams, setTeams] = useState<TeamEntry[]>(INITIAL_TEAMS);
  const [activeTab, setActiveTab] = useState<'finder' | 'simulator' | 'colleges' | 'rules' | 'sandbox'>('finder');
  const [selectedRankForFinder, setSelectedRankForFinder] = useState<number | null>(1558);

  const simulation = useMemo(() => {
    return runSelectionSimulation(teams);
  }, [teams]);

  const handleInspectRank = (rank: number) => {
    setSelectedRankForFinder(rank);
    setActiveTab('finder');
  };

  const handleResetData = () => {
    setTeams(INITIAL_TEAMS);
  };

  return (
    <div className="min-h-screen bg-stone-100/60 text-stone-900 flex flex-col font-sans antialiased selection:bg-amber-200 selection:text-amber-900">
      {/* Top Bar Contract Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedCount={simulation.totalSlotsUsed}
        totalSlots={360}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'finder' && (
          <SeatFinder
            teams={teams}
            initialRank={selectedRankForFinder}
            onSelectRank={(r) => setSelectedRankForFinder(r)}
          />
        )}

        {activeTab === 'simulator' && (
          <SelectionSimulator
            teams={teams}
            onInspectRank={handleInspectRank}
          />
        )}

        {activeTab === 'colleges' && (
          <CollegeMatrix
            teams={teams}
            onSelectRank={handleInspectRank}
          />
        )}

        {activeTab === 'rules' && <RulesExplainer />}

        {activeTab === 'sandbox' && (
          <DataSandbox
            teams={teams}
            setTeams={setTeams}
            onReset={handleResetData}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-8 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
            <span className="font-semibold text-stone-700">
              ICPC India Regional Selection Simulator
            </span>
            <span className="hidden sm:inline text-stone-300">|</span>
            <span>Based on Official Tentative Preliminary Standings & 360 General Slots Policy</span>
          </div>

          <div className="flex items-center gap-4 text-stone-400">
            <span>Ranks 1–4,168 loaded</span>
            <span>·</span>
            <span>Rule: 140 base + 1/inst pass</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
