import React from "react";
import PropTypes from "prop-types";
import {ComponentContainer, CustomDragLayer, LayoutSelector} from "./../";
import "./Main.component.scss";

const Main = props => {
  const {snapFactor, selectedComponent, setSelectedComponent, setSnapFactor, clientRect, setClientRect} = props;

  return <main className="c-Main p-2 position-relative overflow-auto">
          <LayoutSelector />
          <div className="overflow-auto">
            <ComponentContainer boundingClientRectProvider={setClientRect} setSnapFactor={setSnapFactor} setSelectedComponent={setSelectedComponent} selectedComponent={selectedComponent} />
            <CustomDragLayer clientRect={clientRect} snapFactor={snapFactor} />
          </div>
      </main>;
};

Main.propTypes = {
  clientRect: PropTypes.object,
  setClientRect: PropTypes.func,
  setSelectedComponent: PropTypes.func
};

export default Main;