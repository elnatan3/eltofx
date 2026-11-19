import { useState } from "react";
import {
  Check,
  Copy,
  Download,
  Mail,
  MessageSquare,
  Send,
  ShieldCheck,
} from "lucide-react";
import { CONTACT_EMAIL } from "../config.js";
import { downloadText } from "../lib/hooks.js";
import { Eyebrow, Note } from "../components/UI.jsx";

export default function Contact() {
  const [draft, setDraft] = useState(null);
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState("");
  const submit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const next = {
      name: data.get("name").trim(),
      email: data.get("email").trim(),
      topic: data.get("topic"),
      message: data.get("message").trim(),
    };
    if (!next.name || !next.message) {
      setFeedback("Please include your name and a message.");
      return;
    }
    setDraft(next);
    setCopied(false);
    setFeedback("Your draft is ready. Nothing has been sent.");
  };
  const text = draft
    ? `ELTOFX · ${draft.topic}\n\nFrom: ${draft.name}\nReply to: ${draft.email}\n\n${draft.message}`
    : "";
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setFeedback("Message copied.");
    } catch {
      setFeedback(
        "Copy is unavailable in this browser. You can download the message instead.",
      );
    }
  };
  return (
    <>
      <section className="contact-layout">
        <div className="contact-copy reveal">
          <Eyebrow>GOOD CONVERSATIONS START HERE</Eyebrow>
          <h1>
            Let’s talk
            <br />
            <span className="serif lime">markets.</span>
          </h1>
          <p>
            A question about the playbook? An idea for the tools? A lesson from
            your own trading? There’s room for the conversation.
          </p>
          <div className="contact-detail">
            <span>
              <Mail size={21} />
            </span>
            <div>
              <strong>Keep it personal.</strong>
              <p>
                {CONTACT_EMAIL ? (
                  <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
                ) : (
                  "Direct contact details are coming soon."
                )}
              </p>
            </div>
          </div>
          <div className="contact-detail">
            <span>
              <MessageSquare size={21} />
            </span>
            <div>
              <strong>Thoughtful questions welcome.</strong>
              <p>Strategy, risk math, feedback, and ideas.</p>
            </div>
          </div>
          <div className="contact-emblem">
            <svg viewBox="0 0 32 32" aria-hidden="true">
              <path d="M9 5h20L15 15h12L4 28l9-13H4Z" fill="currentColor" />
            </svg>
            <span>BUILT FOR THE LONG GAME.</span>
          </div>
        </div>
        <section className="contact-form-panel panel reveal">
          <div className="panel-heading">
            <div>
              <span className="label">YOUR THOUGHTS, IN YOUR WORDS</span>
              <h2>Leave a note.</h2>
            </div>
            <Mail size={23} className="lime" />
          </div>
          <form
            onSubmit={submit}
            onChange={() => {
              setDraft(null);
              setFeedback("");
            }}
          >
            <label className="field">
              <span className="field-label">Your name</span>
              <input
                className="text-input"
                name="name"
                autoComplete="name"
                placeholder="What should we call you?"
                maxLength="100"
                required
              />
            </label>
            <label className="field">
              <span className="field-label">Email address</span>
              <input
                className="text-input"
                name="email"
                autoComplete="email"
                type="email"
                placeholder="you@example.com"
                maxLength="254"
                required
              />
            </label>
            <label className="field">
              <span className="field-label">What’s on your mind?</span>
              <select className="text-input" name="topic">
                <option>Strategy question</option>
                <option>Calculator feedback</option>
                <option>Website feedback</option>
                <option>Something else</option>
              </select>
            </label>
            <label className="field">
              <span className="field-label">Your message</span>
              <textarea
                className="text-input"
                name="message"
                rows="5"
                placeholder="Tell us a little about it…"
                maxLength="5000"
                minLength="10"
                required
              />
            </label>
            <button className="button button-primary" type="submit">
              <Send size={16} />
              Prepare message
            </button>
            <span className="privacy-note">
              <ShieldCheck size={14} />
              This form prepares a local draft. Your message is not stored.
            </span>
          </form>
          <p role="status" className="contact-feedback">
            {feedback}
          </p>
          {draft && (
            <div className="message-draft">
              <h3>
                <Check size={17} />
                Ready when you are.
              </h3>
              <p>
                {CONTACT_EMAIL
                  ? "Open your email app to review and send this draft."
                  : "Direct messaging is not connected yet. Copy or download your note to keep it."}
              </p>
              <div className="draft-actions">
                {CONTACT_EMAIL && (
                  <a
                    className="button button-primary"
                    href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`ELTOFX: ${draft.topic}`)}&body=${encodeURIComponent(text)}`}
                  >
                    <Mail size={15} />
                    Open email draft
                  </a>
                )}
                <button className="button button-outline" onClick={copy}>
                  {copied ? <Check size={15} /> : <Copy size={15} />}
                  {copied ? "Copied" : "Copy message"}
                </button>
                <button
                  className="button button-outline"
                  onClick={() => downloadText("ELTOFX-message.txt", text)}
                >
                  <Download size={15} />
                  Download
                </button>
              </div>
            </div>
          )}
        </section>
      </section>
      <Note>
        ELTOFX is an educational project. Please keep account credentials,
        payment information, and other sensitive details out of your message.
      </Note>
    </>
  );
}
