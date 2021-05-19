import React from "react";
import PropTypes from "prop-types";
import { Header } from "../../components";
import "./Dashboard.module.scss";

const Dashboard = props => {
  return (
    <div className="c-Dashboard">
      <Header />
      In Page Dashboard
    </div>
  );
};

Dashboard.propTypes = {

};

export default Dashboard;