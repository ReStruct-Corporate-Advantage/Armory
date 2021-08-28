import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { createPropsSelector } from "reselect-immutable-helpers";
import {CSSTransition} from "react-transition-group";
import {getToolActionMeta} from "./../../pages/ComponentCreator/selectors";
import "./ToolActionContainer.component.scss";

const ToolActionContainer = props => {
  const {children, containerClasses, data} = props;
  const content = (
    <>
      <div className="modal-header">
        <h5 className="modal-title">{data && data.modalTitle}</h5>
        <button type="button" className="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div className="modal-body">
        {children}
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-primary">Save</button>
        <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
      </div>
    </>
  );

  return (
    <CSSTransition in={true} timeout={500} classNames="expand" appear>
      <div id="tool-action-modal" className={`c-ToolActionContainer modal${containerClasses ? " " + containerClasses : ""}`} onClick={() => {}}>
        <div className="modal-dialog" role="document">
          <div className="modal-content">
          {content}
          </div>
        </div>
      </div>
    </CSSTransition>
  );
};

ToolActionContainer.propTypes = {
  data: PropTypes.object
};

const mapStateToProps = createPropsSelector({
  data: getToolActionMeta
})

export default connect(mapStateToProps)(ToolActionContainer);