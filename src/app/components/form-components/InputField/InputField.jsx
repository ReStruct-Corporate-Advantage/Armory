import React, {useState} from "react";
import PropTypes from "prop-types";
import "./InputField.component.scss";

const InputField = props => {
  const {formId, id, inputClasses, inputStyles, label, labelClasses, labelStyles, layoutClasses, min, max, onChange, readOnly, required, shrunk, shrunkable, type, value} = props;
  const key = formId + "-" + id;
  const [focussed, setFocussed] = useState(false);

  return (
    <div className={`c-InputField row${layoutClasses ? " " + layoutClasses : ""}`}>
      <div className="col-12 position-relative">
        <input id={id} key={key} type={type}
          className={`${type !== "checkbox" ? " w-100" : ""}${inputClasses ? " " + inputClasses : ""}`}
          style={inputStyles}
          onChange={(e) => onChange ? onChange(formId, id, e.target.value) : {}}
          value={value}
          required={required}
          onFocus={() => setFocussed(true)}
          onBlur={() => setFocussed(false)}
          min={min ? min : -999999999}
          max={max ? max : 9999999999}
          disabled={readOnly} />
        {/* <label htmlFor={id} className={type !== "checkbox" ? `position-absolute label-contained${(shrunkable && (value || focussed || shrunk)) ? " shrunk" : " normal"}${labelClasses ? " " + labelClasses : ""}` : labelClasses}>{label}</label> */}
        <label htmlFor={id} className={type !== "checkbox" ? `position-absolute label-contained${(shrunkable && (value || focussed || shrunk)) ? " shrunk" : " normal"}${labelClasses ? " " + labelClasses : ""}` : labelClasses} style={labelStyles}>{label}</label>
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
  readOnly: PropTypes.bool,
  required: PropTypes.bool,
  shrunkable: PropTypes.bool,
  shrunk: PropTypes.bool,
  type: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

export default InputField;