import React from "react";
import {Search, ToolBox} from "..";
import {TOOLS_CONFIG} from "../../config";
import "./Header.component.scss";

const Header = props => {
  return (
    <header className="c-Header d-flex align-items-center px-2 pb-2">
      <Search />
      <ToolBox toolsConfig={TOOLS_CONFIG.PAGE_TOOLS} />
      <ToolBox toolsConfig={TOOLS_CONFIG.GLOBAL_TOOLS} />
    </header>
  );
};

export default Header;