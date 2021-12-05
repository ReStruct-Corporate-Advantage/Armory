import React, {useEffect, useState} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {createPropsSelector} from "reselect-immutable-helpers";
import {DndProvider} from "react-dnd"
import {HTML5Backend} from "react-dnd-html5-backend"
import {TouchBackend} from "react-dnd-touch-backend"
import io from "socket.io-client";
import { getToggles, getUserDetails, isMobile } from "../../global-selectors";
import {getPresentComponentsConfig, getSelectedComponent} from "./selectors";
import {dispatchComponentsConfig, dispatchSelectedComponent} from "./actions";
import {Aside, Main, Logger, ToolActionContainer} from "./../../components";
import useEventHandler from "../../utils/useEventHandler";
import API_CONFIG from "../../constants/api-config";
import "./ComponentCreator.module.scss";

const ComponentCreator = props => {
  const {componentConfig, dispatchComponentsConfig, dispatchSelectedComponent, isMobile, selectedComponent, toggles, user} = props
  const [clientRect, setClientRect] = useState({});
  const [socket, setSocket] = useState(null);
  const {handleKeyDown, handleKeyUp, handleOnClick} = useEventHandler({socket});
  const dndBackend = isMobile ? TouchBackend : HTML5Backend;
  const devModeToggle = toggles && toggles.find(toggle => toggle.name === "developerMode");
  const isDevMode = devModeToggle && devModeToggle.selected;

  useEffect(() => {
    if (!socket) {
      const host = API_CONFIG.HOST[process.env.NODE_ENV || "development"];
      const newSocket = io(host);
      setSocket(newSocket);
      return () => newSocket.close();
    }
  }, [socket]);
  
  // return <DndProvider backend={Backend}>
  return <DndProvider debugMode={true} backend={dndBackend}>
      <div className="c-ComponentCreator d-flex flex-column flex-nowrap h-100">
        <main className={`c-ComponentCreator__content d-flex flex-row flex-nowrap ${isDevMode ? " developer-mode" : ""}`} 
          tabIndex="0"
          onKeyDown = {(e) => handleKeyDown(e, componentConfig, dispatchComponentsConfig, selectedComponent, dispatchSelectedComponent, clientRect)}
          onKeyUp = {handleKeyUp}
          onClick = {handleOnClick}>
          <Aside persistent={true} childItems={[{name: "ArmoryLib"}]} clientRect={clientRect} position="left" />
          <Main isDevMode={isDevMode} setClientRect={setClientRect} clientRect={clientRect} dispatchSelectedComponent={dispatchSelectedComponent} selectedComponent={selectedComponent} socket={socket} />
          <Aside persistent={false} isDevMode={isDevMode} childItems={
            [
              {name: "PropertiesWidget", props: {title: "Component Details", socket}},
              {name: "CodeViewerWidget", props: {title: "Generated Code", dispatchSelectedComponent}}
            ]
          } selectedComponent={selectedComponent} position="right" styles={{fontSize: "0.8rem"}}/>
        </main>
        <ToolActionContainer />
      <Logger isDevMode={isDevMode} user={user} />
      </div>
    </DndProvider>;
};

ComponentCreator.propTypes = {
  componentConfig: PropTypes.object,
  dispatchComponentsConfig: PropTypes.func,
  selectedComponent: PropTypes.string,
  dispatchSelectedComponent: PropTypes.func,
  user: PropTypes.object
};

const mapStateToProps = createPropsSelector({
  componentConfig: getPresentComponentsConfig,
  isMobile: isMobile,
  selectedComponent: getSelectedComponent,
  toggles: getToggles,
  user: getUserDetails
})

const mapDispatchToProps = {
  dispatchComponentsConfig,
  dispatchSelectedComponent
}

export default connect(mapStateToProps, mapDispatchToProps)(ComponentCreator);