import React from 'react';
import PropTypes from 'prop-types';
import { Add } from '@material-ui/icons';
import './AddCardButton.component.scss';

const AddCardButton = props => {
  const {addhandler} = props;
  return (
    <div className='c-AddCardButton' onClick={() => addhandler(true)}>
      <span className="c-AddListButton__empty-list__add-button"><Add fontSize="small" />Add another list</span>
    </div>
  );
};

AddCardButton.propTypes = {

};

export default AddCardButton;