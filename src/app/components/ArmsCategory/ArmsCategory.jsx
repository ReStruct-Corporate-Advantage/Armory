import React from "react";
import PropTypes from "prop-types";
import { Armament, StaticArmament } from "..";
import "./ArmsCategory.component.scss";

const ArmsCategory = (props) => {
  const {
    clientRect,
    context,
    expanded,
    isSearched,
    node,
    prevKey,
    renderArmory,
    root,
    setExpanded,
    variant,
  } = props;
  // const [collapsed, setCollapsed] = useState(false);
  return (
    <ul
      className={`c-ArmsCategory overflow-auto${
        expanded === false ? " collapsed" : ""
      }`}
    >
      {!root && (
        <div
          className="c-ArmsCategory__clickHandler ms-4"
          onClick={() => {
            setExpanded(!expanded);
          }}
        >
          {expanded ? "Collapse" : "Expand"}
        </div>
      )}
      {node && node.length > 0 ? (
        node.map((category, key) => (
          <li
            key={prevKey ? prevKey + "-" + key : key}
            className="c-Aside__list-item"
          >
            {context === "editor" ? (
              <StaticArmament
                category={category}
                index={prevKey ? prevKey + "-" + key : "" + key}
                recursiveRenderer={renderArmory}
              />
            ) : (
              <Armament
                clientRect={clientRect}
                category={category}
                isSearched={isSearched}
                index={prevKey ? prevKey + "-" + key : "" + key}
                recursiveRenderer={renderArmory}
              />
            )}
          </li>
        ))
      ) : (
        <span className="empty-armament-message">
          Nothing interesting here!
        </span>
      )}
    </ul>
  );
};

ArmsCategory.propTypes = {
  clientRect: PropTypes.object,
  context: PropTypes.string,
  expanded: PropTypes.bool,
  isSearched: PropTypes.bool,
  node: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  prevKey: PropTypes.string,
  renderArmory: PropTypes.func,
  root: PropTypes.bool,
  setExpanded: PropTypes.func,
  variant: PropTypes.number,
};

export default ArmsCategory;
