import React from "react";
import PropTypes from "prop-types";
import "./Header.component.scss";
import {Search, ToolBox} from "../";

const Header = props => {
  return (
    <header className="c-Header d-flex position-fixed align-items-center p-2">
      <Search />
      <ToolBox />
    </header>
  );
};

Header.propTypes = {

};

export default Header;