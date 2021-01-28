import React from 'react';
import PropTypes from 'prop-types';
import {Add} from '@material-ui/icons';
import './AddListButton.component.scss';

const AddListButton = props => {
  const {addhandler} = props
  return (
    <div className='c-AddListButton' onClick={() => addhandler(true)}>
      <span className="c-AddListButton__empty-list__add-button"><Add fontSize="small" />Add another list</span>
    </div>
  );
};

AddListButton.propTypes = {
  addhandler: PropTypes.func
};

export default AddListButton;