import React from "react";
import PropTypes from "prop-types";
import Button from "../Button";
import "./ButtonsPanel.component.scss";

const ButtonsPanel = props => {
  const {buttonsConfig} = props;
  const buttonRenders = Object.keys(buttonsConfig).map((buttonConfigKey, key) => <Button {...buttonsConfig[buttonConfigKey]} key={key} />);
  
  return (
    <div className="c-ButtonsPanel row my-4">
      <div className="col-12 text-end">
        {buttonRenders}
      </div>
    </div>
  );
};

ButtonsPanel.propTypes = {
  buttonsConfig: PropTypes.object
}

export default ButtonsPanel;