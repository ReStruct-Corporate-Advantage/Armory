import React, {useEffect, useState} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {createPropsSelector} from "reselect-immutable-helpers";
import {DndProvider} from "react-dnd"
import Backend from "react-dnd-html5-backend"
import {TouchBackend} from "react-dnd-touch-backend"
import io from "socket.io-client";
import { isMobile } from "../../global-selectors";
import {getPresentComponentsConfig, getSelectedComponent} from "./selectors";
import {dispatchComponentsConfig, dispatchSelectedComponent} from "./actions";
import {Aside, Main, ToolActionContainer} from "./../../components";
import useEventHandler from "../../utils/useEventHandler";
import "./ComponentCreator.module.scss";

const ComponentCreator = props => {
  const {componentConfig, dispatchComponentsConfig, dispatchSelectedComponent, isMobile, selectedComponent} = props
  const [clientRect, setClientRect] = useState({});
  const [socket, setSocket] = useState(null);
  const {handleKeyDown, handleKeyUp, handleOnClick} = useEventHandler({socket});
  const dndBackend = isMobile ? TouchBackend : Backend;

  useEffect(() => {
    const newSocket = io(`http://${window.location.hostname}:3002`);
    setSocket(newSocket);
    return () => newSocket.close();
  }, [setSocket]);
  
  // return <DndProvider backend={Backend}>
  return <DndProvider backend={dndBackend}>
      <div className="c-ComponentCreator d-flex flex-column flex-nowrap h-100">
        <main className="c-ComponentCreator__content d-flex flex-row flex-nowrap position-fixed" 
          tabIndex="0"
          onKeyDown = {(e) => handleKeyDown(e, componentConfig, dispatchComponentsConfig, selectedComponent, dispatchSelectedComponent, clientRect)}
          onKeyUp = {handleKeyUp}
          onClick = {handleOnClick}>
          <Aside childItems={[{name: "ArmoryLib"}]} clientRect={clientRect} position="left" />
          <Main setClientRect={setClientRect} clientRect={clientRect} dispatchSelectedComponent={dispatchSelectedComponent} selectedComponent={selectedComponent} socket={socket} />
          <Aside childItems={
            [
              {name: "PropertiesWidget", props: {title: "Component Details", socket}},
              {name: "CodeViewerWidget", props: {title: "Generated Code", dispatchSelectedComponent}}
            ]
          } selectedComponent={selectedComponent} position="right" styles={{fontSize: "0.8rem"}}/>
        </main>
        <ToolActionContainer />
      </div>
    </DndProvider>;
};

ComponentCreator.propTypes = {
  componentConfig: PropTypes.object,
  dispatchComponentsConfig: PropTypes.func,
  dispatchDeviceType: PropTypes.func,
  selectedComponent: PropTypes.string,
  dispatchSelectedComponent: PropTypes.func
};

const mapStateToProps = createPropsSelector({
  componentConfig: getPresentComponentsConfig,
  isMobile: isMobile,
  selectedComponent: getSelectedComponent
})

const mapDispatchToProps = {
  dispatchComponentsConfig,
  dispatchSelectedComponent
}

export default connect(mapStateToProps, mapDispatchToProps)(ComponentCreator);