import React from "react";
import PropTypes from "prop-types";
import {Armament} from "../";
import "./ArmsCategory.component.scss";

const ArmsCategory = props => {
  const {clientRect, expanded, node, prevKey, renderArmory, root, setExpanded} = props;
  // const [collapsed, setCollapsed] = useState(false);
  return (
    <ul className={`c-ArmsCategory${expanded === false ? " collapsed" : ""}`}>
      {!root && <div className="c-ArmsCategory__clickHandler ml-4" onClick={() => setExpanded(!expanded)}>{expanded ? "Collapse" : "Expand"}</div>}
      {node && node.map((category, key) =>
        <li key={prevKey ? prevKey + "-" + key : key} className="c-Aside__list-item">
          <Armament clientRect={clientRect} category={category} index={prevKey ? prevKey + "-" + key : "" + key} recursiveRenderer={renderArmory} />
        </li>
      )}
    </ul>
  );
};

ArmsCategory.propTypes = {
  clientRect: PropTypes.object,
  expanded: PropTypes.bool,
  node: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.array
  ]),
  prevKey: PropTypes.string,
  renderArmory: PropTypes.func,
  root: PropTypes.bool,
  setExpanded: PropTypes.func
};

export default ArmsCategory;