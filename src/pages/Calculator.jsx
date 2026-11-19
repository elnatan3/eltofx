import { useMemo } from "react";
import {
  Calculator as CalculatorIcon,
  Check,
  ChevronDown,
  Download,
  RotateCcw,
  ShieldCheck,
  Target,
} from "lucide-react";
import { ALLOCATIONS, money, positionPlan } from "../lib/finance.js";
import { downloadText, useStoredState } from "../lib/hooks.js";
import {
  NumberField,
  PageTitle,
  Segmented,
  SelectField,
  Note,
} from "../components/UI.jsx";

const DEFAULTS = {
  balance: 10000,
  riskPercent: 1,
  entry: 4000,
  side: "buy",
  allocation: "equal",
  custom: [50, 25, 25],
  contract: 100,
  lotStep: 0.01,
  minLot: 0.01,
  commission: 0,
};

export default function Calculator() {
  const [form, setForm] = useStoredState("eltofx-position-v1", DEFAULTS);
  const set = (field, value) =>
    setForm((current) => ({ ...current, [field]: value }));
  const custom =
    Array.isArray(form.custom) && form.custom.length === 3
      ? form.custom
      : DEFAULTS.custom;
  const weights =
    form.allocation === "custom"
      ? custom.map((v) => (v === "" ? NaN : Number(v) / 100))
      : ALLOCATIONS[form.allocation];
  const plan = useMemo(
    () => (weights ? positionPlan({ ...form, weights }) : null),
    [form, weights],
  );
  const exportPlan = () => {
    const rows = [
      ["ELTOFX Gold Position Plan"],
      ["USD account balance", form.balance],
      ["Risk budget USD", plan.budget],
      [
        "Actual sized risk USD including configured commission",
        plan.actualRisk,
      ],
      ["Entry (illustrative/manual)", form.entry],
      ["Direction", form.side],
      ["Stop price", plan.stopPrice],
      ["Point definition", "$1 gold price move per ounce"],
      ["Contract ounces per lot", form.contract],
      ["Lot step", form.lotStep],
      ["Minimum lot", form.minLot],
      ["Round-trip commission USD per lot", form.commission],
      ["Sizing allocation", form.allocation],
      [],
      [
        "Position",
        "Lots",
        "Stop points",
        "TP points",
        "TP price",
        "Risk USD incl commission",
        "TP net USD",
      ],
      ...plan.legs.map((leg, i) => [
        `TP${i + 1}`,
        leg.lots,
        7,
        leg.target,
        leg.price,
        leg.risk.toFixed(2),
        leg.profit.toFixed(2),
      ]),
      [],
      ["Outcome", "Net USD"],
      ...plan.outcomes.map((outcome) => [
        outcome.label,
        outcome.value.toFixed(2),
      ]),
      [],
      [
        "Assumptions",
        "TP2 partial scenario moves last stop to entry; excludes spread, swaps and slippage; no margin check; education only.",
      ],
    ];
    downloadText(
      "ELTOFX-trade-plan.csv",
      rows
        .map((row) =>
          row
            .map((value) => `"${String(value).replaceAll('"', '""')}"`)
            .join(","),
        )
        .join("\r\n"),
      "text/csv;charset=utf-8",
    );
  };
  return (
    <>
      <PageTitle
        eyebrow="THE POSITION LAB"
        title="Risk first."
        accent="Size second."
        description="One setup. Three positions. Know the numbers before you enter."
      >
        <span className="page-title-icon">
          <CalculatorIcon size={28} />
        </span>
      </PageTitle>
      <div className="calculator-layout">
        <section
          className="calculator-inputs panel"
          aria-label="Position calculator inputs"
        >
          <div className="panel-heading compact">
            <h2>Your trade plan</h2>
            <button
              className="icon-button"
              onClick={() => setForm(DEFAULTS)}
              title="Reset calculator"
              aria-label="Reset calculator"
            >
              <RotateCcw size={16} />
            </button>
          </div>
          <NumberField
            id="balance"
            label="Account balance"
            prefix="$"
            value={form.balance}
            min="1"
            max="1000000000"
            onChange={(v) => set("balance", v)}
          />
          <NumberField
            id="risk-percent"
            label="Total setup risk"
            suffix="%"
            value={form.riskPercent}
            min="0.01"
            max="100"
            onChange={(v) => set("riskPercent", v)}
            help="This budget is shared by all three positions, not risked on each one."
          />
          <div className="risk-presets" aria-label="Risk presets">
            {[0.5, 1, 2, 3].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => set("riskPercent", v)}
                className={form.riskPercent === v ? "active" : ""}
              >
                {v}%
              </button>
            ))}
          </div>
          <div className="field">
            <span className="field-label">Direction</span>
            <Segmented
              label="Trade direction"
              value={form.side}
              onChange={(v) => set("side", v)}
              options={[
                { value: "buy", label: "Buy / Long" },
                { value: "sell", label: "Sell / Short" },
              ]}
            />
          </div>
          <NumberField
            id="entry"
            label="Entry price · manual example"
            prefix="$"
            value={form.entry}
            min="21.01"
            step="0.01"
            onChange={(v) => set("entry", v)}
          />
          <SelectField
            id="allocation"
            label="Position allocation"
            value={form.allocation}
            onChange={(v) => set("allocation", v)}
            options={[
              { value: "equal", label: "Equal · ⅓ / ⅓ / ⅓" },
              { value: "defensive", label: "Front weighted · 50 / 25 / 25" },
              { value: "custom", label: "Custom percentages" },
            ]}
          />
          {form.allocation === "custom" && (
            <div className="custom-weights">
              {custom.map((v, i) => (
                <NumberField
                  key={i}
                  id={`weight-${i}`}
                  label={`TP${i + 1}`}
                  value={v}
                  suffix="%"
                  min="0"
                  max="100"
                  onChange={(next) =>
                    set(
                      "custom",
                      custom.map((current, j) => (i === j ? next : current)),
                    )
                  }
                />
              ))}
              <span className="microcopy">Must add up to 100%.</span>
            </div>
          )}
          <div className="fixed-stop">
            <ShieldCheck size={18} />
            <span>
              Stop loss <strong>7 points</strong>
            </span>
            <Check size={16} />
          </div>
          <details className="broker-settings">
            <summary>
              Broker specifications
              <ChevronDown size={16} />
            </summary>
            <div>
              <NumberField
                id="contract"
                label="Troy ounces per 1.00 lot"
                value={form.contract}
                min="0.001"
                onChange={(v) => set("contract", v)}
              />
              <div className="two-fields">
                <NumberField
                  id="lot-step"
                  label="Lot step"
                  value={form.lotStep}
                  min="0.000001"
                  step="0.001"
                  onChange={(v) => set("lotStep", v)}
                />
                <NumberField
                  id="min-lot"
                  label="Minimum lot"
                  value={form.minLot}
                  min="0.000001"
                  step="0.001"
                  onChange={(v) => set("minLot", v)}
                />
              </div>
              <NumberField
                id="commission"
                label="Round-trip fee per 1.00 lot"
                prefix="$"
                value={form.commission}
                min="0"
                onChange={(v) => set("commission", v)}
              />
              <p className="microcopy">
                100 oz per lot is an editable example. Confirm your broker’s
                contract, lot step, and minimum.
              </p>
            </div>
          </details>
        </section>
        <section
          className="calculator-results"
          aria-label="Position calculation results"
          aria-live="polite"
        >
          {!plan ? (
            <div className="empty-state panel">
              <CalculatorIcon size={35} />
              <h2>Let’s get the inputs right.</h2>
              <p>
                Use positive numbers, an entry above $21, risk up to 100%, and
                allocations totaling 100%.
              </p>
            </div>
          ) : (
            <>
              <div className="risk-summary panel">
                <div>
                  <span className="label">TOTAL SETUP RISK BUDGET</span>
                  <strong>{money(plan.budget)}</strong>
                  <span className="muted">
                    Shared across three positions · {form.riskPercent}% of
                    balance
                  </span>
                </div>
                <div className="risk-summary-icon">
                  <ShieldCheck size={36} />
                </div>
              </div>
              <div className="sizing-meta">
                <div>
                  <span>Actual sized risk</span>
                  <strong>{money(plan.actualRisk)}</strong>
                </div>
                <div>
                  <span>Total position size</span>
                  <strong>
                    {plan.totalLots
                      .toFixed(4)
                      .replace(/0+$/, "")
                      .replace(/\.$/, "") || "0"}{" "}
                    <small>lots</small>
                  </strong>
                </div>
                <div>
                  <span>Shared stop price</span>
                  <strong>{money(plan.stopPrice)}</strong>
                </div>
              </div>
              {plan.undersized && (
                <Note className="warning-note">
                  At least one position is below the broker minimum and is sized
                  at zero. This budget cannot place the full three-position plan
                  with these specifications.
                </Note>
              )}
              <div className="position-table-wrap panel">
                <div className="panel-heading compact">
                  <h2>The three exits</h2>
                  <span className="pill">
                    {form.side === "buy" ? "LONG" : "SHORT"} XAUUSD
                  </span>
                </div>
                <div className="table-scroll">
                  <table className="position-table">
                    <thead>
                      <tr>
                        <th>Position</th>
                        <th>Size</th>
                        <th>Target price</th>
                        <th>Risk</th>
                        <th>TP net</th>
                      </tr>
                    </thead>
                    <tbody>
                      {plan.legs.map((leg, i) => (
                        <tr key={i}>
                          <td>
                            <span className={`table-target target-dot-${i}`}>
                              TP{i + 1}
                            </span>
                            <small>
                              {leg.target} points ·{" "}
                              {(leg.weight * 100).toFixed(1)}%
                            </small>
                          </td>
                          <td>
                            {leg.lots.toFixed(
                              Math.max(
                                2,
                                (String(form.lotStep).split(".")[1] || "")
                                  .length,
                              ),
                            )}
                            <small>lots</small>
                          </td>
                          <td>{money(leg.price)}</td>
                          <td>{money(leg.risk)}</td>
                          <td className={leg.profit >= 0 ? "lime" : "negative"}>
                            {money(leg.profit)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="rounding-note">
                  Lots round down to your broker’s step. Unused risk budget:{" "}
                  {money(Math.max(0, plan.budget - plan.actualRisk))}.
                </div>
              </div>
              <div className="full-target-card">
                <div>
                  <span className="label">WHEN ALL THREE TARGETS HIT</span>
                  <strong>{money(plan.totalProfit)}</strong>
                </div>
                <div>
                  <Target size={24} />
                  <strong>{plan.rewardRisk.toFixed(2)}R</strong>
                  <span>on actual total risk</span>
                </div>
              </div>
              <div className="outcomes-panel panel">
                <div className="panel-heading compact">
                  <h2>What if?</h2>
                  <span className="muted">Net setup outcomes</span>
                </div>
                {plan.outcomes.map((outcome, i) => (
                  <div className="outcome-row" key={outcome.label}>
                    <span>
                      <span className={`outcome-mark outcome-${i}`} />
                      {outcome.label}
                    </span>
                    <strong
                      className={outcome.value < -0.005 ? "negative" : "lime"}
                    >
                      {Math.abs(outcome.value) < 0.005
                        ? money(0)
                        : money(outcome.value)}
                    </strong>
                  </div>
                ))}
                <p className="microcopy">
                  TP1-only assumes the other stops stay at their original
                  prices. The TP2 scenario assumes the last stop moves to entry
                  after TP2; configured fees still apply.
                </p>
              </div>
              <div className="result-actions">
                <span>
                  <ShieldCheck size={15} />
                  Your inputs stay in this browser.
                </span>
                <button className="button button-outline" onClick={exportPlan}>
                  <Download size={16} />
                  Export trade plan
                </button>
              </div>
            </>
          )}
        </section>
      </div>
      <Note>
        USD account only. A “point” here is a $1.00 move per ounce: entry 4,000
        → TP1 4,007 on a buy. Risk and net profit include your configured
        round-trip fee. Spread, slippage, swaps, currency conversion, and margin
        requirements are excluded. A stop does not guarantee the exit price.
      </Note>
    </>
  );
}
