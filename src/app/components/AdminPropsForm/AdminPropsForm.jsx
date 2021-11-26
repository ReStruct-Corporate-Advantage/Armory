import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {createPropsSelector} from "reselect-immutable-helpers";
import { getUserDetails } from "../../global-selectors";
import { getClearPropsState } from "../../pages/ComponentCreator/selectors";
import { getComponentConfig } from "../../pages/AdminComponentManager/selectors";
import { dispatchClearPropsState } from "../../pages/ComponentCreator/actions";
import { dispatchComponentConfig } from "../../pages/AdminComponentManager/actions";
import {SelectOption, InputField, CheckBox} from "../";
import {compGen, forkedRepository} from "./../../utils/CodeUtils/ComponentGenerator";
import Helper from "../../utils/Helper";
import Network from "./../../utils/network";
import "./AdminPropsForm.component.scss";

const AdminPropsForm = props => {
  const {adminComponentConfig, clear, dispatchClearPropsState, dispatchComponentConfig, editMode, initiateSave, setInitiateSave,
    toggleEditMode, userDetails} = props;
  const [formState, updateFormState] = useState({});
  const alwaysDisabled = ["createdBy", "id", "uuid", "componentName", "meta#createdBy"];
  let editedComponentConfig = adminComponentConfig && adminComponentConfig.component;
  editedComponentConfig = Helper.filterObject(editedComponentConfig, ["armamentCategory", "name", "updatedAt", "index", "createdAt"])
  const selectedComponent = editedComponentConfig ? editedComponentConfig.id : "";

  useEffect(() => {
    if (editedComponentConfig) {
      const requiredProperties = {styles: {}, classes: ""};
      Object.keys(requiredProperties).forEach(property => {
        if (editedComponentConfig.descriptor && !editedComponentConfig.descriptor[property]) {
          editedComponentConfig.descriptor[property] = requiredProperties[property];
        }
      });
    }
  }, [editedComponentConfig]);

  useEffect(() => {
    if (clear) {
      updateFormState({})
      dispatchClearPropsState(false);
    }
  }, [clear, dispatchClearPropsState])

  const onChange = (formState, id, value, editedComponentConfig) => {
    formState[selectedComponent][id] = value;
    editedComponentConfig[id] = value;
  }

  const onInnerChange = (formState, id, value, editedComponentConfig, property, type) => {
    formState[selectedComponent][property] = formState[selectedComponent][property] ? {...formState[selectedComponent][property]} : {}
    id = id.indexOf("#") > -1 ? id.substring(id.indexOf("#") + 1) : id;
    try {
      value = type === "object" ? JSON.parse(value) : value;
      value = value === "true" || value === "false" ? value === "true" : value;
      editedComponentConfig[property][id] = value;
    } catch (e) {
      console.log(e);
    }
    formState[selectedComponent][property][id] = value;
  }

  const onChangeActions = (formId, id, value, action, property, type) => {
    const formStateCloned = {...formState};
    const componentConfigCloned = {...adminComponentConfig};
    const selectedComponentConfigCloned = JSON.parse(JSON.stringify(editedComponentConfig));
    if (!formStateCloned[selectedComponent]) {
      formStateCloned[selectedComponent] = {};
    }
    action(formStateCloned, id, value, selectedComponentConfigCloned, property, type);
    selectedComponentConfigCloned.name = userDetails ? selectedComponentConfigCloned.componentName + "-" + userDetails.username : selectedComponentConfigCloned.name;
    selectedComponentConfigCloned.name = selectedComponentConfigCloned.name + "-" + Helper.findMaxHyphenBased(forkedRepository, selectedComponentConfigCloned.name)
    selectedComponentConfigCloned.state = "new";
    compGen.decideTypeAndGenerateWithConfig(selectedComponentConfigCloned, true, null, "editor"); // Forking here
    componentConfigCloned.component = selectedComponentConfigCloned;
    dispatchComponentConfig(componentConfigCloned);
    updateFormState(formStateCloned);
  }

  const updateProperties = () => {
    const payload = {...editedComponentConfig};
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
        toggleEditMode({...editMode, [selectedComponent]: false});
      })
  }

  const addProperty = () => {

  }

  initiateSave && updateProperties();

  const propFieldRenders = () => {
    return editedComponentConfig && Object.keys(editedComponentConfig).map((property, key) => {
      let incoming = editedComponentConfig[property];
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
            return <CheckBox formId="adminPropsForm" id={idInner} key={key + "-" + keyInner} value={valueInner} layoutClasses="mb-1" inputClasses="small label-right-tagged border-unset" readOnly={!editMode[selectedComponent]}
              inputStyles={{padding: "0.2rem", fontSize: "0.7rem", width: "calc(100% - 7rem)"}}  label={idInner} labelClasses="prop-field-label" alwaysDisabled={alwaysDisabled.indexOf(idInner) > -1}
              onChange={(formId, id, value) => onChangeActions(formId, id, value, onInnerChange, property, valueType)}/>
          } else {
            return <InputField formId="adminPropsForm" id={idInner} key={key + "-" + keyInner} type={typeInner} layoutClasses="mb-1" inputClasses="small label-right-tagged border-unset"
              inputStyles={{padding: "0.2rem", fontSize: "0.7rem", width: "calc(100% - 7rem)"}} shrunkable={false} readOnly={!editMode[selectedComponent]} alwaysDisabled={alwaysDisabled.indexOf(idInner) > -1}
              value={valueInner} label={idInner} labelClasses="prop-field-label" onChange={(formId, id, value) => onChangeActions(formId, id, value, onInnerChange, property, valueType)} />;
          }
        })
      } else {
        const value = formState[selectedComponent] && formState[selectedComponent][property] !== undefined ? formState[selectedComponent][property] : incoming;
        const type = typeof value === "number" ? "number" : "text";
        const isBool = typeof value === "boolean" || value === "true" || value === "false";
        if (isBool) {
          return <CheckBox formId="adminPropsForm" id={property} key={key} value={value} layoutClasses="mb-1" inputClasses="small label-right-tagged border-unset" readOnly={!editMode[selectedComponent]}
              inputStyles={{padding: "0.2rem", fontSize: "0.7rem", width: "calc(100% - 7rem)"}}  label={property} labelClasses="prop-field-label" alwaysDisabled={alwaysDisabled.indexOf(property) > -1}
              onChange={(formId, id, value) => onChangeActions(formId, id, value, onChange)}/>
        } else {
          return <InputField formId="adminPropsForm" id={property} key={key} type={type} layoutClasses="mb-1" inputClasses="small label-right-tagged border-unset"
            inputStyles={{padding: "0.2rem", fontSize: "0.7rem", width: "calc(100% - 7rem)"}} shrunkable={false} alwaysDisabled={alwaysDisabled.indexOf(property) > -1} readOnly={!editMode[selectedComponent]} value={value}
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
    <div className="c-AdminPropsForm p-1 overflow-auto">
      {editedComponentConfig && <p className="ps-2 py-2 mb-0 text-muted">Owner: <b><i>{editedComponentConfig && editedComponentConfig.meta && editedComponentConfig.meta.createdBy}</i></b></p>}
      {editedComponentConfig && <div className="c-AdminPropsForm__propSelector row mb-2">
        <SelectOption layoutClasses="col-5" options={additionalProperties} />
        <SelectOption layoutClasses="col-5" options={types} />
        <div className="col-2">
          <button className="btn btn-success btn-add-prop" onClick={addProperty}>Add</button>
        </div>
      </div>}
      {propFieldRenders()}
      {!editedComponentConfig && <p className="default-notification">Select a component from the menu to view/edit details here!</p>}
    </div>
  );
};

AdminPropsForm.propTypes = {
  adminComponentConfig: PropTypes.object,
  clear: PropTypes.bool,
  dispatchClearPropsState: PropTypes.func,
  dispatchComponentConfig: PropTypes.func,
  userDetails: PropTypes.object
};

const mapStateToProps = createPropsSelector({
  adminComponentConfig: getComponentConfig,
  clear: getClearPropsState,
  userDetails: getUserDetails
})

const mapDispatchToProps = {
  dispatchClearPropsState,
  dispatchComponentConfig
}

export default connect(mapStateToProps, mapDispatchToProps)(AdminPropsForm);