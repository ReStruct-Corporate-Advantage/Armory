import React from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import {MenuBar, Search, ToolBox} from "..";
import {TOOLS_CONFIG} from "../../config";
import {APP_LOGO} from "../../static/images"
import "./Header.component.scss";

const menuLessPages = ["login", "join", "dashboard"];
const Header = props => {
  const {classes} = props;
  const navigate = useNavigate();
  const displayMenu = classes && menuLessPages.findIndex(page => classes.indexOf(page) > -1) <0
  return (
    <header className={`c-Header d-flex align-items-center px-2 py-2${classes ? " " + classes : ""}`}>
      <span className="c-Header__app-logo mx-3" onClick={() => navigate("/")}>
        <img src={APP_LOGO} className="h-100 w-100" />
      </span>
      {displayMenu && <MenuBar menuItems={[
          { name: "appCreator", label: "App Creator", selected: true }
            // { name: "pageCreator", label: "Page Creator" },
            // { name: "articleCreator", label: "Article Creator" },
            // { name: "configGenerator", label: "ArmConfig Generator" }
        ]} />}
      <Search classes="ms-auto me-4" />
      <ToolBox toolsConfig={TOOLS_CONFIG.PAGE_TOOLS} />
      <ToolBox toolsConfig={TOOLS_CONFIG.GLOBAL_TOOLS} />
    </header>
  );
};

Header.propTypes = {
  classes: PropTypes.string
}

export default Header;