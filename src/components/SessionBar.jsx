import { useEffect, useState } from "react";
import { Clock3, Globe2, Sunrise } from "lucide-react";
import {
  countdown,
  getNextSession,
  SESSIONS,
  TIME_ZONE,
} from "../lib/sessions.js";

export default function SessionBar() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);
  const next = getNextSession(now);
  return (
    <section className="session-strip reveal" aria-label="Trading schedule">
      <div className="session-intro">
        <Clock3 size={18} />
        <div>
          <span className="label">TWO WINDOWS. ONE FOCUS.</span>
          <span className="muted">One setup per session.</span>
        </div>
      </div>
      {SESSIONS.map((session) => (
        <div className="session-time" key={session.id}>
          {session.id === "ny" ? <Sunrise size={22} /> : <Globe2 size={22} />}
          <div>
            <span className="session-name">
              {session.name}
              <span className="muted">{session.days}</span>
            </span>
            <strong>
              {session.time} <span>ET</span>
            </strong>
          </div>
        </div>
      ))}
      <div className="session-countdown">
        <span className="label">NEXT · {next.name.toUpperCase()}</span>
        <strong>{countdown(next.start, now)}</strong>
        <span className="microcopy">
          {new Intl.DateTimeFormat("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            timeZone: TIME_ZONE,
          }).format(next.start)}
        </span>
      </div>
    </section>
  );
}
