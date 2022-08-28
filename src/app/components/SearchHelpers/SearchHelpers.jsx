import React from "react";
import {ToolBox} from "..";
import { TOOLS_CONFIG } from "../../config";
import "./SearchHelpers.component.scss";

const SearchHelpers = props => {
  return (
    <div className="c-SearchHelpers d-inline-block">
      <ToolBox toolsConfig={TOOLS_CONFIG.SEARCH_BAR_TOOLS} />
    </div>
  );
};

export default SearchHelpers;