import React from "react";
import PropTypes from "prop-types";
import EVENTS from "../../utils/eventHandlers";
import "./Summary.component.scss";

const Summary = props => {
  const {navigate, data, rawData, user} = props;
  const {componentAction: {action, ...rest}, instance} = data;
  const currentData = rawData && rawData[instance];

  let total, inProgress, completed;
  if (currentData) {
    total = currentData.length
    inProgress = currentData.filter(data => data.status === "INPROGESS").length;
    completed = currentData.filter(data => data.status === "COMPLETED").length;
  } else {
    total = inProgress = completed = "-";
  }

  return (
    <div className="c-Summary d-flex justify-content-around px-4 align-items-center h-100">
      <div className="c-Summary__granule blue d-flex flex-column text-center">
        <span className="c-Summary__granule__label mb-1">Total</span>
        <span className="c-Summary__granule__value" onClick={() => EVENTS.genericNavigationClickHandler({
          action,
          actionArgs: {
            navigate,
            ...rest
          }
        }, user)}>{total}</span>
      </div>
      <div className="c-Summary__granule orange d-flex flex-column text-center">
        <span className="c-Summary__granule__label mb-1">In Progress</span>
        <span className="c-Summary__granule__value">{inProgress}</span>
      </div>
      <div className="c-Summary__granule green d-flex flex-column text-center">
        <span className="c-Summary__granule__label mb-1">Completed</span>
        <span className="c-Summary__granule__value">{completed}</span>
      </div>
    </div>
  );
};

Summary.propTypes = {
  navigate: PropTypes.func,
  rawData: PropTypes.object,
  user: PropTypes.object
};

export default Summary;