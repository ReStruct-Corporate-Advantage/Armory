import React, {useEffect, useState} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {createPropsSelector} from "reselect-immutable-helpers";
import {DndProvider} from "react-dnd"
import Backend from "react-dnd-html5-backend"
import {getPresentComponentsConfig, isMobile} from "./selectors";
import {dispatchDeviceType} from "./actions";
import {Aside, Header, Main} from "./../../components";
import Helper from "./../../utils/Helper";
import ContainerEventHandlers from "../../utils/ContainerEventHandlers";
import "./ComponentCreator.module.scss";

const ComponentCreator = props => {
  const {componentConfig, dispatchDeviceType} = props
  const [clientRect, setClientRect] = useState({});
  useEffect(() => {
    dispatchDeviceType({isMobile: Helper.isMobile()})
    document.body.classList.add("body-modifier")
  }, [dispatchDeviceType])

  return <DndProvider backend={Backend}>
      <div className="c-ComponentCreator d-flex flex-column flex-nowrap h-100">
        <Header />
        <main className="c-ComponentCreator__content d-flex flex-row flex-nowrap position-fixed" 
          tabIndex="0"
          onKeyDown = {(e) => ContainerEventHandlers.handleKeyDown(e, componentConfig)}
          onKeyUp = {ContainerEventHandlers.handleKeyUp}
          onClick = {ContainerEventHandlers.handleOnClick}>
          <Aside childItems={[{name: "ArmoryLib"}]} clientRect={clientRect} position="left" />
          <Main setClientRect={setClientRect} clientRect={clientRect} />
          <Aside childItems={
            [
              {name: "PropertiesWidget", props: {title: "Component Details"}},
              {name: "CodeViewerWidget", props: {title: "Generated Code"}}
            ]
          } position="right" styles={{fontSize: "0.8rem"}}/>
        </main>
      </div>
    </DndProvider>;
};

ComponentCreator.propTypes = {
  componentConfig: PropTypes.object,
  isMobile: PropTypes.bool,
  dispatchDeviceType: PropTypes.func
};


const mapStateToProps = createPropsSelector({
  componentConfig: getPresentComponentsConfig,
  isMobile: isMobile
})

const mapDispatchToProps = {
  dispatchDeviceType
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ComponentCreator);