import React, {memo} from "react";
import PropTypes from "prop-types";
import {FRAGMENT_TYPE} from "./../../constants/types";
import "./CodeFragment.component.scss";

const CodeFragment = memo(props => {
  const {initial, left, attrKey, type, value} = props;
  let fragment = "";

  // const processObjectValueOfAttribute = (valueObj) => {
  //   return valueObj && Object.keys(valueObj) > 0 ? Object.keys(valueObj).reduce((acc, key) => {
  //       const value = valueObj[key];
  //       return acc + `${key}=${value} `;
  //   }, ""): ""
  // }

  switch (type) {
    case FRAGMENT_TYPE.ENCLOSER:
      fragment = left ? initial ? "<" : "</" : ">";
      break;
    case FRAGMENT_TYPE.TEXT:
    case FRAGMENT_TYPE.TAG:
      fragment = value
      break;
    case FRAGMENT_TYPE.SPACER:
      if (props.count) {
        while (props.count > 0) {
          fragment += " ";
          props.count--;
        }
      } else {
        fragment = " ";
      }
      break;
    case FRAGMENT_TYPE.HANDLER:
    case FRAGMENT_TYPE.ATTRIBUTE:
      // fragment = `${attrKey}="${typeof value === "string" ? value : processObjectValueOfAttribute(value)}"`;
      fragment = `${attrKey}=${typeof value === "string" ? "\"" + value + "\"" : JSON.stringify(value)}`;
      break;
    default:
      fragment = ""
  }
  return (
    <span className="c-CodeFragment">{fragment}</span>
  );
});

CodeFragment.propTypes = {
  count: PropTypes.number,
  initial: PropTypes.bool,
  attrKey: PropTypes.string,
  left: PropTypes.bool,
  type: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.object])
};

export default CodeFragment;