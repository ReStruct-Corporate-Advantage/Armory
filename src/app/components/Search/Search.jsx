import React from "react";
import {FormField, ToolBox} from "..";
import { TOOLS_CONFIG } from "../../config";
import "./Search.component.scss";

const Search = props => {
  return (
    <div className="c-Search my-4 w-25 d-flex">
      <FormField type="input" containerClasses="c-Search__search-field-container w-70" attributes={{inputClasses: "w-100 c-Search__search-field"}} />
      <ToolBox toolsConfig={TOOLS_CONFIG.SEARCH_BAR_TOOLS} />
    </div>
  );
};

export default Search;