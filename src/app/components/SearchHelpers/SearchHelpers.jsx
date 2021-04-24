import React from 'react';
import PropTypes from 'prop-types';
import {ToolBox} from "./../";
import { TOOLS_CONFIG } from '../../config';
import './SearchHelpers.component.scss';

const SearchHelpers = props => {
  return (
    <div className='c-SearchHelpers d-inline-block'>
      <ToolBox toolsConfig={TOOLS_CONFIG.SEARCH_BAR_TOOLS} />
    </div>
  );
};

SearchHelpers.propTypes = {

};

export default SearchHelpers;