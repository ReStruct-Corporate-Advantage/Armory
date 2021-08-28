import React, {memo} from "react";
import PropTypes from "prop-types";
import "./CodeLine.component.scss";

const CodeLine = memo(props => {
  return <div className="c-CodeLine" style={{marginLeft: `${props.indent * 0.5}rem`}}>
    {/* <CodeLineController number={props.lineNumber} collapsible={props.collapsible} /> */}
    <p className="mb-0">{props.children}</p>
  </div>
})

CodeLine.propTypes = {
  indent: PropTypes.number,
  text: PropTypes.string
};

export default CodeLine;