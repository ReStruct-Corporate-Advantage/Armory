import React, {useEffect} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {createPropsSelector} from "reselect-immutable-helpers";
import {DndProvider} from "react-dnd"
import Backend from "react-dnd-html5-backend"
import {isMobile} from "./selectors";
import {dispatchDeviceType} from "./actions";
import {Aside, Header, Main} from "./../../components";
import Helper from "./../../utils/Helper";
import "./ComponentCreator.module.scss";

const ComponentCreator = props => {

  const {dispatchDeviceType} = props
  useEffect(() => {
    dispatchDeviceType({isMobile: Helper.isMobile()})
    document.body.classList.add("body-modifier")
  }, [dispatchDeviceType])

  return <DndProvider backend={Backend}>
      <div className="c-ComponentCreator h-100">
        <Header />
        <div className="c-ComponentCreator__content d-flex position-fixed">
          <Aside childItems={
            [
              {name: "ArmoryLib"}
            ]
          } position="left" />
          <Main />
          <Aside childItems={
            [
              {name: "PropertiesWidget", props: {title: "Component Details"}},
              {name: "CodeViewerWidget", props: {title: "Generated Code"}}
            ]
          } position="right" styles={{fontSize: "0.8rem"}}/>
        </div>
      </div>
    </DndProvider>;
};

ComponentCreator.propTypes = {
  isMobile: PropTypes.bool,
  dispatchDeviceType: PropTypes.func
};


const mapStateToProps = createPropsSelector({
  isMobile: isMobile
})

const mapDispatchToProps = {
  dispatchDeviceType
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ComponentCreator);