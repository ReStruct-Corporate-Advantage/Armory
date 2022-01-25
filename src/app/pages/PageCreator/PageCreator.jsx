import React, {useEffect, useState} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {createPropsSelector} from "reselect-immutable-helpers";
import {DndProvider} from "react-dnd"
import {HTML5Backend} from "react-dnd-html5-backend"
import {TouchBackend} from "react-dnd-touch-backend"
import io from "socket.io-client";
import { isMobile } from "../../global-selectors";
import {getPresentPageConfig, getSelectedComponent} from "./selectors";
import {dispatchPageConfig, dispatchSelectedComponent} from "./actions";
import {Aside, Main, ToolActionContainer} from "../../components";
import useEventHandler from "../../utils/useEventHandler";
import API_CONFIG from "../../constants/api-config";
import "./PageCreator.module.scss";

const PageCreator = props => {
  const {pageConfig, dispatchPageConfig, dispatchSelectedComponent, isMobile, selectedComponent} = props
  const [clientRect, setClientRect] = useState({});
  const [socket, setSocket] = useState(null);
  const {handleKeyDown, handleKeyUp, handleOnClick} = useEventHandler({socket});
  const dndBackend = isMobile ? TouchBackend : HTML5Backend;

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
      <div className="c-PageCreator d-flex flex-column flex-nowrap h-100">
        <main className="c-PageCreator__content d-flex flex-row flex-nowrap position-fixed" 
          tabIndex="0"
          onKeyDown = {(e) => handleKeyDown(e, pageConfig, dispatchPageConfig, selectedComponent, dispatchSelectedComponent, clientRect)}
          onKeyUp = {handleKeyUp}
          onClick = {handleOnClick}>
          <Aside persistent={true} childItems={[{name: "ArmoryLib"}]} clientRect={clientRect} position="left" />
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

PageCreator.propTypes = {
  pageConfig: PropTypes.object,
  dispatchPageConfig: PropTypes.func,
  selectedComponent: PropTypes.string,
  dispatchSelectedComponent: PropTypes.func
};

const mapStateToProps = createPropsSelector({
  pageConfig: getPresentPageConfig,
  isMobile: isMobile,
  selectedComponent: getSelectedComponent
})

const mapDispatchToProps = {
  dispatchPageConfig,
  dispatchSelectedComponent
}

export default connect(mapStateToProps, mapDispatchToProps)(PageCreator);