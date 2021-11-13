import React, { useRef } from "react";
import PropTypes from "prop-types";
import {BreadCrumb, ComponentContainer, ComponentEditor, CustomDragLayer, LayoutSelector} from "./../";
import "./Main.component.scss";

const Main = props => {
  const containingParentRef = useRef(null);
  const {clientRect, context, snapFactor, selectedComponent, dispatchSelectedComponent, setClientRect, setSnapFactor, socket} = props;

  return <main className="c-Main p-2 position-relative overflow-hidden d-flex flex-column">
          {context !== "editor" && <LayoutSelector />}
          <BreadCrumb />
          <div className="overflow-auto h-100" ref={containingParentRef}>
            {context === "editor" ? <ComponentEditor />
            : <>
              <ComponentContainer boundingClientRectProvider={setClientRect} setSnapFactor={setSnapFactor} dispatchSelectedComponent={dispatchSelectedComponent}
                selectedComponent={selectedComponent} socket={socket} />
              <CustomDragLayer containingParentRef={containingParentRef} clientRect={clientRect} snapFactor={snapFactor} />
            </>}
          </div>
      </main>;
};

Main.propTypes = {
  clientRect: PropTypes.object,
  context: PropTypes.string,
  setClientRect: PropTypes.func,
  dispatchSelectedComponent: PropTypes.func
};

export default Main;