import test from "node:test";
import assert from "node:assert/strict";
import {
  ALLOCATIONS,
  balanceAfter,
  binomialDistribution,
  losingStreakProbability,
  positionPlan,
  probabilityModel,
} from "../src/lib/finance.js";

const near = (actual, expected, tolerance = 1e-8) =>
  assert.ok(
    Math.abs(actual - expected) < tolerance,
    `${actual} should equal ${expected}`,
  );
const positionInputs = { balance: 21000, riskPercent: 1, entry: 4000 };
const probabilityInputs = {
  balance: 100,
  riskPercent: 10,
  rr: 2,
  winRate: 50,
  trades: 1,
  target: 120,
  streak: 2,
};

test("equal gold lots produce the correct combined reward and partial outcomes", () => {
  const plan = positionPlan(positionInputs);
  assert.deepEqual(
    plan.legs.map((leg) => leg.lots),
    [0.1, 0.1, 0.1],
  );
  near(plan.actualRisk, 210);
  near(plan.totalProfit, 420);
  near(plan.rewardRisk, 2);
  near(plan.outcomes[0].value, -210);
  near(plan.outcomes[1].value, -70);
  near(plan.outcomes[2].value, 210);
  near(plan.outcomes[3].value, 420);
});

test("a 50/25/25 allocation breaks even after TP1 and two original stops", () => {
  const plan = positionPlan({
    ...positionInputs,
    balance: 28000,
    weights: ALLOCATIONS.defensive,
  });
  assert.deepEqual(
    plan.legs.map((leg) => leg.lots),
    [0.2, 0.1, 0.1],
  );
  near(plan.outcomes[1].value, 0);
  near(plan.rewardRisk, 1.75);
  near(plan.outcomes[2].value, 280);
});

test("a short mirrors target and stop prices", () => {
  const plan = positionPlan({ ...positionInputs, side: "sell" });
  assert.equal(plan.stopPrice, 4007);
  assert.deepEqual(
    plan.legs.map((leg) => leg.price),
    [3993, 3986, 3979],
  );
});

test("lot rounding stays inside the total risk budget including round-trip fees", () => {
  for (const balance of [50, 99, 1000, 5000, 10000]) {
    const plan = positionPlan({
      ...positionInputs,
      balance,
      riskPercent: 3,
      commission: 7,
    });
    assert.ok(plan.actualRisk <= plan.budget + 1e-8);
    assert.ok(plan.legs.every((leg) => leg.lots >= 0));
  }
  const exact = positionPlan({
    ...positionInputs,
    balance: 21210,
    commission: 7,
  });
  near(exact.actualRisk, 212.1);
  near(exact.outcomes[2].value, 207.9); // Last position exits at entry but still pays its fee.
});

test("undersized legs are zero, not rounded up beyond the budget", () => {
  const tiny = positionPlan({ ...positionInputs, balance: 50 });
  assert.equal(tiny.actualRisk, 0);
  assert.equal(tiny.undersized, true);
  const minimum = positionPlan({ ...positionInputs, minLot: 0.2 });
  assert.deepEqual(
    minimum.legs.map((leg) => leg.lots),
    [0, 0, 0],
  );
});

test("invalid risk inputs and non-normalized allocations are rejected", () => {
  assert.equal(positionPlan({ ...positionInputs, balance: "" }), null);
  assert.equal(
    positionPlan({ ...positionInputs, weights: [0.5, 0.5, 0.5] }),
    null,
  );
  assert.equal(positionPlan({ ...positionInputs, riskPercent: 101 }), null);
  assert.equal(positionPlan({ ...positionInputs, lotStep: 0 }), null);
});

test("binomial distributions normalize and handle zero and perfect win rates", () => {
  assert.deepEqual(binomialDistribution(3, 0), [1, 0, 0, 0]);
  assert.deepEqual(binomialDistribution(3, 1), [0, 0, 0, 1]);
  assert.deepEqual(binomialDistribution(2, 0.5), [0.25, 0.5, 0.25]);
  near(
    binomialDistribution(200, 0.51).reduce((sum, p) => sum + p, 0),
    1,
  );
});

test("one-trade probabilities and compounded expectancy are exact", () => {
  const model = probabilityModel(probabilityInputs);
  near(model.expected, 105);
  near(model.median, 90);
  near(model.profitProbability, 0.5);
  near(model.targetProbability, 0.5);
  near(model.breakEvenWinRate, 100 / 3);
  near(model.expectancy, 0.5);
  near(balanceAfter(100, 0.1, 2, 2, 1), 108);
});

test("distribution-weighted final balances equal closed-form expectation", () => {
  const model = probabilityModel({
    ...probabilityInputs,
    trades: 40,
    riskPercent: 2,
    winRate: 60,
  });
  const average = model.distribution.reduce(
    (sum, row) => sum + row.balance * row.probability,
    0,
  );
  near(average, model.expected);
  assert.ok(model.geometricBreakEven > model.breakEvenWinRate);
});

test("zero and perfect win rates have deterministic outcomes and finite fan charts", () => {
  for (const winRate of [0, 100]) {
    const model = probabilityModel({
      ...probabilityInputs,
      trades: 20,
      winRate,
    });
    near(model.profitProbability, winRate === 100 ? 1 : 0);
    for (const row of model.fan) {
      near(row.low, row.median);
      near(row.high, row.median);
      assert.ok(Number.isFinite(row.median));
    }
  }
});

test("exact losing streak probabilities match enumerated small cases", () => {
  near(losingStreakProbability(3, 0.5, 2), 3 / 8);
  near(losingStreakProbability(4, 0.5, 2), 1 / 2);
  near(losingStreakProbability(10, 1, 3), 0);
  near(losingStreakProbability(10, 0, 3), 1);
  near(losingStreakProbability(2, 0.5, 3), 0);
});

test("invalid probability inputs never produce an unusable chart", () => {
  assert.equal(probabilityModel({ ...probabilityInputs, trades: 2.5 }), null);
  assert.equal(probabilityModel({ ...probabilityInputs, winRate: 101 }), null);
  assert.equal(
    probabilityModel({ ...probabilityInputs, riskPercent: 0 }),
    null,
  );
  assert.equal(probabilityModel({ ...probabilityInputs, streak: 0 }), null);
  assert.equal(
    probabilityModel({ ...probabilityInputs, balance: 1e308 }),
    null,
  );
});
