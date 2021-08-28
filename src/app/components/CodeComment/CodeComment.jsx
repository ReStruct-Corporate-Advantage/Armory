import React, {memo} from "react";
import PropTypes from "prop-types";
import "./CodeComment.component.scss";

const CodeComment = memo(props => {
  return (
    // eslint-disable-next-line react/jsx-no-comment-textnodes
    <p className="c-CodeComment" style={{marginLeft: `${props.indent * 0.5}rem`}}>// {props.comment}</p>
  );
});

CodeComment.propTypes = {
  indent: PropTypes.number,
  comment: PropTypes.string
};

export default CodeComment;