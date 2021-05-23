import React, {useState} from "react";
import PropTypes from "prop-types";
import "./InputField.component.scss";

const InputField = props => {
  const {formId, id, inputClasses, label, labelClasses, layoutClasses, min, max, onChange, required, shrunk, type, value} = props;
  const key = formId + "-" + id;
  const [focussed, setFocussed] = useState(false);

  return (
    <div className={`c-InputField row${layoutClasses ? " " + layoutClasses : ""}`}>
      <div className="col-12 position-relative">
        <input id={id} key={key} type={type}
          className={`${type !== "checkbox" ? " w-100" : ""}${inputClasses ? " " + inputClasses : ""}`}
          onChange={(e) => onChange(formId, id, e.target.value)}
          value={value}
          required={required}
          onFocus={() => setFocussed(true)}
          onBlur={() => setFocussed(false)}
          min={min ? min : -999999999}
          max={max ? max : 9999999999} />
        <label htmlFor={id} className={type !== "checkbox" ? `position-absolute label-contained${value || focussed || shrunk ? " shrunk" : " normal"}${labelClasses ? " " + labelClasses : ""}` : labelClasses}>{label}</label>
      </div>
    </div>
  );
};

InputField.propTypes = {
  formId: PropTypes.string,
  id: PropTypes.string,
  inputClasses: PropTypes.string,
  label: PropTypes.string,
  labelClasses: PropTypes.string,
  layoutClasses: PropTypes.string,
  min: PropTypes.number,
  max: PropTypes.number,
  onChange: PropTypes.func,
  required: PropTypes.bool,
  shrunk: PropTypes.bool,
  type: PropTypes.string,
  value: PropTypes.string
};

export default InputField;