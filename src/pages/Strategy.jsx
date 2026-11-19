import { lazy, Suspense, useState } from "react";
import {
  Crosshair,
  Layers3,
  Pause,
  Play,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import { Checklist, Eyebrow, Segmented, Note } from "../components/UI.jsx";
import SessionBar from "../components/SessionBar.jsx";
import StrategyChart from "../components/StrategyChart.jsx";

const GoldScene = lazy(() => import("../components/GoldScene.jsx"));
const steps = [
  {
    title: "Start with the bigger picture.",
    short: "HTF bias",
    icon: Layers3,
    text: "Read the 4H and 1H market structure. Look for buys in a bullish trend and sells in a bearish trend. When the direction is unclear, sit out.",
  },
  {
    title: "Find the area that matters.",
    short: "The zone",
    icon: ScanLine,
    text: "Mark a supply or demand order block aligned with the higher time frame. Define the zone and its invalidation before price returns.",
  },
  {
    title: "Let price come to you.",
    short: "The entry",
    icon: Crosshair,
    text: "Wait for a reaction at your zone and a lower time frame shift in the trend direction. If a 7-point stop cannot cover invalidation, skip the setup.",
  },
  {
    title: "One idea. Three exits.",
    short: "The execution",
    icon: ShieldCheck,
    text: "Split your total setup risk across three positions. Keep a 7-point stop on each, with targets at 7, 14, and 21 points. Plan any stop changes in advance.",
  },
];
const checks = [
  "HTF direction is clear",
  "Supply or demand zone is marked",
  "7-point SL covers invalidation",
  "All three exits and total risk are set",
];

export default function Strategy() {
  const [side, setSide] = useState("buy");
  const [stage, setStage] = useState(3);
  const [checked, setChecked] = useState([]);
  const [paused, setPaused] = useState(false);
  const toggle = (index) =>
    setChecked((current) =>
      current.includes(index)
        ? current.filter((i) => i !== index)
        : [...current, index],
    );
  return (
    <>
      <section className="strategy-hero">
        <div className="hero-copy reveal">
          <Eyebrow>A GOLD-FOCUSED TRADING PLAYBOOK</Eyebrow>
          <h1>
            Find your edge.
            <br />
            Trade with <span className="serif lime">intent.</span>
          </h1>
          <p>
            Less noise. More structure. A focused approach to gold, built on
            higher time frame direction and supply &amp; demand.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#/calculator">
              <Crosshair size={17} />
              Plan a trade
            </a>
            <button
              className="button button-text"
              onClick={() =>
                document
                  .getElementById("playbook")
                  .scrollIntoView({
                    behavior: window.matchMedia(
                      "(prefers-reduced-motion: reduce)",
                    ).matches
                      ? "instant"
                      : "smooth",
                  })
              }
            >
              Explore the strategy
            </button>
          </div>
          <div className="hero-metrics">
            <div>
              <strong>
                1<span>/ session</span>
              </strong>
              <span>Focused setup</span>
            </div>
            <div>
              <strong>
                3<span> positions</span>
              </strong>
              <span>Planned exits</span>
            </div>
            <div>
              <strong>
                7<span> points</span>
              </strong>
              <span>Defined stop</span>
            </div>
          </div>
        </div>
        <div className="hero-art reveal">
          <div className="art-orbit orbit-one" />
          <div className="art-orbit orbit-two" />
          <div className="art-crosshair crosshair-top" />
          <div className="art-crosshair crosshair-bottom" />
          <div className="art-label">
            <span className="gold-square" />
            <span>XAU / USD</span>
            <span className="muted">THE GOLD STANDARD</span>
          </div>
          <Suspense
            fallback={
              <div className="scene-loading">
                <span />
                <span />
                <span />
              </div>
            }
          >
            <GoldScene paused={paused} />
          </Suspense>
          <div className="art-tag tag-risk">
            <ShieldCheck size={16} />
            <div>
              <strong>Defined risk.</strong>
              <span>7-point stop loss</span>
            </div>
          </div>
          <div className="art-tag tag-target">
            <Target size={16} />
            <div>
              <strong>Room to run.</strong>
              <span>21-point final target</span>
            </div>
          </div>
          <div className="art-bottom">
            <span>PRECISION OVER PREDICTION.</span>
            <button
              className="icon-button"
              onClick={() => setPaused(!paused)}
              aria-label={paused ? "Play 3D animation" : "Pause 3D animation"}
              title={paused ? "Play animation" : "Pause animation"}
            >
              {paused ? <Play size={14} /> : <Pause size={14} />}
            </button>
          </div>
        </div>
      </section>
      <SessionBar />
      <section className="playbook-section" id="playbook">
        <div className="section-title">
          <div>
            <Eyebrow>THE PROCESS</Eyebrow>
            <h2>
              A setup with <span className="serif">a reason.</span>
            </h2>
          </div>
          <span className="section-aside">
            Structure first. Execution second.
          </span>
        </div>
        <div className="playbook-grid">
          <div className="process-list" aria-label="Strategy walkthrough">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <button
                  key={step.title}
                  className={`process-step ${stage === i ? "active" : ""}`}
                  onClick={() => setStage(i)}
                  aria-pressed={stage === i}
                >
                  <span className="step-icon">
                    <Icon size={18} />
                  </span>
                  <span>
                    <span className="step-label">{step.short}</span>
                    <strong>{step.title}</strong>
                    {stage === i && (
                      <span className="step-text">{step.text}</span>
                    )}
                  </span>
                  <span className="step-marker" />
                </button>
              );
            })}
            <div className="process-footnote">
              <Sparkles size={15} />
              <span>A missed trade is still a good decision.</span>
            </div>
          </div>
          <div className="mobile-step-detail panel">
            <h3>{steps[stage].title}</h3>
            <p>{steps[stage].text}</p>
          </div>
          <div className="chart-panel">
            <div className="chart-header">
              <div>
                <span className="instrument-badge">Au</span>
                <div>
                  <strong>Gold / U.S. Dollar</strong>
                  <span>XAUUSD · ILLUSTRATIVE SETUP</span>
                </div>
              </div>
              <Segmented
                label="Setup direction"
                value={side}
                onChange={setSide}
                options={[
                  { value: "buy", label: "Buy setup" },
                  { value: "sell", label: "Sell setup" },
                ]}
              />
            </div>
            <StrategyChart side={side} stage={stage} />
            <div className="chart-footer">
              <span>
                <i className="legend-line" />
                {side === "buy" ? "Demand" : "Supply"} zone
              </span>
              <span>
                <i className="legend-dash" />
                Planned exit
              </span>
              <span className="chart-disclaimer">
                Concept diagram · not live prices
              </span>
            </div>
          </div>
        </div>
      </section>
      <section className="execution-grid">
        <div className="execution-plan panel">
          <div className="panel-heading">
            <div>
              <Eyebrow>THE EXIT PLAN</Eyebrow>
              <h3>
                Three positions. <span className="serif">Zero guessing.</span>
              </h3>
            </div>
            <span className="pill">7 PT STOP</span>
          </div>
          <div className="target-cards">
            {[1, 2, 3].map((i) => (
              <div className={`target-card target-card-${i}`} key={i}>
                <span>TAKE PROFIT {i}</span>
                <strong>
                  {i * 7}
                  <small>points</small>
                </strong>
                <div className="target-track">
                  {[1, 2, 3].map((j) => (
                    <i className={j <= i ? "filled" : ""} key={j} />
                  ))}
                </div>
                <span>{i}R on this position</span>
              </div>
            ))}
          </div>
          <Note>
            With equal sizes, all targets together return 2R on total setup
            risk. The final position has a 3R target. One point here means a $1
            move in gold.
          </Note>
          <a href="#/calculator" className="inline-link">
            Work out your position sizes <Crosshair size={15} />
          </a>
        </div>
        <div className="checklist-panel panel">
          <Checklist
            items={checks}
            checked={checked}
            onToggle={toggle}
            onReset={() => setChecked([])}
          />
        </div>
      </section>
      <div className="quiet-banner">
        <ShieldCheck size={22} />
        <p>
          Protect the account. Respect the plan.{" "}
          <span>Let the next trade be just another trade.</span>
        </p>
        <a href="#/home">The ELTOFX mindset</a>
      </div>
      <p className="schedule-note">
        All schedule times use America/New_York (EST in winter, EDT in summer).
        Asia is the ELTOFX 8 PM trading window, not an exchange opening time.
        Weekends are skipped; verify broker holiday hours.
      </p>
    </>
  );
}
