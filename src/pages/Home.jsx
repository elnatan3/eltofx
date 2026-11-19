import {
  BookOpen,
  Crosshair,
  Heart,
  Hourglass,
  Layers3,
  ShieldCheck,
  Target,
} from "lucide-react";
import { Eyebrow, FAQ } from "../components/UI.jsx";

const principles = [
  {
    icon: ShieldCheck,
    title: "Protect your capital.",
    text: "Decide what the entire setup can lose before placing an order. Three positions share one risk budget. Size down when the numbers call for it.",
  },
  {
    icon: Hourglass,
    title: "Learn to do nothing.",
    text: "A session is an opportunity to observe. You do not owe the market a trade. No aligned zone, no clear invalidation, no entry.",
  },
  {
    icon: Layers3,
    title: "Think in probabilities.",
    text: "A good setup can lose. A bad decision can win. Judge the process over a meaningful sample, including fees, partial exits, and losing streaks.",
  },
  {
    icon: BookOpen,
    title: "Keep your own receipts.",
    text: "Journal the chart, entry, risk, exits, and reason for the trade. Review what actually happened instead of remembering only the best trades.",
  },
];

export default function Home() {
  return (
    <>
      <section className="about-hero reveal">
        <div>
          <Eyebrow>THE MINDSET BEHIND THE METHOD</Eyebrow>
          <h1>
            The discipline.
            <br />
            Behind the <span className="serif lime">trade.</span>
          </h1>
          <p>
            ELTOFX is a place to slow down, understand your risk, and approach
            the gold market with a plan you can actually follow.
          </p>
          <a href="#/strategy" className="button button-primary">
            <Crosshair size={17} />
            Get to know the strategy
          </a>
        </div>
        <div className="experience-art">
          <div className="experience-rings">
            <span />
            <span />
            <span />
          </div>
          <strong>
            2<span className="serif">years</span>
          </strong>
          <div className="experience-caption">
            <span>IN THE MARKETS.</span>
            <p>
              Always learning.
              <br />
              Always refining.
            </p>
          </div>
        </div>
      </section>
      <section className="story-section">
        <Eyebrow>OUR STORY</Eyebrow>
        <div>
          <h2>
            Two years of screen time.
            <br />
            <span className="muted">A simpler way to show up.</span>
          </h2>
          <p>
            ELTOFX grew out of two years of trading and learning. The focus is
            gold. The approach is straightforward: follow the higher time frame
            trend, wait for supply or demand, define the risk, and give each
            position a job.
          </p>
          <p>
            This is an evolving trading playbook and a set of practical tools.
            There are no memberships or products to buy. Just the method, the
            math, and the work of getting more consistent.
          </p>
          <span className="story-signature">
            Stay patient. Stay intentional.
          </span>
        </div>
      </section>
      <div className="section-title">
        <div>
          <Eyebrow>KEEP THESE CLOSE</Eyebrow>
          <h2>
            The habits that <span className="serif">come first.</span>
          </h2>
        </div>
      </div>
      <section className="principles-grid">
        {principles.map(({ icon: Icon, title, text }) => (
          <article className="principle-card panel" key={title}>
            <span className="principle-icon">
              <Icon size={23} />
            </span>
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </section>
      <section className="mindset-quote">
        <span className="giant-quote">“</span>
        <blockquote>
          You don’t need every move.
          <br />
          You need a process <span className="serif lime">you respect.</span>
        </blockquote>
        <span className="label">THE ELTOFX PHILOSOPHY</span>
      </section>
      <section className="faq-section">
        <div>
          <Eyebrow>A FEW THINGS TO KNOW</Eyebrow>
          <h2>
            Clear from
            <br />
            <span className="serif">the start.</span>
          </h2>
          <Heart size={25} className="lime" />
        </div>
        <FAQ
          items={[
            {
              question: "Is ELTOFX a signal service?",
              answer:
                "ELTOFX shares an educational playbook and calculators. The site does not place orders, supply live trade signals, or manage money.",
            },
            {
              question: "Does this strategy guarantee a profit?",
              answer:
                "No. A supply or demand zone may fail, stops may slip, and the market can behave differently from the past. Two years of experience is a statement of time spent learning, not a verified performance record.",
            },
            {
              question: "Why only one trade per session?",
              answer:
                "That is the ELTOFX limit for keeping decisions deliberate. It is a maximum of one setup, split into three positions. Skipping a session is part of the plan.",
            },
            {
              question: "What should I know before using the calculators?",
              answer:
                "The position calculator assumes a USD account and a $1 price move per point. Confirm contract size, minimum lot, lot step, commission, and execution terms with your broker. Probability inputs are assumptions, not an estimate of your actual edge.",
            },
          ]}
        />
      </section>
      <div className="bottom-cta">
        <div>
          <Target size={24} />
          <h3>
            Give the next trade <span className="serif">a plan.</span>
          </h3>
        </div>
        <a className="button button-primary" href="#/calculator">
          Open the risk calculator
        </a>
      </div>
    </>
  );
}
