import React from "react";
import {useSelector} from "react-redux";
import PropTypes from "prop-types";
import {getLogs} from "../../global-selectors";
import "./Logger.component.scss";

const Logger = props => {
  const {isDevMode, user} = props;
  let logs = useSelector(getLogs);
  logs = logs && logs.length === undefined ? logs.toArray().map(item => item.toObject()) : logs;
  return <div className={`c-Logger overflow-auto${isDevMode ? " expanded" : ""}`} style={{fontFamily: "Courier", fontSize: "0.75rem"}}>
      {logs && logs.map(log => <div>
        {user && <span style={{color: "yellow"}}>[{user.username}:   </span>}
        <span style={{color: "yellow"}}>{log.timestamp ? log.timestamp.toLocaleString("en-US") : ""}]   </span>
        <span style={{color: "lightblue"}}>  {log.log}</span>
      </div>)}
      <div>{user && <span style={{color: "yellow"}}>[{user.username}] &gt;</span>}</div>
    </div>;
};

Logger.propTypes = {
  isDevMode: PropTypes.bool,
  logs: PropTypes.array,
  user: PropTypes.object
};

export default Logger;