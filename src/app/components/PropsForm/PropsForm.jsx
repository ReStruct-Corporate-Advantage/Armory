import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {createPropsSelector} from "reselect-immutable-helpers";
import { getClearPropsState, getPresentComponentsConfig } from "../../pages/ComponentCreator/selectors";
import { getUserDetails } from "../../global-selectors";
import { dispatchClearPropsState, setComponentsConfig } from "../../pages/ComponentCreator/actions";
import {compGen, forkedRepository} from "./../../utils/CodeUtils/ComponentGenerator";
import Helper from "../../utils/Helper";
import {SelectOption, InputField, CheckBox} from "../";
import Network from "./../../utils/network";
import "./PropsForm.component.scss";

const PropsForm = props => {
  const {clear, componentsConfig, dispatchClearPropsState, setComponentsConfig, editMode, initiateSave, setInitiateSave, selectedComponent, toggleEditMode, userDetails} = props;
  const [formState, updateFormState] = useState({});
  const key = "uuid";
  const alwaysDisabled = ["createdBy", "id", "uuid", "componentName", "meta#createdBy"];
  const rootChildrenArray = componentsConfig && componentsConfig.components[0].descriptor.children;
  const returnVal = Helper.searchInTree(key, selectedComponent, componentsConfig, "components", "descriptor.children");
  let {selectedComponentConfig, parent} = returnVal ? returnVal : {};
  selectedComponentConfig = Helper.filterObject(selectedComponentConfig, ["armamentCategory", "name", "updatedAt", "index", "createdAt"])
  const forkTriggeringProperties = [""];

  useEffect(() => {
    if (clear) {
      updateFormState({})
      dispatchClearPropsState(false);
    }
  }, [clear, dispatchClearPropsState])

  const onChange = (formState, id, value, selectedComponentConfig) => {
    formState[selectedComponent][id] = value;
    selectedComponentConfig[id] = value;
  }

  const onInnerChange = (formState, id, value, selectedComponentConfig, property, type) => {
    formState[selectedComponent][property] = formState[selectedComponent][property] ? {...formState[selectedComponent][property]} : {}
    id = id.indexOf("#") > -1 ? id.substring(id.indexOf("#") + 1) : id;
    try {
      value = type === "object" ? JSON.parse(value) : value;
      value = value === "true" || value === "false" ? value === "true" : value;
      selectedComponentConfig[property][id] = value;
    } catch (e) {
      console.log(e);
    }
    formState[selectedComponent][property][id] = value;
  }

  const onChangeActions = (formId, id, value, action, property, type) => {
    const formStateCloned = {...formState};
    const componentsConfigCloned = {...componentsConfig};
    const selectedComponentConfigCloned = {...selectedComponentConfig};
    if (!formStateCloned[selectedComponent]) {
      formStateCloned[selectedComponent] = {};
    }
    parent.splice(parent.indexOf(selectedComponentConfig), 1, selectedComponentConfigCloned);
    action(formStateCloned, id, value, selectedComponentConfigCloned, property, type);
    selectedComponentConfigCloned.name = userDetails ? selectedComponentConfigCloned.componentName + "-" + userDetails.username : selectedComponentConfigCloned.name;
    selectedComponentConfigCloned.name = selectedComponentConfigCloned.name + "-" + Helper.findMaxHyphenBased(forkedRepository, selectedComponentConfigCloned.name)
    selectedComponentConfigCloned.state = "new";
    compGen.decideTypeAndGenerateWithConfig(selectedComponentConfigCloned, true, true); // Forking here
    setComponentsConfig(componentsConfigCloned);
    updateFormState(formStateCloned);
  }

  const updateProperties = () => {
    const payload = {...selectedComponentConfig};
    formState && Object.keys(formState).forEach(key => {
      const formValue = formState[key];
      if (typeof formValue === "string" || typeof formValue === "number") {
        payload[key] = formValue;
      } else if (typeof formValue === "object") {
        if (!payload[key]) {
          payload[key] = {};
        }
        Object.keys(formValue).forEach(keyInner => {
          let outgoingKey = keyInner;
          let valueInner = formValue[keyInner];
          if (keyInner.indexOf("#") > -1) {
            outgoingKey = keyInner.substring(keyInner.indexOf("#") + 1);
          }
          if (outgoingKey === "tags") {
            valueInner = valueInner.split(",").map(item => item.trim());
          }
          payload[key][outgoingKey] = valueInner;
        })
      }
    })
    Network.put("/api/armory", payload)
      .then(res => {
        console.log(res);
      })
      .catch(err => console.log(err))
      .finally(() => {
        setInitiateSave(false);
        toggleEditMode(false);
      })
  }

  const addProperty = () => {

  }

  initiateSave && updateProperties();

  const propFieldRenders = () => {
    return selectedComponentConfig && Object.keys(selectedComponentConfig).map((property, key) => {
      let incoming = selectedComponentConfig[property];
      if (typeof incoming === "object" && !incoming.length) {
        return Object.keys(incoming).map((propertyInner, keyInner) => {
          const idInner = propertyInner.indexOf("#") > -1 ? propertyInner : `${property}#${propertyInner}`;

          const configItemInner = incoming[propertyInner];
          const valueType = typeof configItemInner;

          let valueInner = formState[selectedComponent] && formState[selectedComponent][property] && formState[selectedComponent][property][propertyInner] !== undefined ? formState[selectedComponent][property][propertyInner] : incoming[propertyInner];
          valueInner = typeof valueInner === "object" ? valueInner.length ? valueInner.join(",") : JSON.stringify(valueInner) : valueInner;
          
          const typeInner = typeof valueInner === "number" ? "number" : "text";
          const isBool = typeof valueInner === "boolean" || valueInner === "true" || valueInner === "false";

          if (isBool) {
            return <CheckBox formId="propsForm" id={idInner} key={key + "-" + keyInner} value={valueInner} layoutClasses="mb-1" inputClasses="small label-right-tagged border-unset" readOnly={!editMode}
              inputStyles={{padding: "0.2rem", fontSize: "0.7rem", width: "calc(100% - 7rem)"}}  label={idInner} labelClasses="prop-field-label" alwaysDisabled={alwaysDisabled.indexOf(idInner) > -1}
              onChange={(formId, id, value) => onChangeActions(formId, id, value, onInnerChange, property, valueType)}/>
          } else {
            return <InputField formId="propsForm" id={idInner} key={key + "-" + keyInner} type={typeInner} layoutClasses="mb-1" inputClasses="small label-right-tagged border-unset"
              inputStyles={{padding: "0.2rem", fontSize: "0.7rem", width: "calc(100% - 7rem)"}} shrunkable={false} readOnly={!editMode} alwaysDisabled={alwaysDisabled.indexOf(idInner) > -1}
              value={valueInner} label={idInner} labelClasses="prop-field-label" onChange={(formId, id, value) => onChangeActions(formId, id, value, onInnerChange, property, valueType)} />;
          }
        })
      } else {
        const value = formState[selectedComponent] && formState[selectedComponent][property] !== undefined ? formState[selectedComponent][property] : incoming;
        const type = typeof value === "number" ? "number" : "text";
        const isBool = typeof value === "boolean" || value === "true" || value === "false";
        if (isBool) {
          return <CheckBox formId="propsForm" id={property} key={key} value={value} layoutClasses="mb-1" inputClasses="small label-right-tagged border-unset" readOnly={!editMode}
              inputStyles={{padding: "0.2rem", fontSize: "0.7rem", width: "calc(100% - 7rem)"}}  label={property} labelClasses="prop-field-label" alwaysDisabled={alwaysDisabled.indexOf(property) > -1}
              onChange={(formId, id, value) => onChangeActions(formId, id, value, onChange)}/>
        } else {
          return <InputField formId="propsForm" id={property} key={key} type={type} layoutClasses="mb-1" inputClasses="small label-right-tagged border-unset"
            inputStyles={{padding: "0.2rem", fontSize: "0.7rem", width: "calc(100% - 7rem)"}} shrunkable={false} alwaysDisabled={alwaysDisabled.indexOf(property) > -1} readOnly={!editMode} value={value}
            label={property} labelClasses="prop-field-label" onChange={(formId, id, value) => onChangeActions(formId, id, value, onChange)} />;
        }
      }
    }).filter(element => element);
  }

  const additionalProperties = [
    {name: "border", displayName: "border"},
    {name: "borderRadius", displayName: "border-radius"},
    {name: "fontSize", displayName: "font-size"},
    {name: "background", displayName: "background"},
    {name: "color", displayName: "color"},
    {name: "padding", displayName: "padding"},
    {name: "margin", displayName: "margin"},
    {name: "lineHeight", displayName: "line-height"},
    {name: "fontFamily", displayName: "font-family"},
  ]

  const types = [
    {name: "base", displayName: "Base"},
    {name: "meta", displayName: "Meta"},
    {name: "descriptor", displayName: "Descriptor"}
  ]

  return (
    <div className="c-PropsForm p-1 overflow-auto">
      {selectedComponentConfig && <p className="pl-2 py-2 mb-0 text-muted">Owner: <b><i>{selectedComponentConfig && selectedComponentConfig.meta && selectedComponentConfig.meta.createdBy}</i></b></p>}
      {selectedComponentConfig && <div className="c-PropsForm__propSelector row mb-2">
        <SelectOption layoutClasses="col-5" options={additionalProperties} />
        <SelectOption layoutClasses="col-5" options={types} />
        <div className="col-2">
          <button className="btn btn-success btn-add-prop" onClick={addProperty}>Add</button>
        </div>
      </div>}
      {propFieldRenders()}
      {rootChildrenArray && rootChildrenArray.length > 0 ? !selectedComponentConfig && <p className="default-notification">Please select a component to view details here!</p> : <p className="default-notification">Start adding components to the board to view them here!</p>}
    </div>
  );
};

PropsForm.propTypes = {
  componentsConfig: PropTypes.object,
  clear: PropTypes.bool,
  dispatchClearPropsState: PropTypes.func,
  setComponentsConfig: PropTypes.func,
  userDetails: PropTypes.object
};

const mapStateToProps = createPropsSelector({
  componentsConfig: getPresentComponentsConfig,
  clear: getClearPropsState,
  userDetails: getUserDetails
})

const mapDispatchToProps = {
  dispatchClearPropsState,
  setComponentsConfig
}

export default connect(mapStateToProps, mapDispatchToProps)(PropsForm);