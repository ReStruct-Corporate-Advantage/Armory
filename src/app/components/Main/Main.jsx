import React from "react";
import {ComponentContainer} from "./../";
import "./Main.component.scss";

const Main = props => {
  
  return <main className="c-Main p-2">
        {/* <BoardHeader /> */}
        <ComponentContainer />
      </main>;
};

Main.propTypes = {

};

export default Main;