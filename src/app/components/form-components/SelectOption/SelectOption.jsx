import React from "react";
import PropTypes from "prop-types";
import "./SelectOption.component.scss";

const SelectOption = props => {
  const {id, layoutClasses, onChange, options, optionClasses, selectClasses, value} = props;

  return (
    <div className={`c-SelectOption${layoutClasses ? " " + layoutClasses : ""}`}>
      <select className={`w-100 h-100${selectClasses ? " " + selectClasses : ""}`} onChange={e => onChange && onChange(e, id)} selected={value}>
        {options.map((option, key) => <option key={key} className={`w-100${optionClasses ? " " + optionClasses : ""}`}
          value={option.name}>{option.displayName}</option>)}
      </select>
    </div>
  );
};

SelectOption.propTypes = {
  id: PropTypes.string,
  layoutClasses: PropTypes.string,
  onChange: PropTypes.func,
  options: PropTypes.array,
  optionClasses: PropTypes.string,
  selectClasses: PropTypes.string,
  value: PropTypes.string
};

export default SelectOption;