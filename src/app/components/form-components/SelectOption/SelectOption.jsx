import React from "react";
import PropTypes from "prop-types";
import "./SelectOption.component.scss";

const SelectOption = props => {
  const {layoutClasses, options, optionClasses, selectClasses} = props
  return (
    <div className={`c-SelectOption${layoutClasses ? " " + layoutClasses : ""}`}>
      <select className={`w-100${selectClasses ? " " + selectClasses : ""}`}>
        {options.map((option, key) => <option key={key} className={`w-100${optionClasses ? " " + optionClasses : ""}`}>{option.displayName}</option>)}
      </select>
    </div>
  );
};

SelectOption.propTypes = {
  layoutClasses: PropTypes.string,
  options: PropTypes.array,
  optionClasses: PropTypes.string,
  selectClasses: PropTypes.string
};

export default SelectOption;