import test from "node:test";
import assert from "node:assert/strict";
import {
  SESSIONS,
  countdown,
  getNextSession,
  nextSession,
} from "../src/lib/sessions.js";

test("NY session uses EST in winter and EDT in summer", () => {
  assert.equal(
    nextSession(SESSIONS[0], new Date("2026-11-19T12:00:00Z")).toISOString(),
    "2026-11-19T14:30:00.000Z",
  );
  assert.equal(
    nextSession(SESSIONS[0], new Date("2026-07-16T12:00:00Z")).toISOString(),
    "2026-07-16T13:30:00.000Z",
  );
});

test("weekends skip to Monday NY or Sunday evening Asia", () => {
  const saturday = new Date("2026-11-21T18:00:00Z");
  assert.equal(
    nextSession(SESSIONS[0], saturday).toISOString(),
    "2026-11-23T14:30:00.000Z",
  );
  assert.equal(
    nextSession(SESSIONS[1], saturday).toISOString(),
    "2026-11-23T01:00:00.000Z",
  );
  assert.equal(getNextSession(saturday).id, "asia");
});

test("Friday after NY does not invent a Friday-night Asia setup", () => {
  assert.equal(
    getNextSession(new Date("2026-11-20T16:00:00Z")).start.toISOString(),
    "2026-11-23T01:00:00.000Z",
  );
});

test("session conversion stays correct across daylight-saving weekends", () => {
  assert.equal(
    nextSession(SESSIONS[1], new Date("2026-03-07T12:00:00Z")).toISOString(),
    "2026-03-09T00:00:00.000Z",
  );
  assert.equal(
    nextSession(SESSIONS[1], new Date("2026-10-31T12:00:00Z")).toISOString(),
    "2026-11-02T01:00:00.000Z",
  );
});

test("countdown uses total hours and never returns negative time", () => {
  assert.equal(
    countdown(
      new Date("2026-11-19T14:30:00Z"),
      new Date("2026-11-19T13:00:00Z"),
    ),
    "01:30:00",
  );
  assert.equal(
    countdown(
      new Date("2026-11-19T13:00:00Z"),
      new Date("2026-11-19T14:30:00Z"),
    ),
    "00:00:00",
  );
});
