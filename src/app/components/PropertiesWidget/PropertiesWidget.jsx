import React, {useState} from "react";
import {SectionHeader, PropsForm, ToolBox} from "./../";
import {TOOLS_CONFIG} from "./../../config"
import "./PropertiesWidget.component.scss";

const PropertiesWidget = props => {
  const {selectedComponent} = props;
  const [editMode, toggleEditMode] = useState(false);
  const [initiateSave, setInitiateSave] = useState(false);
  const toolsConfig = {...TOOLS_CONFIG.CODE_PROPERTIES_TOOLS};

  toolsConfig.tools.forEach(tool => {
      if (tool.name === "SaveProperties") {
        tool.disabled = !editMode;
      }
      if (tool.name === "EditProperties") {
        tool.disabled = !selectedComponent || selectedComponent === "Root";
      }
  })

  return (
    <div className="c-Widget c-PropertiesWidget d-flex flex-column flex-nowrap h-50">
      <SectionHeader {...props} />
      <ToolBox toolsConfig={TOOLS_CONFIG.CODE_PROPERTIES_TOOLS} handlers={[
        {name: "EditProperties", handler: toggleEditMode, currentValue: editMode, type: "onClick"},
        {name: "SaveProperties", handler: setInitiateSave, currentValue: initiateSave, type: "onClick"}
      ]} />
      <PropsForm selectedComponent={selectedComponent} editMode={editMode} toggleEditMode={toggleEditMode} initiateSave={initiateSave} setInitiateSave={setInitiateSave}/>
    </div>
  );
};

PropertiesWidget.propTypes = {
  
};

export default PropertiesWidget;