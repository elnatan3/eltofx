import { Check, ChevronDown, CircleHelp, RotateCcw } from "lucide-react";

export function Logo({ compact = false }) {
  return (
    <a className="brand" href="#/strategy" aria-label="ELTOFX strategy">
      <span className="brand-symbol">
        <svg viewBox="0 0 32 32" aria-hidden="true">
          <path d="M9 5h20L15 15h12L4 28l9-13H4Z" fill="currentColor" />
        </svg>
      </span>
      {!compact && (
        <span>
          ELTO<span className="brand-fx">FX</span>
          <span className="brand-period">.</span>
        </span>
      )}
    </a>
  );
}

export function Eyebrow({ children, className = "" }) {
  return (
    <div className={`eyebrow ${className}`}>
      <span className="eyebrow-line" />
      {children}
    </div>
  );
}

export function PageTitle({ eyebrow, title, accent, description, children }) {
  return (
    <div className="page-heading reveal">
      <div>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1>
          {title} <span className="serif lime">{accent}</span>
        </h1>
        <p>{description}</p>
      </div>
      {children}
    </div>
  );
}

export function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step = "any",
  prefix,
  suffix,
  help,
  id,
  ...rest
}) {
  return (
    <label className="field" htmlFor={id}>
      <span className="field-label">
        {label}
        {help && (
          <span className="field-help" title={help}>
            <CircleHelp size={14} aria-label={help} />
          </span>
        )}
      </span>
      <span className="input-shell">
        {prefix && <span className="input-affix">{prefix}</span>}
        <input
          id={id}
          aria-label={label}
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) =>
            onChange(e.target.value === "" ? "" : Number(e.target.value))
          }
          {...rest}
        />
        {suffix && <span className="input-affix">{suffix}</span>}
      </span>
    </label>
  );
}

export function SelectField({ label, value, onChange, options, id }) {
  return (
    <label className="field" htmlFor={id}>
      <span className="field-label">{label}</span>
      <span className="input-shell select-shell">
        <select
          id={id}
          aria-label={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown size={16} aria-hidden="true" />
      </span>
    </label>
  );
}

export function Segmented({ label, options, value, onChange }) {
  return (
    <div className="segmented" role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={value === option.value ? "selected" : ""}
          aria-pressed={value === option.value}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function Checklist({ items, checked, onToggle, onReset }) {
  return (
    <div className="checklist">
      <div className="checklist-head">
        <span className="label">PRE-FLIGHT CHECK</span>
        <button
          className="icon-button"
          onClick={onReset}
          title="Reset checklist"
          aria-label="Reset checklist"
        >
          <RotateCcw size={15} />
        </button>
      </div>
      {items.map((item, i) => (
        <label
          key={item}
          className={`check-item ${checked.includes(i) ? "checked" : ""}`}
        >
          <input
            type="checkbox"
            checked={checked.includes(i)}
            onChange={() => onToggle(i)}
          />
          <span className="check-box">
            {checked.includes(i) && <Check size={13} strokeWidth={3} />}
          </span>
          <span>{item}</span>
        </label>
      ))}
      <div className="checklist-progress">
        <div style={{ width: `${(checked.length / items.length) * 100}%` }} />
      </div>
      <span className="microcopy">
        {checked.length} of {items.length} checked
        {checked.length === items.length
          ? " · Plan reviewed."
          : " · Every detail matters."}
      </span>
    </div>
  );
}

export function Note({ children, className = "" }) {
  return (
    <div className={`note ${className}`}>
      <CircleHelp size={16} aria-hidden="true" />
      <p>{children}</p>
    </div>
  );
}

export function FAQ({ items }) {
  return (
    <div className="faq">
      {items.map((item) => (
        <details key={item.question}>
          <summary>
            {item.question}
            <ChevronDown size={18} />
          </summary>
          <p>{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
