import React, { useRef } from "react";
import PropTypes from "prop-types";
import {
  BreadCrumb,
  ComponentContainer,
  CustomDragLayer,
  ComponentEditor,
  LayoutSelector,
} from "..";
import { Helper } from "../../utils";
import DragLayerUtil from "../../utils/DND/dragLayerUtil";
import "./ComponentContainerWrapper.component.scss";

let scrolledBy, location;

const scrollHandler = Helper.debounce(e => scrolledBy = {left: e.target.scrollLeft, top: e.target.scrollTop});

const setDropLocationDebounced = Helper.debounce(locationIncoming => location = locationIncoming);

const ComponentContainerWrapper = (props) => {
  const containingParentRef = useRef(null);
  const {
    clientRect,
    context,
    dispatchSelectedComponent,
    isDevMode,
    selectedComponent,
    setClientRect,
    setSnapFactor,
    snapFactor,
    socket
  } = props;
  return (
    <>
      {context !== "editor" && isDevMode && <LayoutSelector />}
      <BreadCrumb />
      <div className="overflow-auto h-100" ref={containingParentRef} onScroll={scrollHandler}>
        {context === "editor" ? (
          <ComponentEditor />
        ) : (
          <>
            <ComponentContainer
              boundingClientRectProvider={setClientRect}
              setSnapFactor={setSnapFactor}
              dispatchSelectedComponent={dispatchSelectedComponent}
              dropLocation={location}
              selectedComponent={selectedComponent}
              socket={socket}
            />
            <CustomDragLayer
              clientRect={clientRect}
              snapFactor={snapFactor}
              getItemStyles={args => DragLayerUtil.getItemStyles(args, setDropLocationDebounced, scrolledBy)}
            />
          </>
        )}
      </div>
    </>
  );
};

ComponentContainerWrapper.propTypes = {
  clientRect: PropTypes.object,
  context: PropTypes.string,
  isDevMode: PropTypes.bool,
  selectedComponent: PropTypes.string,
  snapFactor: PropTypes.number,
  socket: PropTypes.object,
  dispatchSelectedComponent: PropTypes.func,
  setClientRect: PropTypes.func,
  setSnapFactor: PropTypes.func
};

export default ComponentContainerWrapper;