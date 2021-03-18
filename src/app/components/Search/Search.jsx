import React from "react";
import PropTypes from "prop-types";
import {FormField, SearchHelpers} from "../";
import "./Search.component.scss";

const Search = props => {
  return (
    <div className="c-Search">
      <FormField type="input" />
      <SearchHelpers />
    </div>
  );
};

Search.propTypes = {

};

export default Search;