# ELTOFX

A complete React website for an independent, gold-focused trading playbook. The design pairs an obsidian background with electric lime, metallic gold, italic display typography, interactive charts, and a pointer-responsive 3D gold sculpture.

## Start in VS Code on your Mac

1. Extract this ZIP. You will get an `eltofx` folder.
2. Install **Node.js 24 LTS** from [nodejs.org](https://nodejs.org/en/download) if you do not have a supported Node version. In Terminal, run `node -v` to check it. This project requires Node 22.12 or newer; Node 24 is recommended for a new installation.
3. Open VS Code. Choose **File → Open Folder**, then select the extracted `eltofx` folder. Open the folder containing `package.json`, not its parent.
4. Choose **Terminal → New Terminal** in VS Code.
5. Install the exact dependency versions from the included lockfile:

   ```bash
   npm ci
   ```

6. Start the website:

   ```bash
   npm run dev
   ```

7. Open the **Local** URL printed by Vite, normally `http://localhost:5173`. Keep the terminal running. Save changes in VS Code to update the browser automatically.
8. Press **Control+C** in the terminal when you want to stop the server. Use `npm run dev` to start it again later.

Do not open `index.html` by double-clicking it. React source needs the development server or a production build.

## What is included

| Page            | Features                                                                                                                                                                                   |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| The strategy    | Default/first tab; 3D gold candlesticks; animated CSS fallback; pause control; buy/sell concept chart; four-step walkthrough; pre-trade checklist; 7/14/21-point targets.                  |
| Home            | The two-year ELTOFX story, trading discipline, risk habits, and expandable FAQs. The experience statement comes from the supplied brand brief; no performance record is claimed.           |
| Risk calculator | Shared setup risk, long/short prices, equal or custom sizing, 50/25/25 preset, broker contract and lot settings, fees, rounded lots, partial-exit outcomes, and CSV export.                |
| Probability lab | Trade count, risk, win rate, R:R, ending-balance target, exact binomial outcomes, interactive percentile chart, log scale, win-rate comparisons, and exact consecutive-loss probabilities. |
| Contact         | Validated local draft form, copy, and text download. Add your email to enable a reviewed email draft.                                                                                      |

The schedule is **9:30 AM New York time** for the New York plan and **8:00 PM New York time** for the Asia plan. It follows `America/New_York`, switching automatically between EST and EDT. NY is scheduled Monday–Friday; Asia is Sunday–Thursday evening in New York, corresponding to the following Asian business day. The countdown skips weekends. Broker holidays are not integrated. The 8 PM Asia time is the chosen trading window, not a claim about an exchange's opening time.

Each session allows at most **one setup split into three positions**. Skipping a session is part of the playbook.

## The position math

The calculator assumes a **USD account** and defines one gold point as a **$1.00 movement per troy ounce**. This avoids ambiguous broker “point,” “pip,” or “tick” conventions.

For a buy entered at 4,000:

| Exit      | Distance   | Price |
| --------- | ---------- | ----- |
| Stop loss | −7 points  | 3,993 |
| TP1       | +7 points  | 4,007 |
| TP2       | +14 points | 4,014 |
| TP3       | +21 points | 4,021 |

For a sell, the signs reverse. The stop is 4,007 and the targets are 3,993, 3,986, and 3,979.

Default contract size is **100 troy ounces per 1.00 lot**. This is an editable example, not a universal broker specification. Minimum lot and lot increment are separate inputs. Lots are multiples of the lot step and must meet the minimum lot.

```text
Setup risk budget = account balance × risk percentage / 100
Risk per 1.00 lot = 7 × ounces per lot + round-trip fee per lot
Theoretical leg lots = setup risk budget × allocation / risk per 1.00 lot
Tradable leg lots = theoretical leg lots rounded DOWN to the lot increment
Leg risk = tradable lots × risk per 1.00 lot
Leg net TP = tradable lots × target points × ounces per lot − leg round-trip fee
```

The risk percentage applies to **all three positions together**. Rounding may leave unused risk. A leg below the minimum lot becomes zero and the site explains that the full three-position plan cannot be placed at those settings. The calculator does not increase size to use the entire budget.

With equal position sizes and no fees:

| Outcome                                          | Result on total setup risk |
| ------------------------------------------------ | -------------------------- |
| All three hit their original stops               | −1R                        |
| TP1 hits; the other two hit their original stops | −⅓R                        |
| TP1 and TP2 hit; the last exits at entry         | +1R                        |
| All three targets hit                            | +2R                        |

**TP3 is 3R for that individual position. It is not 3R for the whole setup.** The 50/25/25 preset makes TP1 plus two original stops roughly break even before costs, but lowers the full-target payout to 1.75R. Rounding and commission can change these ratios.

The TP2 partial scenario explicitly assumes the last stop moves to entry after TP2. The strategy page leaves stop changes as a decision to plan. A fill at entry still pays the configured commission. Spread, slippage, swaps, currency conversion, and margin checks are excluded. Stops can fill worse than requested.

## The probability math

This is an exact, **two-outcome hypothetical model**. Each setup either loses 1R or wins the selected reward multiple. It does **not** simulate the strategy's partial exits. The chosen R:R should describe a full setup's measured average winning payoff for the model you want to explore.

```text
B = starting balance
r = fraction of the CURRENT balance risked per setup
R = reward per unit of risk
p = assumed win probability
N = total setups
W = winning setups

Ending balance = B × (1 + rR)^W × (1 − r)^(N − W)
Expectancy in R = pR − (1 − p)
Expected ending balance = B × [1 + r × expectancy]^N
Arithmetic break-even win probability = 1 / (1 + R)
Log-growth break-even win probability = −ln(1 − r) / [ln(1 + rR) − ln(1 − r)]
```

Binomial probabilities are calculated with a dynamic recurrence rather than large factorials. Ending-profit and target probabilities sum the appropriate outcome masses. The chart shows exact 10th, 50th, and 90th percentile balances **at each trade count**. Its band is not the probability that one path stays inside the band throughout the sequence. The median can differ from the probability-weighted mean.

The consecutive-loss calculation uses a state machine tracking the current loss run, including overlapping runs. The displayed drawdown from a loss streak is `1 − (1 − r)^streakLength`. It is not a maximum drawdown forecast.

Inputs support 1–200 whole setups, assumed win rates from 0–100%, risk above 0 and up to 50%, and reward multiples above 0 and up to 10. Account balance is limited to $1 trillion to keep every supported projection finite. Setups are assumed independent with constant win probability, exact fills, full reinvestment, no costs, and no broker constraints. The target probability means **finishing at or above the target**, not hitting it earlier. These assumptions do not establish an actual trading edge.

## Customize it

| Change                        | File                                                                                                           |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Contact email                 | `src/config.js` — change `CONTACT_EMAIL` from an empty string to your real business email.                     |
| Brand story and advice        | `src/pages/Home.jsx`                                                                                           |
| Strategy and checklist        | `src/pages/Strategy.jsx`                                                                                       |
| Session windows and timezone  | `src/lib/sessions.js`                                                                                          |
| Stop and target distances     | `STOP` and `TARGETS` in `src/lib/finance.js`; update related page copy and diagram if you change the strategy. |
| Calculator defaults           | `DEFAULTS` in `Calculator.jsx` and `Probability.jsx`                                                           |
| Colors, layout, mobile styles | `src/styles.css`; color tokens are in `:root`.                                                                 |
| 3D materials and animation    | `src/components/GoldScene.jsx`                                                                                 |
| Illustration                  | `src/components/StrategyChart.jsx`                                                                             |
| Navigation and footer         | `src/App.jsx`                                                                                                  |

Contact form behavior is deliberate: **Prepare message** creates a local draft and says that nothing was sent. With an email configured, **Open email draft** opens the visitor's email app for review and sending. Without one, copy and download work. There is no backend or simulated success message. Contact data is never saved to local storage.

Calculator inputs are saved in this browser's local storage so revisiting a tab restores them. Reset buttons restore defaults. The checklist resets when the strategy page is reopened. There are no accounts, orders, subscriptions, live prices, tracking scripts, or API keys. Fonts are bundled through npm dependencies rather than loaded from a font service at runtime.

## Project structure

```text
eltofx/
  index.html
  package.json
  package-lock.json
  vite.config.js
  public/
    favicon.svg
  src/
    main.jsx
    App.jsx
    config.js
    styles.css
    components/
      GoldScene.jsx
      ProbabilityChart.jsx
      SessionBar.jsx
      StrategyChart.jsx
      UI.jsx
    lib/
      finance.js
      hooks.js
      sessions.js
    pages/
      Strategy.jsx
      Home.jsx
      Calculator.jsx
      Probability.jsx
      Contact.jsx
  tests/
    finance.test.js
    sessions.test.js
```

Routing uses hash URLs such as `#/calculator`, so a static host does not need rewrite rules. The strategy page is the first tab and default entry point.

## Check and build

```bash
npm test
npm run build
npm run preview
```

`npm test` runs 17 meaningful checks of lot sizing, shared risk, long/short price levels, fee handling, partial outcomes, binomial probabilities, distribution-weighted expectation, deterministic edge cases, overlapping loss runs, weekend scheduling, and EST/EDT transitions.

`npm run build` creates a deployable `dist` folder. `npm run preview` serves that build locally; open the printed URL. Upload the **contents** of `dist` to a static hosting provider when you are ready. The included ZIP also contains the production build produced during delivery.

The Three.js bundle is lazy-loaded only on the strategy page. It renders at a capped device-pixel ratio and pauses updates while off-screen or in a hidden tab. The pause button and reduced-motion system preference are respected. A CSS depth illustration is used when WebGL2 is unavailable. The delivery preview browser disables WebGL, so the CSS fallback was visually verified; the WebGL rendering branch should also be checked in your hardware-accelerated browser.

## If something does not start

- **`npm: command not found`:** Install Node from the official site and restart VS Code.
- **Node version error:** Install Node 24 LTS, reopen the terminal, and check `node -v`.
- **Cannot find `package.json`:** Open the extracted `eltofx` folder containing that file.
- **Port is busy:** Use the next Local URL Vite prints, or stop your other dev server with Control+C.
- **Blank page after double-clicking HTML:** Run `npm run dev` and use its Local URL.
- **The contact form does not send:** It prepares drafts by design. Configure your email in `src/config.js` to enable the email-app flow. A server-based inbox would be a separate integration.

## References and third-party components

- [Vite setup documentation](https://vite.dev/guide/)
- [React documentation](https://react.dev/learn)
- [Three.js documentation](https://threejs.org/docs/)
- [OANDA contract examples and trading hours](https://www.oanda.com/uk-en/trading/hours-of-operation/) — one example of gold contract sizing; verify your own broker's terms.
- [CFTC educational risk advisory](https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/CustomerAdvisory_MustKnowForex.html)

React, Vite, Three.js, and Lucide are third-party dependencies with their own licenses. DM Sans and Instrument Serif are distributed under the SIL Open Font License; copies of the font licenses are included in `public/licenses/` and the build. Dependency versions are recorded in `package-lock.json`.
