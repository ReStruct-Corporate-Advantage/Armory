import React from "react";
import {DndProvider} from "react-dnd"
import Backend from "react-dnd-html5-backend";
import "./ProjectCreator.module.scss";

const ProjectCreator = props => {

  return <DndProvider backend={Backend}>
  <div className="c-ProjectCreator d-flex flex-column flex-nowrap h-100">
    <main className="c-ProjectCreator__content d-flex flex-row flex-nowrap position-fixed" 
      tabIndex="0"></main>
  </div>
</DndProvider>;
};


export default ProjectCreator;