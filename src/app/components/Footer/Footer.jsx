import React from "react";
import "./Footer.component.scss";

const Footer = (props) => {
  const {containerClasses, footerHeight} = props;
  return (
    <div
      className={`c-Footer position-fixed bottom-0 text-center bg-white w-100 overflow-auto text-dark${containerClasses ? " " + containerClasses : ""}`}
      style={{ height: footerHeight || 0 }}
    >
      <strong>
        Powered by Armco<span className="d-sm-inline d-none">'s Stack of Products and Solutions,</span>{" "}
        <a target="_blank" href="/suite">
          find out more
        </a>
      </strong>
    </div>
  );
};

export default Footer;
