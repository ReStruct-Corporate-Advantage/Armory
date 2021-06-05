import React from "react";
import PropTypes from "prop-types";
import {ComponentContainer, CustomDragLayer} from "./../";
import "./Main.component.scss";

const Main = props => {
  const {snapFactor, setSelectedComponent, setSnapFactor, clientRect, setClientRect} = props;

  return <main className="c-Main p-2">
        <ComponentContainer boundingClientRectProvider={setClientRect} setSnapFactor={setSnapFactor} setSelectedComponent={setSelectedComponent} />
        <CustomDragLayer clientRect={clientRect} snapFactor={snapFactor} />
      </main>;
};

Main.propTypes = {
  clientRect: PropTypes.object,
  setClientRect: PropTypes.func,
  setSelectedComponent: PropTypes.func
};

export default Main;