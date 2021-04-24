import React, {useEffect, useRef, useState} from "react";
import PropTypes from "prop-types";
import {useDrag} from "react-dnd";
import {getEmptyImage} from "react-dnd-html5-backend";
import {ToolBox} from "./../";
import {GrDrag} from "react-icons/gr";
import { TOOLS_CONFIG } from "../../config";
import {ITEM_TYPE} from "../../constants/types";
import "./Armament.component.scss";

const Armament = props => {

  const {category, clientRect, index, recursiveRenderer} = props;
  const ref = useRef(null)
  const [hovered, setHovered] = useState(false);
  const [expanded, setExpanded] = useState(category.expanded);

  const armamentId = `c-Armament-${index}`
  category.id = armamentId;
  const [{isDragging, clientOffset}, drag, preview] = useDrag({
    item: {type: ITEM_TYPE.ARMAMENT, index, category},
		collect: monitor => ({
      isDragging: !!monitor.isDragging(),
      clientOffset: monitor.getClientOffset()
		}),
  })
  drag(ref)

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, []);

  return (
    <div id={armamentId}
      className="c-Armament c-Armament--modifier c-AttributeCreator--shadow"
      ref={!category.items ? ref : null}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: !category.items ? 'move' : "pointer",
        position: 'relative'
      }}>
      <span className="c-Aside__list-item-text"
        onMouseEnter={(e) => {
          setHovered(true);
        }}
        onMouseLeave={() => setHovered(false)}>
        {category.items ?
          <span className={`c-Armament__list-item-text__collapseStatus mr-2 mt-2${expanded === false ? "" : " expanded"}`}/>
          : <GrDrag className="mr-2 svg-stroke-white" />}
        {category.displayName}
        {hovered && <ToolBox toolsConfig={TOOLS_CONFIG.ARMAMENT_TOOLS} />}
      </span>
      {category.items && recursiveRenderer(category.items, clientRect, index, expanded, setExpanded)}
    </div>
  )
};

Armament.propTypes = {
  category: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object
  ]),
  clientRect: PropTypes.object,
  index: PropTypes.string,
  recursiveRenderer: PropTypes.func
};

export default Armament;