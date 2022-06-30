import React from "react";
import {MenuBar, Search, ToolBox} from "..";
import {TOOLS_CONFIG} from "../../config";
import "./Header.component.scss";

const Header = props => {
  return (
    <header className="c-Header d-flex align-items-center px-2 py-2">
      <MenuBar menuItems={[
          { name: "appCreator", label: "App Creator", selected: true }
            // { name: "pageCreator", label: "Page Creator" },
            // { name: "articleCreator", label: "Article Creator" },
            // { name: "configGenerator", label: "ArmConfig Generator" }
        ]} />
      <Search classes="ms-auto me-4" />
      <ToolBox toolsConfig={TOOLS_CONFIG.PAGE_TOOLS} />
      <ToolBox toolsConfig={TOOLS_CONFIG.GLOBAL_TOOLS} />
    </header>
  );
};

export default Header;