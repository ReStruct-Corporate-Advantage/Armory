import React from "react";
import {Button} from "@material-ui/core";
import "./ButtonsPanel.component.scss";

const ButtonsPanel = props => {
  const {buttonsConfig} = props;
  const buttonRenders = Object.keys(buttonsConfig).map((buttonConfigKey, key) => {
    const buttonConfig = buttonsConfig[buttonConfigKey];
    return <Button variant="contained" key={key} type={buttonConfig.type} onClick={buttonConfig.onClick} value={buttonConfig.btnText} style={buttonConfig.style}>{buttonConfig.btnText}</Button>
  })
  return (
    <div className="c-ButtonsPanel row my-5">
      <div className="col-12 text-right">
        {buttonRenders}
      </div>
    </div>
  );
};

export default ButtonsPanel;