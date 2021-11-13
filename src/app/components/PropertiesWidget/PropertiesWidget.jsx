import React, {useState} from "react";
import PropTypes from "prop-types";
import {SectionHeader, PropsForm, ToolBox} from "./../";
import {TOOLS_CONFIG} from "./../../config"
import AdminPropsForm from "../AdminPropsForm";
import "./PropertiesWidget.component.scss";

const PropertiesWidget = props => {
  const {componentConfig, context, socket} = props;
  let {selectedComponent} = props;
  selectedComponent = context === "editor" && componentConfig && componentConfig.component ? componentConfig.component.id : selectedComponent
  const [editMode, toggleEditMode] = useState({});
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
    <div className="c-Widget c-PropertiesWidget d-flex flex-column flex-nowrap h-50 mb-3">
      <SectionHeader {...props} />
      <ToolBox toolsConfig={TOOLS_CONFIG.CODE_PROPERTIES_TOOLS} handlers={[
        {name: "EditProperties", handler: () => toggleEditMode({...editMode, [selectedComponent]: !editMode[selectedComponent]}),
          currentValue: editMode, type: "onClick"},
        {name: "SaveProperties", handler: setInitiateSave, currentValue: initiateSave, type: "onClick"}
      ]} selectedComponent={selectedComponent} />
      {context === "editor"
        ? <AdminPropsForm editMode={editMode} toggleEditMode={toggleEditMode} initiateSave={initiateSave} setInitiateSave={setInitiateSave} />
        : <PropsForm selectedComponent={selectedComponent} editMode={editMode} toggleEditMode={toggleEditMode}
        initiateSave={initiateSave} setInitiateSave={setInitiateSave} socket={socket} />}
    </div>
  );
};

PropertiesWidget.propTypes = {
  componentConfig: PropTypes.object,
  context: PropTypes.string,
  selectedComponent: PropTypes.string,
  socket: PropTypes.object
}

export default PropertiesWidget;