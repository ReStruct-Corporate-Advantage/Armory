import React, {useEffect, useState} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {createPropsSelector} from "reselect-immutable-helpers";
import {DndProvider} from "react-dnd"
import Backend from "react-dnd-html5-backend"
import {getPresentComponentsConfig} from "./selectors";
import {Aside, Main, ToolActionContainer} from "./../../components";
import useEventHandler from "../../utils/useEventHandler";
import "./ComponentCreator.module.scss";

const ComponentCreator = props => {
  const {componentConfig} = props
  const [clientRect, setClientRect] = useState({});
  const {handleKeyDown, handleKeyUp, handleOnClick} = useEventHandler();
  const [selectedComponent, setSelectedComponent] = useState("Root");

  return <DndProvider backend={Backend}>
      <div className="c-ComponentCreator d-flex flex-column flex-nowrap h-100">
        <main className="c-ComponentCreator__content d-flex flex-row flex-nowrap position-fixed" 
          tabIndex="0"
          onKeyDown = {(e) => handleKeyDown(e, componentConfig, selectedComponent)}
          onKeyUp = {handleKeyUp}
          onClick = {handleOnClick}>
          <Aside childItems={[{name: "ArmoryLib"}]} clientRect={clientRect} position="left" />
          <Main setClientRect={setClientRect} clientRect={clientRect} setSelectedComponent={setSelectedComponent} selectedComponent={selectedComponent} />
          <Aside childItems={
            [
              {name: "PropertiesWidget", props: {title: "Component Details"}},
              {name: "CodeViewerWidget", props: {title: "Generated Code", setSelectedComponent}}
            ]
          } selectedComponent={selectedComponent} position="right" styles={{fontSize: "0.8rem"}}/>
        </main>
        <ToolActionContainer />
      </div>
    </DndProvider>;
};

ComponentCreator.propTypes = {
  componentConfig: PropTypes.object,
  dispatchDeviceType: PropTypes.func
};


const mapStateToProps = createPropsSelector({
  componentConfig: getPresentComponentsConfig
})

export default connect(mapStateToProps)(ComponentCreator);