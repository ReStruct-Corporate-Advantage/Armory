import React from "react";
import "./Footer.component.scss";

const Footer = (props) => {
  const {context, containerClasses, footerHeight} = props;
  return (
    <div
      className={`c-Footer position-fixed bottom-0 w-100 overflow-auto text-dark flex-center${context === "dashboard" ? " d-none" : ""}${containerClasses ? " " + containerClasses : ""}`}
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
