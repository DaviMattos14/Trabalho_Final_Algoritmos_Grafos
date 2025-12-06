import React, { useState, useRef, useEffect } from "react";
import { useOutletContext } from "react-router-dom";

export default function Combobox({
  label = "",
  options = [],
  value: controlledValue,
  defaultValue = "",
  onChange,
  placeholder = "",
  disabled = false,
  required = false,
  error = "",
  id,
}) {
  const isControlled = controlledValue !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const value = isControlled ? controlledValue : uncontrolledValue;
  const { isDarkMode } = useOutletContext();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(defaultValue);
  const wrapperRef = useRef(null);

  const parsedOptions = options.map((opt) =>
    typeof opt === "string" ? { label: opt, value: opt } : opt
  );

  const filtered = query
    ? parsedOptions.filter((opt) =>
        opt.label.toLowerCase().includes(query.toLowerCase())
      )
    : parsedOptions;

  function selectOption(opt) {
    if (!isControlled) setUncontrolledValue(opt.value);
    if (onChange) onChange(opt.value);
    setQuery("");
    setOpen(false);
  }

  useEffect(() => {
    function handleOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const styles = {
    wrapper: {
      width: "100%",
      maxWidth: "500px",
      position: "relative",
      marginBottom: "12px",
      fontFamily: "Inter"
    },
    label: {
      display: "block",
      marginBottom: "4px",
      fontSize: "1.25rem",
      fontWeight: 600,
      color: isDarkMode ? '#ffffffff' : '#111827',
      fontFamily: "Inter"
    },
    input: {
      width: "100%",
      padding: "12px 10px",
      borderRadius: "8px",
      border: error ? "2px solid #e53935" : `2px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
      outline: "none",
      fontSize: "1rem",
      boxSizing: "border-box",
      fontFamily: "Inter"
    },
    list: {
      width: "100%",
      position: "absolute",
      top: "100%",
      left: 0,
      right: 0,
      background: "white",
      border: `1px solid ${isDarkMode ? '#ffffffff' : '#111827'}`,
      borderRadius: "8px",
      marginTop: "4px",
      maxHeight: "160px",
      overflowY: "auto",
      zIndex: 10,
      boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
      listStyle: "none",
      padding: 0,
      fontFamily: "Inter"
    },
    item: {
      padding: "8px 10px",
      cursor: "pointer",
      fontFamily: "Inter"
    },
    itemHover: {
      background: "#f0f0f0",
    },
    empty: {
      padding: "8px 10px",
      color: "#777",
      fontSize: "1rem",
      fontFamily: "Inter"
    },
    errorText: {
      fontSize: "1rem",
      color: "#e53935",
      marginTop: "4px",
      fontFamily: "Inter"
    },
  };

  return (
    <div style={styles.wrapper} ref={wrapperRef}>
      {label && (
        <label htmlFor={id} style={styles.label}>
          {label} {required && <span style={{ color: "#e53935" }}>*</span>}
        </label>
      )}

      <input
        id={id}
        disabled={disabled}
        placeholder={placeholder}
        value={open ? query : value}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          setQuery("");
          setOpen(true);
        }}
        style={styles.input}
      />

      {open && !disabled && (
        <ul style={styles.list} role="listbox">
          {filtered.length === 0 && (
            <li style={styles.empty}>Nenhum resultado</li>
          )}

          {filtered.map((opt) => (
            <li
              key={opt.value}
              style={styles.item}
              onMouseDown={() => selectOption(opt)}
              onMouseEnter={(e) => (e.target.style.background = "#f0f0f0")}
              onMouseLeave={(e) => (e.target.style.background = "white")}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}

      {error && <p style={styles.errorText}>{error}</p>}
    </div>
  );
}
