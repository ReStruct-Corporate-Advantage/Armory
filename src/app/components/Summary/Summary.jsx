import React from "react";
import PropTypes from "prop-types";
import "./Summary.component.scss";

const Summary = props => {
  const {navigate, user} = props;
  return (
    <div className="c-Summary d-flex justify-content-around px-4 align-items-center h-100">
      <div className="c-Summary__granule blue d-flex flex-column text-center">
        <span className="c-Summary__granule__label mb-1">Total</span>
        <span className="c-Summary__granule__value" onClick={() => navigate(`${user.username}/project`)}>12</span>
      </div>
      <div className="c-Summary__granule orange d-flex flex-column text-center">
        <span className="c-Summary__granule__label mb-1">In Progress</span>
        <span className="c-Summary__granule__value">3</span>
      </div>
      <div className="c-Summary__granule green d-flex flex-column text-center">
        <span className="c-Summary__granule__label mb-1">Completed</span>
        <span className="c-Summary__granule__value">5</span>
      </div>
    </div>
  );
};

Summary.propTypes = {
  navigate: PropTypes.func
};

export default Summary;