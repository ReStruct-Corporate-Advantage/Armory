import React from 'react';
import './BoardHeader.component.scss';
import BoardTitle from '../BoardTitle';

const BoardHeader = props => {
  return (
    <div className='c-BoardHeader'>
      <BoardTitle title="Test Board" />
    </div>
  );
};

BoardHeader.propTypes = {

};

export default BoardHeader;