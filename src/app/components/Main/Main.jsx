import React, { useState } from "react";
import PropTypes from "prop-types";
import {ComponentContainer, CustomDragLayer} from "./../";
import "./Main.component.scss";

const Main = props => {
  
  const {clientRect, setClientRect} = props;
  const {snapFactor, setSnapFactor} = props;

  return <main className="c-Main p-2">
        {/* <BoardHeader /> */}
        <ComponentContainer boundingClientRectProvider={setClientRect} setSnapFactor={setSnapFactor} />
        <CustomDragLayer clientRect={clientRect} snapFactor={snapFactor} />
      </main>;
};

Main.propTypes = {
  clientRect: PropTypes.object,
  setClientRect: PropTypes.func
};

export default Main;