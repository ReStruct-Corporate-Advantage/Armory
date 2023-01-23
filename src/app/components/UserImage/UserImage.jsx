import React from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import { createPropsSelector } from "reselect-immutable-helpers";
import { getUserDetails } from "../../global-selectors";
import {LoadableIcon} from "..";
import EVENTS from "../../utils/eventHandlers";
import "./UserImage.component.scss";

const UserImage = props => {
  const {user, containerClasses, ...rest} = props;
  return (
    <div className={`c-UserImage${containerClasses ? " " + containerClasses : ""}`} style={{height: rest.expandSize}}>
      <span role="button">
        <LoadableIcon key="user-image-fa-FaUserCircle" {...rest} />
        {!rest.collapsed && <small className="text-center d-block mt-3" style={{cursor: "pointer"}}
          onClick={() => EVENTS.genericNavigationClickHandler(rest, user)}>
          <u>Manage Profile</u>
        </small>}
      </span>
    </div>
  );
};

UserImage.propTypes = {
  user: PropTypes.object
};

const mapStateToProps = createPropsSelector({
  user: getUserDetails
})

export default connect(mapStateToProps)(UserImage);