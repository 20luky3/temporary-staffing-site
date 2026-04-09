import { useState, useRef, useEffect } from "react";
import "./MultiSelectDropdown.css"

function MultiSelectDropdown({ options, value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  // close when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function toggleOption(val) {
    if (value.includes(val)) {
      onChange(value.filter((v) => v !== val));
    } else {
      onChange([...value, val]);
    }
  }

  return (
    <div className="multi-select" ref={ref}>
      <div className="multi-select-header" onClick={() => setOpen(!open)}>
        {value.length > 0 ? value.join(", ") : "All"}
      </div>

      {open && (
        <div className="multi-select-dropdown">
          {options.map((opt) => (
            <label key={opt.value} className="multi-select-option">
              <input
                type="checkbox"
                checked={value.includes(opt.value)}
                onChange={() => toggleOption(opt.value)}
              />
              {opt.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

export default MultiSelectDropdown;