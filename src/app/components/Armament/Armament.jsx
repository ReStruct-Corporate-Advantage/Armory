import React, {useEffect, useRef, useState} from "react";
import PropTypes from "prop-types";
import {useDrag} from "react-dnd";
import {getEmptyImage} from "react-dnd-html5-backend";
import {ComponentDescription, LoadableIcon, RichTooltip, ToolBox} from "./../";
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
  const [{isDragging}, drag, preview] = useDrag({
    type: ITEM_TYPE.ARMAMENT,
    item: {index, category},
		collect: monitor => ({
      isDragging: !!monitor.isDragging()
		}),
  })
  drag(ref)

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  const getOwner = () => {
    return category.meta && category.meta.createdBy && category.meta.createdBy.indexOf("mohiit1502") === -1 ? category.meta.createdBy : "Armory"
  }

  return (
    <div id={armamentId}
      className="c-Armament c-Armament--modifier c-AttributeCreator--shadow"
      ref={!category.items ? ref : null}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: !category.items ? "move" : "pointer",
        position: "relative"
      }}>
      <span className="c-Aside__list-item-text"
        onMouseEnter={(e) => {
          setHovered(true);
        }}
        onMouseLeave={() => setHovered(false)}>
        {category.items ?
          <span className={`c-Armament__list-item-text__collapseStatus me-2 mt-2${expanded === false ? "" : " expanded"}`}/>
          : <><span className="preview"></span><LoadableIcon icon="gr.GrDrag" classes="me-2 svg-stroke-white" /></>}
        {category.displayName} {!category.items && <span className="pill created-by">{getOwner()}</span>}
        {hovered && !category.items && <ToolBox toolsConfig={TOOLS_CONFIG.ARMAMENT_TOOLS} />}
        {hovered && !category.items && <RichTooltip tooltip={<ComponentDescription description={category} />} positionClasses="top-100" />}
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