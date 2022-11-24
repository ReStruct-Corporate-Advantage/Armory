import React, {useEffect, useState} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {createPropsSelector} from "reselect-immutable-helpers";
import {CSSTransition} from "react-transition-group";
import { getNotification } from "../../global-selectors";
import { dispatchNotification } from "../../global-actions";
import "./Notification.component.scss";

let timeout;
const Notification = props => {
  const {dispatchNotification, notification} = props;
  const message = notification && notification.notification;
  const notificationClass = notification && notification.type;
  const show = notification && notification.show;

  useEffect(() => timeout = setTimeout(() => show && dispatchNotification({show: false}), 5000), [show, dispatchNotification]);

  useEffect(() => {
    console.log(timeout);
    clearTimeout(timeout);
    timeout = setTimeout(() => show && dispatchNotification({show: false}), 5000);
  }, [message, dispatchNotification])

  return <CSSTransition in={show} timeout={500} classNames="fade">
      <div className={`c-Notification position-fixed d-flex${notification ? "" : " fade-exit-done"}${notificationClass ? " " + notificationClass : ""}`}>
        <span className="notification-text d-flex">{message || "Event executed!"}</span>
        <span className="close-btn" onClick={() => dispatchNotification({show: false})}>x</span>
        <span className={`timer${show ? " expand" : ""}`} />
      </div>
    </CSSTransition>;
};

Notification.propTypes = {
  notification: PropTypes.string
};

const mapStateToProps = createPropsSelector({
  notification: getNotification
})

const mapDispatchToProps = {
  dispatchNotification
}

export default connect(mapStateToProps, mapDispatchToProps)(Notification);