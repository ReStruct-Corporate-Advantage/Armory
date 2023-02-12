import React from "react";
import PropTypes from "prop-types";
import "./Footer.component.scss";

const Footer = (props) => {
  const {containerClasses} = props;
  return (
    <div
      className={`c-Footer position-fixed bottom-0 text-center bg-white w-100 overflow-auto text-dark${containerClasses ? " " + containerClasses : ""}`}
      style={{ height: "1.5rem" }}
    >
      <strong className="fw-bold">
        Powered by Armco<span className="d-sm-inline d-none">'s Stack of Products and Solutions,</span>{" "}
        <a target="_blank" href="/suite">
          FIND OUT MORE
        </a>
      </strong>
    </div>
  );
};

Footer.propTypes = {};

export default Footer;
