import React, { useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { createPropsSelector } from "reselect-immutable-helpers";
import { getModal } from "../../global-selectors";
import {dispatchModal} from "../../global-actions"
import * as components from "./..";
import "./Modal.component.scss";

const Modal = props => {
  const {modal, dispatchModal} = props;
  const {display, meta} = modal;
  const {body, bodyType, footer, header, primaryButtonText, secondaryButtonText, title, primaryHandler, secondaryHandler} = meta;
  const [defaultHandler,setDefaultHandler] = useState()
  let Component;
  if (bodyType){
    if (bodyType === "string") {
      if (components[body]) {
        Component = components[body];
      } else {
        Component = body;
      }
    } else if (bodyType === "jsx") {
      Component = body;
    } else if (bodyType === "Component") {
      Component = body;
      Component = <Component setDefaultHandler={setDefaultHandler} />
    }
  } else {
    if (typeof body === "string") {
      if (components[body]) {
        Component = components[body];
      } else {
        Component = body;
      }
    } else {
      Component = body || null
      Component = Component ? <Component setDefaultHandler={setDefaultHandler} /> : null;
    }
  }

  const primaryHandlerWrapper = () => {
    primaryHandler ? primaryHandler() : defaultHandler && defaultHandler();
    dispatchModal({display: false, meta: {}})
  }

  const secondaryHandlerWrapper = () => {
    secondaryHandler ? secondaryHandler() : defaultHandler && defaultHandler();
    dispatchModal({display: false, meta: {}})
  }

  return (
    <>
    <div className={`c-Modal modal fade${display ? " show": ""}`} style={{display:display? "block":"none"}}id="exampleModal" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
      <div className="modal-dialog" role="document">
        <form className="modal-content">
          <div className="modal-header">
            {header ||
            <><h5 className="modal-title" id="exampleModalLabel">{title}</h5>
            <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={() => dispatchModal({display: false, meta: {}})}>
              <span aria-hidden="true">&times;</span>
            </button></>}
          </div>
          <div className="modal-body">
            {Component}
          </div>
          <div className="modal-footer">
            {footer ||
              <>
                <button type="button" className="btn btn-secondary" onClick={secondaryHandlerWrapper} data-dismiss="modal">{secondaryButtonText || "Close"}</button>
                <button type="button" className="btn btn-primary" onClick={primaryHandlerWrapper}>{primaryButtonText || "Submit"}</button>
              </>
            }
          </div>
        </form>
      </div>
    </div>
    {display && <div className="modal-backdrop fade show" />}
    </>
  );
};
Modal.propTypes = {
  dispatchModal: PropTypes.func,
  modal: PropTypes.object
};

const mapDispatchToProps = {
  dispatchModal
}
const mapStateToProps = createPropsSelector({
  modal: getModal
})

export default connect(mapStateToProps, mapDispatchToProps)(Modal);