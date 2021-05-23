import React from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {withRouter} from "react-router-dom";
import {createPropsSelector} from "reselect-immutable-helpers";
import {getUserDetails} from "./../../global-selectors";
import "./Dashboard.module.scss";

const Dashboard = props => {
  const {history, userDetails} = props;
  const name = userDetails ? userDetails.firstname : ""
  return (
    <div className="c-Dashboard d-flex flex-column h-100">
      <main className="c-Dashboard__main p-4 text-center flex-grow-1">
        <h4 className="page-header glass-panel text-left">Welcome {name}!</h4>
        <div className="content row mt-5">
          <div className="col-6">
            <div className="c-Dashboard__main__resume glass-panel mx-auto">
              <div className="row">
                <p className="section-header col-12">Let's resume where your left...</p>
                <p className="col-12">My Projects</p>
                <p className="col-12">My Pages</p>
                <p className="col-12">My Components</p>
              </div>
            </div>
          </div>
          <div className="col-6">
            <div className="c-Dashboard__main__buttons glass-panel mx-auto">
              <div className="row">
                <span className="section-header col-12">...Or select one of the options below</span>
                <button className="c-Dashboard__btn col-7 raised-effect mx-auto mb-5 mt-4" onClick={() => history.push(`/${userDetails.username}/project`)}>Create a Project</button>
                <button className="c-Dashboard__btn col-7 raised-effect mx-auto mb-5" onClick={() => history.push(`/${userDetails.username}/page`)}>Create a Page Template</button>
                <button className="c-Dashboard__btn col-7 raised-effect mx-auto mb-5" onClick={() => history.push(`/${userDetails.username}/component`)}>Create a Rich Component</button>
                <span className="option-separator col-6 mx-auto mb-5">Or</span>
                <button className="c-Dashboard__btn col-7 raised-effect mx-auto mb-5" onClick={() => history.push(`/${userDetails.username}/template`)}>Use an existing template</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

Dashboard.propTypes = {
  userDetails: PropTypes.object
};

const mapStateToProps = createPropsSelector({
  userDetails: getUserDetails
})

export default connect(mapStateToProps)(withRouter(Dashboard));