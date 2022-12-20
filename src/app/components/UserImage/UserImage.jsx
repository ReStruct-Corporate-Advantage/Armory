import React from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import { createPropsSelector } from "reselect-immutable-helpers";
import { getUserDetails } from "../../global-selectors";
import LoadableIcon from "../LoadableIcon";
import "./UserImage.component.scss";

const UserImage = props => {
  const {user} = props;
  return (
    <div className="c-UserImage">
      <LoadableIcon key="user-image-fa-FaUserCircle"icon="fa.FaUserCircle" color="#bbb" />
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