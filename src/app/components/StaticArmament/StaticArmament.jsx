import React, {useState} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {createPropsSelector} from "reselect-immutable-helpers";
// import {GrDrag} from "react-icons/gr";
import {getComponentConfig} from "../../pages/AdminComponentManager/selectors";
import {setComponentConfig} from "../../pages/AdminComponentManager/actions";
import {dispatchModal} from "../../global-actions";
import { LoadableIcon } from "..";
import "./StaticArmament.component.scss";

const StaticArmament = props => {

  const {category, componentConfig, setComponentConfig, dispatchModal, index, recursiveRenderer} = props;
  const [expanded, setExpanded] = useState(category.expanded);

  const armamentId = `c-StaticArmament-${index}`
  category.id = armamentId;

  const getOwner = () => {
    return category.meta && category.meta.createdBy && category.meta.createdBy.indexOf("mohiit1502") === -1 ? category.meta.createdBy : "Armory"
  }

  const addComponent = () => {
    const componentConfigClone = JSON.parse(JSON.stringify(componentConfig));
    componentConfigClone.component = {name: category.componentName, top: 0, left: 0, uuid: "edited-component", ...category};
    setComponentConfig(componentConfigClone);
  }
  
  const addItemToContainer = () => {
    if (!componentConfig.component) {
      addComponent();
    } else {
      dispatchModal({display: true, meta: {title: "Discard Changes?", primaryButtonText: "Proceed", secondaryButtonText: "Cancel",
        body: `You're trying to add another component for update, this will replace existing component and discard unsaved changes, if any!
            Click "Proceed" to discard changes, or "Cancel" to continue editing current component`,
        primaryHandler: addComponent,
        secondaryHandler: () => dispatchModal({display: false, meta: {}})}});
    }
  }

  return (
    <div id={armamentId}
      className="c-StaticArmament c-StaticArmament--modifier c-AttributeCreator--shadow"
      role="button"
      onClick={!category.items ? addItemToContainer : () => {}}
      style={{position: "relative"}}>
      <span className="c-Aside__list-item-text">
        {category.items ?
          <span className={`c-Armament__list-item-text__collapseStatus me-2 mt-2${expanded === false ? "" : " expanded"}`}/>
          : <><span className="preview"></span><LoadableIcon key={"StaticArmament-" + category.id + "-gr-GrDrag"} icon="Gr.GrDrag" className="me-2 svg-stroke-white" /></>}
        {category.displayName} {!category.items && <span className="pill created-by">{getOwner()}</span>}
        {/* {hovered && !category.items && <ToolBox toolsConfig={TOOLS_CONFIG.ARMAMENT_TOOLS} />} */}
      </span>
      {category.items && recursiveRenderer(category.items, null, index, expanded, setExpanded)}
    </div>
  )
};

StaticArmament.propTypes = {
  category: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object
  ]),
  componentConfig: PropTypes.object,
  setComponentConfig: PropTypes.func,
  dispatchModal: PropTypes.func,
  dispatchSelectedComponent: PropTypes.func,
  index: PropTypes.string,
  recursiveRenderer: PropTypes.func
};

const mapStateToProps = createPropsSelector({
  componentConfig: getComponentConfig
})

const mapDispatchToProps = {
  setComponentConfig,
  dispatchModal
}

export default connect(mapStateToProps, mapDispatchToProps)(StaticArmament);