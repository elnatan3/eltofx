// Here a gold point is a $1.00 movement per troy ounce, NOT a broker tick.
export const STOP = 7;
export const TARGETS = [7, 14, 21];
export const ALLOCATIONS = {
  equal: [1 / 3, 1 / 3, 1 / 3],
  defensive: [0.5, 0.25, 0.25],
};

export function money(value, digits = 2) {
  if (!Number.isFinite(value)) return "—";
  if (Math.abs(value) >= 1e12) return `$${value.toExponential(2)}`;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);
}

export function compactMoney(value) {
  if (Math.abs(value) >= 1e12) return `$${value.toExponential(1)}`;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function positionPlan({
  balance,
  riskPercent,
  entry,
  side = "buy",
  weights = ALLOCATIONS.equal,
  contract = 100,
  lotStep = 0.01,
  minLot = lotStep,
  commission = 0,
}) {
  if (
    ![
      balance,
      riskPercent,
      entry,
      contract,
      lotStep,
      minLot,
      commission,
      ...weights,
    ].every(Number.isFinite) ||
    balance <= 0 ||
    balance > 1e12 ||
    riskPercent <= 0 ||
    riskPercent > 100 ||
    entry <= 21 ||
    entry > 1e9 ||
    contract < 0.001 ||
    contract > 1e6 ||
    lotStep < 0.000001 ||
    minLot < 0.000001 ||
    commission < 0 ||
    weights.length !== 3 ||
    weights.some((w) => w < 0) ||
    Math.abs(weights.reduce((a, b) => a + b, 0) - 1) > 0.000001 ||
    !["buy", "sell"].includes(side)
  )
    return null;
  const budget = (balance * riskPercent) / 100;
  const riskPerLot = STOP * contract + commission;
  const sign = side === "buy" ? 1 : -1;
  const legs = weights.map((weight, i) => {
    const theoreticalLot = (budget * weight) / riskPerLot;
    const rounded = Number(
      (Math.floor(theoreticalLot / lotStep + 1e-9) * lotStep).toFixed(8),
    );
    const lots = rounded + 1e-10 >= minLot ? rounded : 0;
    const fee = lots * commission;
    return {
      target: TARGETS[i],
      weight,
      theoreticalLot,
      lots,
      fee,
      price: entry + sign * TARGETS[i],
      risk: lots * riskPerLot,
      grossProfit: lots * contract * TARGETS[i],
      profit: lots * contract * TARGETS[i] - fee,
    };
  });
  const actualRisk = legs.reduce((sum, leg) => sum + leg.risk, 0);
  const totalProfit = legs.reduce((sum, leg) => sum + leg.profit, 0);
  return {
    budget,
    actualRisk,
    legs,
    totalProfit,
    stopPrice: entry - sign * STOP,
    totalLots: legs.reduce((sum, leg) => sum + leg.lots, 0),
    rewardRisk: actualRisk ? totalProfit / actualRisk : 0,
    undersized: legs.some((leg) => leg.lots === 0),
    outcomes: [
      { label: "All three hit SL", value: -actualRisk },
      {
        label: "TP1 · others hit SL",
        value: legs[0].profit - legs[1].risk - legs[2].risk,
      },
      {
        label: "TP1 + TP2 · last at entry",
        value: legs[0].profit + legs[1].profit - legs[2].fee,
      },
      { label: "All three targets hit", value: totalProfit },
    ],
  };
}

export function binomialDistribution(trades, probability) {
  if (
    !Number.isInteger(trades) ||
    trades < 0 ||
    trades > 500 ||
    !Number.isFinite(probability) ||
    probability < 0 ||
    probability > 1
  )
    return [];
  let distribution = [1];
  for (let t = 0; t < trades; t++) {
    const next = Array(t + 2).fill(0);
    distribution.forEach((mass, wins) => {
      next[wins] += mass * (1 - probability);
      next[wins + 1] += mass * probability;
    });
    distribution = next;
  }
  return distribution;
}

export function balanceAfter(balance, riskFraction, rr, trades, wins) {
  return (
    balance *
    (1 + riskFraction * rr) ** wins *
    (1 - riskFraction) ** (trades - wins)
  );
}

function quantile(distribution, q) {
  let sum = 0;
  for (let wins = 0; wins < distribution.length; wins++) {
    sum += distribution[wins];
    if (sum >= q - 1e-12) return wins;
  }
  return distribution.length - 1;
}

// Exact probability of at least one run of `length` consecutive losses.
export function losingStreakProbability(trades, winProbability, length) {
  if (
    !Number.isInteger(trades) ||
    trades < 0 ||
    !Number.isInteger(length) ||
    length < 1 ||
    !Number.isFinite(winProbability) ||
    winProbability < 0 ||
    winProbability > 1
  )
    return 0;
  if (length > trades) return 0;
  let states = Array(length).fill(0);
  states[0] = 1;
  let hit = 0;
  for (let t = 0; t < trades; t++) {
    const next = Array(length).fill(0);
    states.forEach((mass, run) => {
      next[0] += mass * winProbability;
      if (run + 1 === length) hit += mass * (1 - winProbability);
      else next[run + 1] += mass * (1 - winProbability);
    });
    states = next;
  }
  return Math.min(1, Math.max(0, hit));
}

export function probabilityModel({
  balance,
  riskPercent,
  rr,
  winRate,
  trades,
  target,
  streak = 5,
}) {
  if (
    ![balance, riskPercent, rr, winRate, trades, target, streak].every(
      Number.isFinite,
    ) ||
    balance <= 0 ||
    balance > 1e12 ||
    riskPercent <= 0 ||
    riskPercent > 50 ||
    rr <= 0 ||
    rr > 10 ||
    winRate < 0 ||
    winRate > 100 ||
    !Number.isInteger(trades) ||
    trades < 1 ||
    trades > 200 ||
    target <= 0 ||
    !Number.isInteger(streak) ||
    streak < 1 ||
    streak > 20
  )
    return null;
  const p = winRate / 100;
  const r = riskPercent / 100;
  let distribution = [1];
  const fan = [{ trade: 0, low: balance, median: balance, high: balance }];
  for (let t = 1; t <= trades; t++) {
    const next = Array(t + 1).fill(0);
    distribution.forEach((mass, wins) => {
      next[wins] += mass * (1 - p);
      next[wins + 1] += mass * p;
    });
    distribution = next;
    fan.push({
      trade: t,
      low: balanceAfter(balance, r, rr, t, quantile(distribution, 0.1)),
      median: balanceAfter(balance, r, rr, t, quantile(distribution, 0.5)),
      high: balanceAfter(balance, r, rr, t, quantile(distribution, 0.9)),
    });
  }
  const balances = distribution.map((probability, wins) => ({
    wins,
    probability,
    balance: balanceAfter(balance, r, rr, trades, wins),
  }));
  const sumIf = (predicate) =>
    balances.reduce(
      (sum, outcome) =>
        sum + (predicate(outcome.balance) ? outcome.probability : 0),
      0,
    );
  return {
    fan,
    distribution: balances,
    expected: balance * (1 + r * (p * rr - (1 - p))) ** trades,
    median: fan.at(-1).median,
    profitProbability: sumIf((value) => value > balance * (1 + 1e-10)),
    targetProbability: sumIf((value) => value >= target * (1 - 1e-10)),
    lossProbability: sumIf((value) => value < balance * (1 - 1e-10)),
    expectancy: p * rr - (1 - p),
    breakEvenWinRate: 100 / (1 + rr),
    geometricBreakEven:
      (-Math.log(1 - r) / (Math.log(1 + r * rr) - Math.log(1 - r))) * 100,
    streakProbability: losingStreakProbability(trades, p, streak),
    streakDrawdown: (1 - (1 - r) ** streak) * 100,
  };
}
