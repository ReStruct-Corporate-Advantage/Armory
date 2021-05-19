import React, { useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { createPropsSelector } from "reselect-immutable-helpers";
import { getModal } from "../../global-selectors";
import {dispatchModal} from "../../global-actions"
import * as components from "./..";
import "./Modal.component.scss";

const Modal = props => {
  const {display, name, meta} = props.modal;
  const {body, footer, header, primaryButtonHandler, primaryButtonText, secondaryButtonText, title} = meta;
  const Component = typeof body==="string" ? components[body] ? components[body]: null : (body || null);
  //const submitHandler =  typeof primaryButtonHandler === "function" ? primaryButtonHandler : window[primaryButtonHandler];
  const [defaultHandler,setDefaultHandler] = useState()

  return (
    <div className={`c-Modal modal fade ${display ? "show": ""}`} style={{display:display? "block":"none"}}id="exampleModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
      <div className="modal-dialog" role="document">
        <form className="modal-content">
          <div className="modal-header">
            {header ||
            <><h5 className="modal-title" id="exampleModalLabel">{title}</h5>
            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button></>}
          </div>
          <div className="modal-body">
            {Component && <Component setDefaultHandler={setDefaultHandler}/>}
          </div>
          <div className="modal-footer">
            {footer ||
              <>
                <button type="button" className="btn btn-secondary" data-dismiss="modal">{secondaryButtonText || "Close"}</button>
                <button type="button" className="btn btn-primary" onClick={defaultHandler}>{primaryButtonText || "Submit"}</button>
              </>
            }
          </div>
        </form>
      </div>
    </div>
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