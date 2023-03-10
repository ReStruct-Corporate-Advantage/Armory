import React, {useEffect, useRef, useState} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {useDrag} from "react-dnd";
import {getEmptyImage} from "react-dnd-html5-backend";
import {dispatchTooltip} from "../../global-actions";
import {ComponentDescription, LoadableIcon, ToolBox} from "..";
import { TOOLS_CONFIG } from "../../config";
import {ITEM_TYPE} from "../../constants/types";
import "./Armament.component.scss";

const Armament = props => {

  const {category, clientRect, dispatchTooltip, index, isSearched, recursiveRenderer} = props;
  const type = category.type;
  const ref = useRef(null)
  const [hovered, setHovered] = useState(false);
  const [expanded, setExpanded] = useState(category.expanded);
  const [itemRect, setItemRect] = useState();

  const armamentId = `c-Armament-${index}`
  category.id = armamentId;
  const [{isDragging}, drag, preview] = useDrag({
    type: type || ITEM_TYPE.ARMAMENT,
    item: {index, category: {...category}},
		collect: monitor => ({
      isDragging: !!monitor.isDragging()
		}),
  })
  drag(ref)

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
    ref.current && setItemRect(ref.current);
  }, [preview, ref]);


  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    !category.items && dispatchTooltip({show: hovered, prefer: "right", content: <ComponentDescription description={category} />, itemRect})
  }, [hovered])

  const getOwner = () => {
    return category.meta && category.meta.createdBy && category.meta.createdBy.indexOf("mohiit1502") === -1 ? category.meta.createdBy : "Armory"
  }

  return !isSearched || category.mark ? <div id={armamentId}
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
          : <><span className="preview"></span><LoadableIcon key={"Armament-" + category.id + "-gr-GrDrag"} icon="gr.GrDrag" color="#d3d3d3" classes="me-2" /></>}
        {category.displayName} {!category.items && <span className="pill created-by">{getOwner()}</span>}
        {hovered && !category.items && <ToolBox toolsConfig={TOOLS_CONFIG.ARMAMENT_TOOLS} />}
      </span>
      {category.items && recursiveRenderer(category.items, clientRect, index, expanded, setExpanded)}
    </div> : null;
};

Armament.propTypes = {
  category: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object
  ]),
  clientRect: PropTypes.object,
  isSearched: PropTypes.bool,
  index: PropTypes.string,
  recursiveRenderer: PropTypes.func,
  type: PropTypes.string
};

const mapDispatchToProps = {
  dispatchTooltip
}

export default connect(null, mapDispatchToProps)(Armament);