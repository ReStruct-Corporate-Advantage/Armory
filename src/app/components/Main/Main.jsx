import React, { useRef } from "react";
import "./Main.component.scss";

const Main = props => {
  return <main className="c-Main p-2 position-relative overflow-hidden d-flex flex-column">
          {props.children}
      </main>;
};

export default Main;