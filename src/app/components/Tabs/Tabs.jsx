import React from "react";
import PropTypes from "prop-types";
import "./Tabs.component.scss";

const Tabs = props => {

  let {children, onChange, value} = props;
  const width = (100 / children.length);
  children = children.map((child, key) => React.cloneElement(child, {width, onChange, index: key, key, value}));

  return (
    <div className="c-Tabs">
      {children}
    </div>
  );
};

Tabs.propTypes = {
  children: PropTypes.array
};

export default Tabs;