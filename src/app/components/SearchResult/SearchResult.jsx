import React, { useEffect } from "react";
import PropTypes from "prop-types";
import "./SearchResult.component.scss";

const SearchResult = props => {
  const {classes, searchedString, state} = props;
  const {display, searchResults} = state || {};

  return (
    <div className={`c-SearchResult${classes ? " " + classes : ""} ${display && "show"}`} onClick={e => e.stopPropagation()}>
      {searchedString ? null : <span className="fst-italic text-center mt-5 d-block">Type above to search across Armco...</span>}
    </div>
  );
};

SearchResult.propTypes = {
  classes: PropTypes.string,
  searchedString: PropTypes.string,
  setState: PropTypes.func,
  state: PropTypes.object
}

export default SearchResult;