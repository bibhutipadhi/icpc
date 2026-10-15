import React from 'react';
import { Award, Compass, Search, Sliders, BookOpen, Layers } from 'lucide-react';

interface HeaderProps {
  activeTab: 'finder' | 'simulator' | 'colleges' | 'rules' | 'sandbox';
  setActiveTab: (tab: 'finder' | 'simulator' | 'colleges' | 'rules' | 'sandbox') => void;
  selectedCount: number;
  totalSlots: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  selectedCount,
  totalSlots,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 w-full">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-6">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-sm sm:text-base shadow-xs shrink-0">
              <Award className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="flex flex-col truncate">
              <span className="text-sm sm:text-base font-bold tracking-tight text-stone-900 leading-tight truncate">
                ICPC India Selection
              </span>
              <span className="hidden sm:inline text-[10px] sm:text-[11px] font-medium text-stone-500 uppercase tracking-wider truncate">
                360 General Slots & Seat Finder
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links (desktop) */}
          <nav className="hidden lg:flex items-center gap-1 sm:gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('finder')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'finder'
                  ? 'bg-amber-50 text-amber-900 font-semibold border border-amber-200'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Seat Finder</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'simulator'
                  ? 'bg-amber-50 text-amber-900 font-semibold border border-amber-200'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>360 Simulator</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('colleges')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'colleges'
                  ? 'bg-amber-50 text-amber-900 font-semibold border border-amber-200'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Colleges</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('rules')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'rules'
                  ? 'bg-amber-50 text-amber-900 font-semibold border border-amber-200'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>7 Rules</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('sandbox')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'sandbox'
                  ? 'bg-amber-50 text-amber-900 font-semibold border border-amber-200'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Sandbox</span>
            </button>
          </nav>

          {/* Zone 3: Primary Action / Counter */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="text-right hidden sm:block">
              <div className="text-[10px] text-stone-500 font-medium uppercase tracking-wider">Slots Filled</div>
              <div className="text-xs sm:text-sm font-bold font-mono text-stone-900 tabular-nums">
                {selectedCount} <span className="text-stone-400 font-normal">/ {totalSlots}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === 'finder' ? 'simulator' : 'finder')}
              className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition-colors whitespace-nowrap shrink-0 shadow-xs"
            >
              {activeTab === 'finder' ? '360 Simulator' : 'Seat Finder'}
            </button>
          </div>
        </div>
      </div>

      {/* Sub-navigation bar for tablet & mobile */}
      <div className="lg:hidden flex items-center overflow-x-auto px-3 py-1.5 border-t border-stone-200/80 gap-1 scrollbar-none bg-stone-50/90 text-xs">
        <button
          onClick={() => setActiveTab('finder')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap shrink-0 font-medium transition-colors ${
            activeTab === 'finder' ? 'bg-amber-600 text-white font-semibold shadow-xs' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Seat Finder
        </button>
        <button
          onClick={() => setActiveTab('simulator')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap shrink-0 font-medium transition-colors ${
            activeTab === 'simulator' ? 'bg-amber-600 text-white font-semibold shadow-xs' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          360 Simulator
        </button>
        <button
          onClick={() => setActiveTab('colleges')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap shrink-0 font-medium transition-colors ${
            activeTab === 'colleges' ? 'bg-amber-600 text-white font-semibold shadow-xs' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Colleges
        </button>
        <button
          onClick={() => setActiveTab('rules')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap shrink-0 font-medium transition-colors ${
            activeTab === 'rules' ? 'bg-amber-600 text-white font-semibold shadow-xs' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          7 Rules
        </button>
        <button
          onClick={() => setActiveTab('sandbox')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap shrink-0 font-medium transition-colors ${
            activeTab === 'sandbox' ? 'bg-amber-600 text-white font-semibold shadow-xs' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Sandbox
        </button>
      </div>
    </header>
  );
};
