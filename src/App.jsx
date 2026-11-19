import { Component, useEffect, useState } from "react";
import { Crosshair, Menu, X } from "lucide-react";
import { Logo } from "./components/UI.jsx";
import Strategy from "./pages/Strategy.jsx";
import Home from "./pages/Home.jsx";
import Calculator from "./pages/Calculator.jsx";
import Probability from "./pages/Probability.jsx";
import Contact from "./pages/Contact.jsx";
import { newYorkClock } from "./lib/sessions.js";

const ROUTES = [
  { id: "strategy", label: "The strategy", component: Strategy },
  { id: "home", label: "Home", component: Home },
  { id: "calculator", label: "Risk calculator", component: Calculator },
  { id: "probability", label: "Probability lab", component: Probability },
  { id: "contact", label: "Contact", component: Contact },
];
const resolveRoute = () =>
  window.location.hash.replace(/^#\/?/, "") || "strategy";

function MarketClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 10000);
    return () => window.clearInterval(interval);
  }, []);
  return (
    <span className="market-clock">
      <span className="clock-mark" />
      NEW YORK <strong>{newYorkClock(now)} ET</strong>
    </span>
  );
}

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed)
      return (
        <div className="empty-state panel">
          <h1>Let’s get back on track.</h1>
          <p>Reload this page to reopen ELTOFX.</p>
          <button
            className="button button-primary"
            onClick={() => window.location.reload()}
          >
            Reload page
          </button>
        </div>
      );
    return this.props.children;
  }
}

export default function App() {
  const [route, setRoute] = useState(resolveRoute);
  const [menu, setMenu] = useState(false);
  const current = ROUTES.find((item) => item.id === route);
  useEffect(() => {
    const change = () => {
      setRoute(resolveRoute());
      setMenu(false);
      window.scrollTo({ top: 0, behavior: "instant" });
    };
    window.addEventListener("hashchange", change);
    return () => window.removeEventListener("hashchange", change);
  }, []);
  useEffect(() => {
    document.title = `${current?.label || "Page not found"} · ELTOFX`;
  }, [current]);
  useEffect(() => {
    if (!menu) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") {
        setMenu(false);
        document.getElementById("menu-toggle")?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menu]);
  const Page = current?.component;
  return (
    <div className="app">
      <a
        className="skip-link"
        href="#main-content"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById("main-content").focus();
        }}
      >
        Skip to content
      </a>
      <header className="site-header">
        <div className="header-inner">
          <Logo />
          <nav
            className={menu ? "main-nav open" : "main-nav"}
            aria-label="Main navigation"
            id="main-nav"
          >
            {ROUTES.map((item) => (
              <a
                href={`#/${item.id}`}
                key={item.id}
                className={route === item.id ? "active" : ""}
                aria-current={route === item.id ? "page" : undefined}
                onClick={() => setMenu(false)}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <a className="button header-cta" href="#/calculator">
            <Crosshair size={16} />
            Plan your trade
          </a>
          <button
            id="menu-toggle"
            className="menu-toggle icon-button"
            onClick={() => setMenu(!menu)}
            aria-label={menu ? "Close navigation" : "Open navigation"}
            aria-expanded={menu}
            aria-controls="main-nav"
          >
            {menu ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>
      </header>
      <div className="market-bar">
        <div className="site-shell">
          <span>
            <span className="gold-square" />
            XAUUSD <span className="muted">GOLD, WITH INTENTION.</span>
          </span>
          <MarketClock />
          <span className="market-bar-end">
            A CLEARER WAY TO APPROACH THE MARKETS
          </span>
        </div>
      </div>
      <main className="site-shell" id="main-content" tabIndex="-1">
        <ErrorBoundary key={route}>
          {Page ? (
            <Page />
          ) : (
            <div className="empty-state panel">
              <h1>This page wandered off.</h1>
              <p>The playbook is a good place to start.</p>
              <a href="#/strategy" className="button button-primary">
                Back to the strategy
              </a>
            </div>
          )}
        </ErrorBoundary>
      </main>
      <footer className="site-footer">
        <div className="site-shell">
          <div className="footer-top">
            <div>
              <Logo />
              <p>Trade less. Think clearer.</p>
            </div>
            <div className="footer-links">
              <a href="#/strategy">The playbook</a>
              <a href="#/calculator">The numbers</a>
              <a href="#/contact">Get in touch</a>
            </div>
            <span className="footer-motto">
              INDEPENDENT THINKING.
              <br />
              <span>INTENTIONAL TRADING.</span>
            </span>
          </div>
          <div className="footer-bottom">
            <p>
              © {new Date().getFullYear()} ELTOFX. Built for the long game.
            </p>
            <span>
              Educational content only. Trading involves risk. No guaranteed
              returns.
            </span>
            <a
              href="https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/CustomerAdvisory_MustKnowForex.html"
              target="_blank"
              rel="noreferrer"
            >
              Understand the risks
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
