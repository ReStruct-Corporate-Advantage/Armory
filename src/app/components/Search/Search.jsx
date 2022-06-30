import React from "react";
import {FormField, ToolBox} from "..";
import { TOOLS_CONFIG } from "../../config";
import "./Search.component.scss";

const Search = props => {
  const {classes} = props;
  return (
    <div className={`c-Search my-4 ps-2 d-flex${classes ? " " + classes : ""}`}>
      <FormField type="input" containerClasses="c-Search__search-field-container w-100" attributes={{inputClasses: "c-Search__search-field border-none"}} />
      <ToolBox toolsConfig={TOOLS_CONFIG.SEARCH_BAR_TOOLS} />
    </div>
  );
};

export default Search;