import React from "react";
import PropTypes from "prop-types";
import {
  repository,
} from "../../utils/CodeUtils/ComponentGenerator";
import "./List.component.scss";

const List = props => {
  const {type, data} = props;
  const {content} = data;
  let render = null;
  if (content) {
    switch (type) {
      case "ordered":
        render = <ol className="c-List">
          {content.map(item => <li className="c-List__item">{item}</li>)}
        </ol>
        break;
      case "unordered":
        render = <ul className="c-List">
          {content.map(item => <li className="c-List__item">{item}</li>)}
        </ul>
        break;
      case "link":
        render = <div className="c-List">
          {content.map(item => <span className="c-List__item d-block text-decoration-underline cursor-pointer">{item}</span>)}
        </div>
        break;
      case "carousel":
        render = <div className="c-List d-flex justify-content-between h-100">
          {content.map(item => repository[item] ? <span className="c-List__item d-block cursor-pointer">{repository[item]}</span> : null)}
        </div>
        break;
      case "none":
      default:
        render = <div className="c-List">
          {content.map(item => <p className="c-List__item">{item}</p>)}
        </div>
    }
  }
  return render;
};

List.propTypes = {
  type: PropTypes.string,
  content: PropTypes.array
};

export default List;