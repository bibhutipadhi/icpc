import React from 'react';
import { Filter, Award, ShieldAlert, Users, Repeat, CheckCircle2, HelpCircle } from 'lucide-react';

export const RulesExplainer: React.FC = () => {
  const steps = [
    {
      num: 1,
      title: 'Filter',
      icon: Filter,
      subtitle: 'Zero-Problem Dropped',
      rule: 'Discard any team that could not solve a single problem in the Preliminary Online Contest.',
      example: 'Team A solved 0 problems and is dropped from the selection pool. Team B solved 1 problem and stays in the pool.',
      accent: 'border-stone-200 bg-white',
    },
    {
      num: 2,
      title: 'Rank',
      icon: Award,
      subtitle: 'Verified Contest Standings',
      rule: 'Rank all remaining teams by their Preliminary Online Contest result, after result verification is complete. This final verified ranking is the basis for every step below.',
      example: 'After verification, Team B moves from rank 42 to rank 39 once a wrong penalty is corrected.',
      accent: 'border-stone-200 bg-white',
    },
    {
      num: 3,
      title: 'Ranks 1–50',
      icon: CheckCircle2,
      subtitle: 'No Institutional Limit',
      rule: 'Select the top 50 ranked teams outright. Any number of teams from the same institution may be selected here (e.g., all 6 teams from one college, if they rank that high).',
      example: 'College P has 6 teams ranked within the top 50 — all 6 are selected outright in this step.',
      accent: 'border-amber-200 bg-amber-50/40',
    },
    {
      num: 4,
      title: 'Ranks 51–100',
      icon: Users,
      subtitle: 'Capped at X per Institution',
      rule: 'Select teams in rank order, up to X teams total from any one institution, counting teams already selected in ranks 1–50.',
      example: 'If X = 5 and College Q already has 3 teams selected from ranks 1–50, up to 2 more of its teams ranked 51–100 can be selected.',
      accent: 'border-stone-200 bg-white',
    },
    {
      num: 5,
      title: 'Ranks 101–140',
      icon: ShieldAlert,
      subtitle: 'Capped at Y per Institution',
      rule: 'Same process, up to Y teams total from any one institution, counting all teams already selected so far across steps 3 and 4.',
      example: 'If Y = 2 and College Q already has 3 teams selected so far, none of its teams ranked 101–140 are selected, since it already exceeds the Y cap of 2.',
      accent: 'border-stone-200 bg-white',
    },
    {
      num: 6,
      title: 'Ranks 141–360 (Pass 1)',
      icon: Users,
      subtitle: 'One Team Per Eligible Institution',
      rule: 'Look at remaining ranked teams from institutions with no teams selected yet in steps 1–5. Take the highest-ranked unselected team from each of those eligible institutions.',
      example: "College R's best unselected team is rank 145 and College S's is rank 150, both are picked in this pass, but no other team from R or S will be picked in this pass.",
      accent: 'border-amber-200 bg-amber-50/40',
    },
    {
      num: 7,
      title: 'Repeat (Passes 2+)',
      icon: Repeat,
      subtitle: 'Distribution Iterations Until 360 Full',
      rule: 'If slots remain, repeat step 6 with the next-highest-ranked unselected team from each institution. Continue until all 360 General Slots are filled or no eligible teams remain.',
      example: "In the next pass, College R's next-best unselected team (rank 210) becomes eligible, alongside the next-highest remaining team from every other institution.",
      accent: 'border-stone-200 bg-white',
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-3 py-5 sm:px-6 sm:py-8">
      {/* Title */}
      <div className="text-center mb-8 sm:mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-amber-800 bg-amber-100/70 border border-amber-200 rounded-full mb-2.5">
          ICPC India Selection Policy
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-stone-900 tracking-tight">
          General Team Selection — 360 Slots
        </h1>
        <p className="mt-2 text-xs sm:text-sm md:text-base text-stone-600 max-w-2xl mx-auto">
          Teams are selected in ranking order, while applying institutional limits to ensure opportunities are distributed across colleges nationwide.
        </p>
      </div>

      {/* Rules Stepper Cards */}
      <div className="space-y-4">
        {steps.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.num}
              className={`p-6 rounded-2xl border ${s.accent} shadow-xs transition-shadow hover:shadow-sm`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                {/* Step Number Circle */}
                <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-mono font-bold text-lg shrink-0 shadow-xs">
                  {s.num}
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap items-baseline gap-2 mb-1">
                    <h3 className="text-lg font-bold text-stone-900">{s.title}</h3>
                    <span className="text-xs font-medium text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                      {s.subtitle}
                    </span>
                  </div>

                  <p className="text-sm text-stone-700 leading-relaxed font-normal mb-3">
                    {s.rule}
                  </p>

                  <div className="bg-stone-50 border border-stone-200/80 rounded-xl p-3 text-xs text-stone-600 flex items-start gap-2">
                    <span className="font-bold text-stone-800 shrink-0 uppercase tracking-wide text-[10px] mt-0.5">
                      Example:
                    </span>
                    <span className="leading-relaxed">{s.example}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* FAQ / Key Questions */}
      <div className="mt-12 pt-8 border-t border-stone-200">
        <h2 className="text-xl font-bold text-stone-900 mb-6 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-amber-600" />
          Frequently Asked Questions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-stone-700">
          <div className="bg-white p-5 rounded-xl border border-stone-200">
            <h4 className="font-bold text-stone-900 text-sm mb-1.5">
              Why does my rank change when calculating the seat number?
            </h4>
            <p className="leading-relaxed text-stone-600">
              Contest rank is raw performance against all teams. Seat number applies institutional caps: if an institution ahead of you has reached its cap or if a pass selects 1 team per institution, teams from the same college are skipped, allowing teams with lower contest ranks to advance into higher seat positions.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-stone-200">
            <h4 className="font-bold text-stone-900 text-sm mb-1.5">
              What does "one team per institution per pass" mean?
            </h4>
            <p className="leading-relaxed text-stone-600">
              In Step 6, every eligible college without a team selected in the top 140 gets exactly one slot for its highest-ranked team. In Step 7, any remaining slots repeat this procedure pass-by-pass, so no single college takes multiple consecutive slots ahead of other colleges.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-stone-200">
            <h4 className="font-bold text-stone-900 text-sm mb-1.5">
              What happens if my college is already in Ranks 1–140?
            </h4>
            <p className="leading-relaxed text-stone-600">
              Under Step 6 (Pass 1), unrepresented colleges take priority. If your college already got teams in ranks 1–140, additional teams from your college wait until Step 7 (Pass 2+) where slots are filled iteratively.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-stone-200">
            <h4 className="font-bold text-stone-900 text-sm mb-1.5">
              Is this the official regional list?
            </h4>
            <p className="leading-relaxed text-stone-600">
              This tool implements the exact official algorithm and uses the ICPC India tentative ranklist. The final list is officially published by the ICPC Regional Directors after all disqualification, penalty, and eligibility checks are confirmed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
