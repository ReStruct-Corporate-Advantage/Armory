import React from 'react';
import PropTypes from 'prop-types';
import './BoardTitle.component.scss';

const BoardTitle = props => {
  return (
    <div className='c-BoardTitle'>
      <p>{props.title}</p>
    </div>
  );
};

BoardTitle.propTypes = {

};

export default BoardTitle;