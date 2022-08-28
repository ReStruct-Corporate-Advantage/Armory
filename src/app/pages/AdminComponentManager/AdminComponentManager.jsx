import React, { useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { DndProvider } from "react-dnd";
import {HTML5Backend as Backend} from "react-dnd-html5-backend"
import {createPropsSelector} from "reselect-immutable-helpers";
import {getComponentConfig} from "./selectors";
import {dispatchComponentConfig} from "./actions";
import useEventHandler from "../../hooks/useEventHandler";
import { Aside, Main, ToolActionContainer } from "../../components";
import "./AdminComponentManager.module.scss";

const AdminComponentManager = props => {
  const {componentConfig, dispatchComponentConfig} = props
  const [clientRect, setClientRect] = useState({});
  const {handleKeyDown, handleKeyUp, handleOnClick} = useEventHandler();

  return <DndProvider backend={Backend}>
    <div className="c-AdminComponentManager d-flex flex-column flex-nowrap h-100">
      <main className="c-AdminComponentManager__content d-flex flex-row flex-nowrap position-fixed" 
        tabIndex="0"
        onKeyDown = {(e) => handleKeyDown(e, componentConfig, dispatchComponentConfig, clientRect)}
        onKeyUp = {handleKeyUp}
        onClick = {handleOnClick}>
        <Aside childItems={[{name: "ArmoryLib", props: {context: "editor"}}]} clientRect={clientRect} position="left" context="editor" />
        <Main setClientRect={setClientRect} clientRect={clientRect} context="editor" />
        <Aside childItems={
          [
            {name: "PropertiesWidget", props: {title: "Component Details", componentConfig}},
            {name: "CodeViewerWidget", props: {title: "Generated Code"}}
          ]
        } position="right" styles={{fontSize: "0.8rem"}} context="editor" />
      </main>
      <ToolActionContainer />
    </div>
    </DndProvider>
};

AdminComponentManager.propTypes = {
  componentConfig: PropTypes.object,
  dispatchComponentConfig: PropTypes.func,
  selectedComponent: PropTypes.string,
  dispatchSelectedComponent: PropTypes.func
};


const mapStateToProps = createPropsSelector({
  componentConfig: getComponentConfig
})

const mapDispatchToProps = {
  dispatchComponentConfig
}

export default connect(mapStateToProps, mapDispatchToProps)(AdminComponentManager);