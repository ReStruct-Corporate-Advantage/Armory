import React from "react";
import PropTypes from "prop-types";
import "./CheckBox.component.scss";

const CheckBox = props => {
  const {alwaysDisabled, formId, id, inputClasses, inputStyles, label, labelClasses, labelStyles, layoutClasses, onChange, readOnly, required, value} = props;
  return (
    <div className={`c-CheckBox row${layoutClasses ? " " + layoutClasses : ""}`}>
      <div className="col-12 position-relative">
        <input id={id} type="checkbox"
          className={`${inputClasses ? " " + inputClasses : ""}`}
          style={inputStyles}
          onChange={e => onChange ? onChange(formId, id, e.target.checked) : {}}
          value={id}
          required={required}
          disabled={alwaysDisabled || readOnly}
          checked={value} />
        <label htmlFor={id} className={`position-absolute overflow-auto label-contained${labelClasses ? " " + labelClasses : ""}`}
            style={labelStyles}>{label}</label>
      </div>
    </div>
  );
};

CheckBox.propTypes = {
  alwaysDisabled: PropTypes.bool,
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
  value: PropTypes.bool
};

export default CheckBox;