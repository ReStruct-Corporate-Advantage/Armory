import React from "react";
import PropTypes from "prop-types";
import {FormField, SearchHelpers, ToolBox} from "../";
import { TOOLS_CONFIG } from '../../config';
import "./Search.component.scss";

const Search = props => {
  return (
    <div className="c-Search">
      <FormField type="input" />
      <ToolBox toolsConfig={TOOLS_CONFIG.SEARCH_BAR_TOOLS} />
    </div>
  );
};

Search.propTypes = {

};

export default Search;