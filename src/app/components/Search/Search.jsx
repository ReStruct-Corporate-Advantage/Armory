import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import { createPropsSelector } from "reselect-immutable-helpers";
import { getHideSearchResults } from "../../global-selectors";
import { dispatchHideSearchResults } from "../../global-actions";
import {FormField, SearchResult, ToolBox} from "..";
import { Helper } from "../../utils";
import { TOOLS_CONFIG } from "../../config";
import "./Search.component.scss";

const Search = props => {
  const {classes, dispatchHideSearchResults, hideSearchResults} = props;
  const [searchResultState, setSearchResultState] = useState();
  const [searchedString, setSearchedString] = useState();
  const onChange = Helper.debounce((value) => setSearchedString(value), 300);

  useEffect(() => {
    // Network.get()
  }, [searchedString]);

  useEffect(() => {
    setSearchResultState({display: hideSearchResults === false});
  }, [hideSearchResults]);

  return (
    <div className={`c-Search my-4 ps-2 d-flex position-relative${classes ? " " + classes : ""}`}>
      <FormField
        type="input"
        containerClasses="c-Search__search-field-container w-100"
        onChange={onChange}
        attributes={{inputClasses: "c-Search__search-field border-none", onClick: e => {
        e.stopPropagation();
        dispatchHideSearchResults(false);
      }}} />
      <SearchResult state={searchResultState} type="concise" classes="position-absolute" />
      <ToolBox toolsConfig={TOOLS_CONFIG.SEARCH_BAR_TOOLS} />
    </div>
  );
};

Search.propTypes = {
  classes: PropTypes.string,
  hideSearchResults: PropTypes.bool
};

const mapStateToProps = createPropsSelector({
  hideSearchResults: getHideSearchResults
})

const mapDispatchToProps = {
  dispatchHideSearchResults
};

export default connect(mapStateToProps, mapDispatchToProps)(Search);