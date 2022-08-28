import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {createPropsSelector} from "reselect-immutable-helpers";
import { getClearPropsState, getPresentComponentsConfig } from "../../pages/ComponentCreator/selectors";
import { getUserDetails } from "../../global-selectors";
import { dispatchClearPropsState, setComponentsConfig } from "../../pages/ComponentCreator/actions";
import {SelectOption, InputField, CheckBox} from "..";
import {compGen, forkedRepository} from "../../utils/CodeUtils/ComponentGenerator";
import Helper from "../../utils/Helper";
import Network from "../../utils/network";
import "./PropsForm.component.scss";

const PropsForm = props => {
  const {clear, componentsConfig, dispatchClearPropsState, setComponentsConfig, editMode, initiateSave, setInitiateSave, selectedComponent, socket, toggleEditMode, userDetails} = props;
  const [formState, updateFormState] = useState({});
  const [selectorState, updateSelectorState] = useState({});
  const key = "uuid";
  const alwaysDisabled = ["createdBy", "id", "uuid", "componentName", "meta#createdBy"];
  const rootChildrenArray = componentsConfig && componentsConfig.components[0].descriptor.children;
  const returnVal = Helper.searchInTree(key, selectedComponent, componentsConfig, "components", "descriptor.children");
  let {selectedComponentConfig, parent} = returnVal ? returnVal : {};
  selectedComponentConfig = Helper.filterObject(selectedComponentConfig, ["armamentCategory", "name", "updatedAt", "index", "createdAt"])
  // const forkTriggeringProperties = [""];



  useEffect(() => {
    if (selectedComponentConfig) {
      const requiredProperties = {styles: {}, classes: ""};
      Object.keys(requiredProperties).forEach(property => {
        if (selectedComponentConfig.descriptor && !selectedComponentConfig.descriptor[property]) {
          selectedComponentConfig.descriptor[property] = requiredProperties[property];
        }
      });
    }
  }, [selectedComponentConfig]);

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
    const selectedComponentConfigCloned = JSON.parse(JSON.stringify(selectedComponentConfig));
    if (!formStateCloned[selectedComponent]) {
      formStateCloned[selectedComponent] = {};
    }
    parent.splice(parent.findIndex(child => child.uuid === selectedComponentConfig.uuid), 1, selectedComponentConfigCloned);
    action(formStateCloned, id, value, selectedComponentConfigCloned, property, type);
    selectedComponentConfigCloned.name = userDetails ? selectedComponentConfigCloned.componentName + "-" + userDetails.username : selectedComponentConfigCloned.name;
    selectedComponentConfigCloned.name = selectedComponentConfigCloned.name + "-" + Helper.findMaxHyphenBased(forkedRepository, selectedComponentConfigCloned.name)
    selectedComponentConfigCloned.state = "new";
    compGen.decideTypeAndGenerateWithConfig(selectedComponentConfigCloned, true, null, ""); // Forking here
    socket && socket.emit("message", componentsConfigCloned)
    setComponentsConfig(componentsConfigCloned);
    updateFormState(formStateCloned);
  }

  const updateProperties = () => {
    const payload = {...selectedComponentConfig};
    delete payload.top;
    delete payload.left;
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
            return <CheckBox formId="propsForm" id={idInner} key={key + "-" + keyInner} value={valueInner} layoutClasses="mb-1" inputClasses="small label-right-tagged border-unset" readOnly={!editMode[selectedComponent]}
              inputStyles={{padding: "0.2rem", fontSize: "0.7rem", width: "calc(100% - 7rem)"}}  label={idInner} labelClasses="prop-field-label" alwaysDisabled={alwaysDisabled.indexOf(idInner) > -1}
              onChange={(formId, id, value) => onChangeActions(formId, id, value, onInnerChange, property, valueType)}/>
          } else {
            return <InputField formId="propsForm" id={idInner} key={key + "-" + keyInner} type={typeInner} layoutClasses="mb-1" inputClasses="small label-right-tagged border-unset"
              inputStyles={{padding: "0.2rem", fontSize: "0.7rem", width: "calc(100% - 7rem)"}} shrunkable={false} readOnly={!editMode[selectedComponent]} alwaysDisabled={alwaysDisabled.indexOf(idInner) > -1}
              value={valueInner} label={idInner} labelClasses="prop-field-label" onChange={(formId, id, value) => onChangeActions(formId, id, value, onInnerChange, property, valueType)} />;
          }
        })
      } else {
        const value = formState[selectedComponent] && formState[selectedComponent][property] !== undefined ? formState[selectedComponent][property] : incoming;
        const type = typeof value === "number" ? "number" : "text";
        const isBool = typeof value === "boolean" || value === "true" || value === "false";
        if (isBool) {
          return <CheckBox formId="propsForm" id={property} key={key} value={value} layoutClasses="mb-1" inputClasses="small label-right-tagged border-unset" readOnly={!editMode[selectedComponent]}
              inputStyles={{padding: "0.2rem", fontSize: "0.7rem", width: "calc(100% - 7rem)"}}  label={property} labelClasses="prop-field-label" alwaysDisabled={alwaysDisabled.indexOf(property) > -1}
              onChange={(formId, id, value) => onChangeActions(formId, id, value, onChange)}/>
        } else {
          return <InputField formId="propsForm" id={property} key={key} type={type} layoutClasses="mb-1" inputClasses="small label-right-tagged border-unset"
            inputStyles={{padding: "0.2rem", fontSize: "0.7rem", width: "calc(100% - 7rem)"}} shrunkable={false} alwaysDisabled={alwaysDisabled.indexOf(property) > -1} readOnly={!editMode[selectedComponent]} value={value}
            label={property} labelClasses="prop-field-label" onChange={(formId, id, value) => onChangeActions(formId, id, value, onChange)} />;
        }
      }
    }).filter(element => element);
  }

  const additionalProperties = [
    {name: "border", displayName: "border", type: "style"},
    {name: "borderRadius", displayName: "border-radius", type: "style"},
    {name: "fontSize", displayName: "font-size", type: "style"},
    {name: "background", displayName: "background", type: "style"},
    {name: "color", displayName: "color", type: "style"},
    {name: "padding", displayName: "padding", type: "style"},
    {name: "margin", displayName: "margin", type: "style"},
    {name: "lineHeight", displayName: "line-height", type: "style"},
    {name: "fontFamily", displayName: "font-family", type: "style"},
    {name: "other", displayName: "Other"},
  ]

  const types = [
    {name: "style", displayName: "Style"},
    {name: "class", displayName: "Class"},
    {name: "variant", displayName: "Variant"},
    {name: "base", displayName: "Base"},
    {name: "meta", displayName: "Meta"},
    {name: "descriptor", displayName: "Descriptor"}
  ]

  const selectorOnChange = (e, id) => {
    const value = e.target.value;
    const selectorStateCloned = {...selectorState};
    selectorStateCloned[id] = value;
    updateSelectorState(selectorStateCloned);
  }

  const otherSelected = selectorState["value-selector"] === "other";

  return (
    <div className="c-PropsForm p-1 overflow-auto">
      {selectedComponentConfig && <p className="ps-2 pt-2 mb-0 text-muted">Owner: <b><i>{selectedComponentConfig && selectedComponentConfig.meta && selectedComponentConfig.meta.createdBy}</i></b></p>}
      {selectedComponentConfig && <p className="ps-2 pb-2 mb-0 text-muted">Selected: <b><i>{selectedComponentConfig && selectedComponentConfig.uuid}</i></b></p>}
      {selectedComponentConfig && <div className="c-PropsForm__propSelector row mb-2">
          <SelectOption id="type-selector" layoutClasses="col-6" options={types} onChange={selectorOnChange} value={selectorState["type-selector"]} />
          <SelectOption id="value-selector" layoutClasses="col-6" onChange={selectorOnChange}
          options={additionalProperties.filter(prop => !prop.type || prop.type === selectorState["type-selector"])} value={selectorState["value-selector"]} />
        {otherSelected && <><div className="col-6">
            <input className="w-100" id="key-field" placeholder="Attribute Name" />
          </div>
          <div className="col-6">
            <input className="w-100" id="value-field" placeholder="Attribute Value" />
          </div>
        </>}
        <div className="col-4">
          <button className="btn btn-success btn-add-prop w-100 h-100" onClick={addProperty}>Add</button>
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