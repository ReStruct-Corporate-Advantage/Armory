import React from "react";
import PropTypes from "prop-types";
import { Link, useNavigate } from "react-router-dom";
import {Hamburger, MenuBar, Search, ToolBox} from "..";
import {TOOLS_CONFIG} from "../../config";
import {APP_LOGO} from "../../static/images"
import ROUTES, {AUTHENTICATED_CHILDREN} from "../../routes";
import "./Header.component.scss";

const menuLessPages = ROUTES.filter(r => r.menuLess).concat(AUTHENTICATED_CHILDREN.filter(r => r.menuLess)).map(r => r.class);
const noToolsPages = ROUTES.filter(r => r.noTools).concat(AUTHENTICATED_CHILDREN.filter(r => r.noTools)).map(r => r.class);
const noSearchPages = ROUTES.filter(r => r.noSearch).concat(AUTHENTICATED_CHILDREN.filter(r => r.noSearch)).map(r => r.class);
const concealHeaderHeightPages = ROUTES.filter(r => r.noTools).concat(AUTHENTICATED_CHILDREN.filter(r => r.concealHeaderHeight)).map(r => r.class);

const Header = props => {
  const {route} = props;
  const {class: classes, headerClasses, displaySignInPrompt} = route || {};
  const navigate = useNavigate();
  const displayMenu = classes && menuLessPages.findIndex(page => classes.indexOf(page) > -1) < 0;
  const displayTools = classes && noToolsPages.findIndex(page => classes.indexOf(page) > -1) < 0;
  const displaySearch = classes && noSearchPages.findIndex(page => classes.indexOf(page) > -1) < 0;
  const concealHeaderHeight = classes && concealHeaderHeightPages.findIndex(page => classes.indexOf(page) > -1) > -1;
  const juice = <header className={`c-Header d-flex align-items-center px-2 py-2
    ${classes ? " " + classes : ""}
    ${headerClasses ? " " + headerClasses : ""}`}>
      <span className="c-Header__app-logo mx-3" onClick={() => navigate("/")}>
        <img src={APP_LOGO} className="h-100 w-100" />
      </span>
      {displayMenu && <MenuBar menuItems={[
          { name: "appCreator", label: "App Creator", selected: true }
            // { name: "pageCreator", label: "Page Creator" },
            // { name: "articleCreator", label: "Article Creator" },
            // { name: "configGenerator", label: "ArmConfig Generator" }
        ]} />}
      {displaySearch && <Search classes="ms-auto me-4 d-none d-sm-flex" />}
      {displaySignInPrompt && <span className="ms-auto me-4 my-4 ps-2 d-none d-sm-block">Or continue to <Link to="/login" className="fw-bold" style={{color: "white"}}>Sign in</Link></span>}
      {displayTools &&
        <>
          <ToolBox toolsConfig={TOOLS_CONFIG.PAGE_TOOLS} />
          <ToolBox toolsConfig={TOOLS_CONFIG.GLOBAL_TOOLS} />
        </>
      }
      {!displayTools && <>
        {/* <Link to="/login" */}
      </>}
      <Hamburger classes="d-sm-none d-block ms-auto" />
    </header>;
  return concealHeaderHeight ? <div className="position-relative">{juice}</div> : juice;
};

Header.propTypes = {
  classes: PropTypes.string
}

export default Header;