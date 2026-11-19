import { useMemo } from "react";
import {
  ChartNoAxesCombined,
  CircleHelp,
  RotateCcw,
  TrendingDown,
} from "lucide-react";
import { compactMoney, money, probabilityModel } from "../lib/finance.js";
import { useStoredState } from "../lib/hooks.js";
import { Note, NumberField, PageTitle } from "../components/UI.jsx";
import ProbabilityChart from "../components/ProbabilityChart.jsx";

const DEFAULTS = {
  balance: 10000,
  riskPercent: 1,
  rr: 2,
  winRate: 50,
  trades: 40,
  target: 12000,
  streak: 5,
};
const percent = (value) => {
  const bounded = Math.min(1, Math.max(0, value));
  if (bounded > 0 && bounded < 0.001) return "<0.1%";
  if (bounded > 0.999 && bounded < 1) return ">99.9%";
  return `${(bounded * 100).toFixed(1)}%`;
};

export default function Probability() {
  const [form, setForm] = useStoredState("eltofx-probability-v1", DEFAULTS);
  const set = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));
  const model = useMemo(() => probabilityModel(form), [form]);
  const scenarios = useMemo(
    () =>
      model
        ? [30, 40, 50, 60, 70].map((winRate) => ({
            winRate,
            model: probabilityModel({ ...form, winRate }),
          }))
        : [],
    [form, model],
  );
  return (
    <>
      <PageTitle
        eyebrow="THE PROBABILITY LAB"
        title="See the possibilities."
        accent="Not promises."
        description="Change the assumptions. Understand how risk, reward, and repetition work together."
      >
        <span className="page-title-icon">
          <ChartNoAxesCombined size={28} />
        </span>
      </PageTitle>
      <Note className="model-note">
        This model has two outcomes per setup: a full loss (−1R) or a win at
        your chosen R:R. It does not model the strategy’s partial exits. Use
        your measured average winning payoff, not automatically the last
        position’s 3R target.
      </Note>
      <div className="calculator-layout probability-layout">
        <section
          className="calculator-inputs panel"
          aria-label="Probability calculator inputs"
        >
          <div className="panel-heading compact">
            <h2>The assumptions</h2>
            <button
              className="icon-button"
              onClick={() => setForm(DEFAULTS)}
              aria-label="Reset probability calculator"
              title="Reset assumptions"
            >
              <RotateCcw size={16} />
            </button>
          </div>
          <NumberField
            id="prob-balance"
            label="Starting balance"
            prefix="$"
            value={form.balance}
            min="1"
            onChange={(v) => set("balance", v)}
          />
          <NumberField
            id="prob-trades"
            label="Number of setups"
            value={form.trades}
            suffix="trades"
            min="1"
            max="200"
            step="1"
            onChange={(v) => set("trades", v)}
          />
          <NumberField
            id="prob-risk"
            label="Risk per setup"
            value={form.riskPercent}
            suffix="%"
            min="0.01"
            max="50"
            onChange={(v) => set("riskPercent", v)}
          />
          <div className="field">
            <div className="slider-label">
              <label htmlFor="win-rate">Assumed win rate</label>
              <strong>{form.winRate}%</strong>
            </div>
            <input
              id="win-rate"
              className="styled-range"
              type="range"
              min="0"
              max="100"
              step="1"
              value={form.winRate}
              onChange={(e) => set("winRate", Number(e.target.value))}
            />
            <div className="range-ends">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>
          <NumberField
            id="rr"
            label="Reward per 1R risk"
            prefix="1 :"
            value={form.rr}
            min="0.1"
            max="10"
            step="0.1"
            onChange={(v) => set("rr", v)}
          />
          <div className="rr-presets" aria-label="Reward risk presets">
            {[1, 2, 3].map((value) => (
              <button
                key={value}
                className={form.rr === value ? "active" : ""}
                onClick={() => set("rr", value)}
              >
                1:{value}
              </button>
            ))}
          </div>
          <NumberField
            id="target-balance"
            label="Target ending balance"
            prefix="$"
            value={form.target}
            min="1"
            onChange={(v) => set("target", v)}
          />
          <div className="compounding-note">
            <CircleHelp size={16} />
            <p>
              Compounded sizing: each setup risks the same percentage of the
              balance at that time.
            </p>
          </div>
        </section>
        <section
          className="probability-results"
          aria-label="Probability model results"
        >
          {!model ? (
            <div className="empty-state panel">
              <ChartNoAxesCombined size={35} />
              <h2>Adjust your assumptions.</h2>
              <p>
                Use 1–200 whole trades, 0–100% win rate, risk above 0 and at
                most 50%, R:R above 0 and at most 10, and positive balances.
              </p>
            </div>
          ) : (
            <>
              <div className="probability-stats">
                <div className="panel">
                  <span className="label">EXPECTED ENDING BALANCE</span>
                  <strong>{compactMoney(model.expected)}</strong>
                  <span>Probability-weighted average</span>
                </div>
                <div className="panel">
                  <span className="label">CHANCE OF FINISHING AHEAD</span>
                  <strong className="lime">
                    {percent(model.profitProbability)}
                  </strong>
                  <span>Ending above {compactMoney(form.balance)}</span>
                </div>
                <div className="panel">
                  <span className="label">CHANCE OF ENDING AT TARGET</span>
                  <strong>{percent(model.targetProbability)}</strong>
                  <span>Ending at or above {compactMoney(form.target)}</span>
                </div>
              </div>
              <div className="projection-panel panel">
                <div className="panel-heading compact">
                  <div>
                    <h2>A range of outcomes</h2>
                    <span className="muted">
                      Exact binomial model · {form.trades} independent setups
                    </span>
                  </div>
                  <span className="pill">COMPOUNDED</span>
                </div>
                <ProbabilityChart fan={model.fan} initial={form.balance} />
                <div className="projection-footer">
                  <span>
                    The shaded band is a point-by-point central range, not a
                    guaranteed account path.
                  </span>
                </div>
              </div>
              <div className="expectancy-row">
                <div>
                  <span>Arithmetic expectancy</span>
                  <strong
                    className={model.expectancy < 0 ? "negative" : "lime"}
                  >
                    {model.expectancy >= 0 ? "+" : ""}
                    {model.expectancy.toFixed(2)}R <small>/ setup</small>
                  </strong>
                </div>
                <div>
                  <span>Arithmetic break-even win rate</span>
                  <strong>{model.breakEvenWinRate.toFixed(1)}%</strong>
                </div>
                <div>
                  <span>Log-growth break-even win rate</span>
                  <strong>{model.geometricBreakEven.toFixed(1)}%</strong>
                </div>
              </div>
              <div className="streak-card panel">
                <div className="streak-icon">
                  <TrendingDown size={23} />
                </div>
                <div className="streak-copy">
                  <h3>Losing streaks belong in the plan.</h3>
                  <p>
                    Chance of at least one {form.streak}-loss run in{" "}
                    {form.trades} trades:{" "}
                    <strong>{percent(model.streakProbability)}</strong>. That
                    run alone reduces balance by{" "}
                    <strong>{model.streakDrawdown.toFixed(1)}%</strong> at your
                    chosen risk.
                  </p>
                </div>
                <NumberField
                  id="streak"
                  label="Losses in a row"
                  value={form.streak}
                  min="1"
                  max="20"
                  step="1"
                  onChange={(v) => set("streak", v)}
                />
              </div>
            </>
          )}
        </section>
      </div>
      {model && (
        <section className="scenario-section">
          <div className="section-title">
            <div>
              <span className="label">SAME RISK. DIFFERENT ASSUMPTIONS.</span>
              <h2>
                What changes with <span className="serif">win rate?</span>
              </h2>
            </div>
            <span className="section-aside">
              {form.trades} setups · {form.riskPercent}% risk · 1:{form.rr}{" "}
              payoff
            </span>
          </div>
          <div className="scenario-table panel table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Win rate</th>
                  <th>Expectancy / setup</th>
                  <th>Expected balance</th>
                  <th>Median balance</th>
                  <th>Chance of profit</th>
                </tr>
              </thead>
              <tbody>
                {scenarios.map((scenario) => (
                  <tr
                    key={scenario.winRate}
                    className={
                      scenario.winRate === form.winRate
                        ? "current-scenario"
                        : ""
                    }
                  >
                    <td>
                      {scenario.winRate}%{" "}
                      {scenario.winRate === form.winRate && (
                        <span className="pill">SELECTED</span>
                      )}
                    </td>
                    <td
                      className={
                        scenario.model.expectancy < 0 ? "negative" : "lime"
                      }
                    >
                      {scenario.model.expectancy >= 0 ? "+" : ""}
                      {scenario.model.expectancy.toFixed(2)}R
                    </td>
                    <td>{money(scenario.model.expected)}</td>
                    <td>{money(scenario.model.median)}</td>
                    <td>{percent(scenario.model.profitProbability)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
      <Note>
        Assumes independent setups, a constant win rate, exact fills, full
        reinvestment, and only two payoff outcomes. Fees, partial exits,
        changing market conditions, margin limits, and minimum lot sizes are
        excluded. “Ending at target” does not mean the chance of touching that
        target earlier. The average can be driven by rare large outcomes;
        compare the median. The log-growth threshold includes compounding drag.
      </Note>
    </>
  );
}
