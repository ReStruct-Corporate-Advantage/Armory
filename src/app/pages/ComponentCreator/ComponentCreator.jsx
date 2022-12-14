import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { createPropsSelector } from "reselect-immutable-helpers";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import io from "socket.io-client";
import { getToggles, getUserDetails, isMobile } from "../../global-selectors";
import { getPresentComponentsConfig, getSelectedComponent } from "./selectors";
import { dispatchComponentsConfig, dispatchSelectedComponent } from "./actions";
import {
  Aside,
  ComponentContainerWrapper,
  Main,
  Logger,
  ToolActionContainer,
  WidgetContainer,
} from "../../components";
import registerDragFor from "../../utils/vanillaDragger";
import useEventHandler from "../../hooks/useEventHandler";
import API_CONFIG from "../../constants/api-config";
import "./ComponentCreator.module.scss";

const ComponentCreator = (props) => {
  const {
    componentConfig,
    dispatchComponentsConfig,
    dispatchSelectedComponent,
    isMobile,
    selectedComponent,
    toggles,
    user,
  } = props;
  const [clientRect, setClientRect] = useState({});
  const [socket, setSocket] = useState(null);
  const [widgetDragging, setWidgetDragging] = useState(false);
  const { handleKeyDown, handleKeyUp, handleOnClick } = useEventHandler({
    socket,
  });
  const draggable = useRef(null);
  const dndBackend = isMobile ? TouchBackend : HTML5Backend;
  const devModeToggle =
    toggles && toggles.find((toggle) => toggle.name === "developerMode");
  const floatingLayout =
    toggles && toggles.find((toggle) => toggle.name === "layout");
  const isDevMode = devModeToggle && devModeToggle.selected;

  useEffect(() => {
    if (!socket) {
      const host = API_CONFIG.HOST[process.env.NODE_ENV || "development"];
      const newSocket = io(host);
      setSocket(newSocket);
      return () => newSocket.close();
    }
  }, [socket]);

  useEffect(() => {
    floatingLayout &&
      floatingLayout.selected &&
      registerDragFor(
        document.getElementById("i-WidgetContainer"),
        "i-WidgetContainer__accordion-handle",
        setWidgetDragging
      );
  }, [floatingLayout]);

  useEffect(() => {
    // const container = $(".c-ComponentCreator");
    // container && container.overlayScrollbars({ })
  }, []);

  // return <DndProvider backend={Backend}>
  return (
    <DndProvider debugMode={true} backend={dndBackend}>
      <div className="c-ComponentCreator d-flex flex-column flex-nowrap h-100">
        <main
          className={`c-ComponentCreator__content d-flex flex-row flex-nowrap ${
            isDevMode ? " developer-mode" : ""
          }`}
          tabIndex="0"
          onKeyDown={(e) =>
            handleKeyDown(
              e,
              componentConfig,
              dispatchComponentsConfig,
              selectedComponent,
              dispatchSelectedComponent,
              clientRect
            )
          }
          onKeyUp={handleKeyUp}
          onClick={handleOnClick}
        >
          {(!floatingLayout || !floatingLayout.selected) && (
            <Aside
              asideClasses="bg-transparent p-2"
              persistent={false}
              isDevMode={isDevMode}
              childItems={[{ name: "ArmoryLib", props: { variant: 1 } }]}
              clientRect={clientRect}
              position="left"
            />
          )}
          <Main>
            <ComponentContainerWrapper
              clientRect={clientRect}
              dispatchSelectedComponent={dispatchSelectedComponent}
              isDevMode={isDevMode}
              selectedComponent={selectedComponent}
              setClientRect={setClientRect}
              socket={socket}
            />
          </Main>
          {(!floatingLayout || !floatingLayout.selected) && (
            <Aside
              asideClasses="p-2"
              persistent={false}
              isDevMode={isDevMode}
              childItems={[
                {
                  name: "PropertiesWidget",
                  props: { title: "Component Details", socket },
                },
                {
                  name: "CodeViewerWidget",
                  props: { title: "Generated Code", dispatchSelectedComponent },
                },
              ]}
              selectedComponent={selectedComponent}
              position="right"
              styles={{ fontSize: "0.8rem" }}
            />
          )}
        </main>
        <ToolActionContainer />
        {floatingLayout && floatingLayout.selected && isDevMode && (
          <WidgetContainer
            widgetDragging={widgetDragging}
            ref={draggable}
            persistent={false}
            isDevMode={isDevMode}
            childItems={[
              { name: "ArmoryLib", props: { variant: 2 } },
              {
                name: "PropertiesWidget",
                props: { title: "Component Details", socket },
              },
              {
                name: "CodeViewerWidget",
                props: { title: "Generated Code", dispatchSelectedComponent },
              },
            ]}
            clientRect={clientRect}
            position="left"
          />
        )}
        <Logger isDevMode={isDevMode} user={user} />
      </div>
    </DndProvider>
  );
};

ComponentCreator.propTypes = {
  componentConfig: PropTypes.object,
  dispatchComponentsConfig: PropTypes.func,
  selectedComponent: PropTypes.string,
  dispatchSelectedComponent: PropTypes.func,
  user: PropTypes.object,
};

const mapStateToProps = createPropsSelector({
  componentConfig: getPresentComponentsConfig,
  isMobile: isMobile,
  selectedComponent: getSelectedComponent,
  toggles: getToggles,
  user: getUserDetails,
});

const mapDispatchToProps = {
  dispatchComponentsConfig,
  dispatchSelectedComponent,
};

export default connect(mapStateToProps, mapDispatchToProps)(ComponentCreator);
