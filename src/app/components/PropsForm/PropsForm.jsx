import React, { useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {createPropsSelector} from "reselect-immutable-helpers";
import { getPresentComponentsConfig } from "../../pages/ComponentCreator/selectors";
import Helper from "../../utils/Helper";
import InputField from "../form-components/InputField";
import "./PropsForm.component.scss";

const PropsForm = props => {
  const {componentsConfig, editMode, selectedComponent} = props;
  const [formState, updateFormState] = useState({});
  const key = "uuid";
  const value = selectedComponent;
  let selectedComponentConfig = Helper.searchInTree(key, value, componentsConfig, "components", "descriptor.children");
  selectedComponentConfig = Helper.filterObject(selectedComponentConfig, ["armamentCategory", "name", "updatedAt", "index", "createdAt"])

  const onChange = (formId, id, value) => {
    const formStateCloned = {...formState};
    formStateCloned[id] = value;
    updateFormState(formStateCloned);
  }

  const updateProperties = () => {
    const payload = {...selectedComponentConfig};
    formState && Object.keys(formState).forEach(key => {
      payload[key] = formState[key];
    })
  }

  const propFieldRenders = () => {
    return selectedComponentConfig && Object.keys(selectedComponentConfig).map((property, key) => {
      let incoming = selectedComponentConfig[property];
      let value = formState[property] !== undefined ? formState[property] : incoming;
      if (typeof value === "object" && !value.length) {
        return Object.keys(value).map((propertyInner, keyInner) => {
          const idInner = `${property}-${propertyInner}`;
          let valueInner = value[propertyInner];
          valueInner = formState[property] && formState[property][idInner] !== undefined ? formState[property][idInner] : (typeof valueInner === "object" ? valueInner.length ? valueInner.join(",") : JSON.stringify(valueInner) : valueInner);
          const onInnerChange = (formId, id, value) => {
            const formStateCloned = {...formState};
            if (!formStateCloned[property]) {
              formStateCloned[property] = {};
            } else {
              formStateCloned[property] = {...formStateCloned[property]};
            }
            formStateCloned[property][id] = value;
            updateFormState(formStateCloned);
          }
          return <InputField formId="propsForm" id={idInner} key={key + "-" + keyInner} layoutClasses="mb-1" inputClasses="border-small-radius border-unset" inputStyles={{padding: "0.2rem", fontSize: "0.7rem"}} shrunkable={false} readOnly={!editMode}
            value={valueInner} label={propertyInner} labelClasses="prop-field-label" onChange={onInnerChange} />;
        })
      } else {
        return <InputField formId="propsForm" id={property} key={key} layoutClasses="mb-1" inputClasses="border-small-radius border-unset" inputStyles={{padding: "0.2rem", fontSize: "0.7rem"}} shrunkable={false}
          readOnly={!editMode} value={value} label={property} labelClasses="prop-field-label" onChange={onChange} />;
      }
    }).filter(element => element);
  }

  return (
    <div className="c-PropsForm p-1 overflow-auto">
      {propFieldRenders()}
    </div>
  );
};

PropsForm.propTypes = {
  componentsConfig: PropTypes.object
};

const mapStateToProps = createPropsSelector({
  componentsConfig: getPresentComponentsConfig
})

export default connect(mapStateToProps)(PropsForm);