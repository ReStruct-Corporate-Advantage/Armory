import React from 'react';
import PropTypes from 'prop-types';
import './ToolBox.component.scss';

const ToolBox = props => {
  return (
    <div className="c-ToolBox c-SectionHeader__controlPanel">
      <button className="btn btn-edit btn-primary">Edit</button>
      <button className="btn btn-save btn-primary" disabled>Save</button>
      <button className="btn btn-expand btn-primary">Full Screen [ ]</button>
    </div>
  );
};

ToolBox.propTypes = {

};

export default ToolBox;