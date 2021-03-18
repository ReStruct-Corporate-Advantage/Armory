import React, {useRef} from "react";
import PropTypes from "prop-types";
import {useDrag, useDrop} from "react-dnd";
import ITEM_TYPES from "../../constants/types";
import "./Armament.component.scss";

const Armament = props => {

  const {category, index, recursiveRenderer} = props;
  const ref = useRef(null)

  const armamentId = `c-Armament-${index}`
  category.id = armamentId;
  const [{isDragging}, drag] = useDrag({
    item: {type: ITEM_TYPES.ARMAMENT, index, category},
    end(item, monitor) {
      const dr = monitor.getDropResult();
      let dropListId;
      dr && (dropListId = dr.listId)
      console.log(dr);
      // if (monitor.didDrop() && item.listId !== dropListId) {
      //   removearmament(index, listId)
      // }
    },
		collect: monitor => ({
      isDragging: !!monitor.isDragging()
		}),
  })

  const [, drop] = useDrop({
    accept: ITEM_TYPES.ARMAMENT,
    hover: (item, monitor) => {
      if (!ref.current) {
        return
      }
      const dragIndex = item.index
      const hoverIndex = index
      // console.log("drag " + dragIndex)
      // console.log("hover " + hoverIndex)
      if (dragIndex === hoverIndex) {
        return
      }
      const hoverBoundingRect = ref.current.getBoundingClientRect()
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
      const clientOffset = monitor.getClientOffset()
      const hoverClientY = clientOffset.y - hoverBoundingRect.top
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return
      }
      // moveCard(dragIndex, hoverIndex)
      item.index = hoverIndex
    },
  })
  drag(drop(ref))

  return <div
    id={armamentId}
    className="c-Armament c-Armament--modifier c-AttributeCreator--shadow"
    ref={!category.items ? ref : null}
    style={{
      opacity: isDragging ? 0.5 : 1,
      cursor: !category.items ? 'move' : "pointer",
      position: 'relative'
    }}>
      <div><span className="c-Aside__list-item-text">{category.displayName}</span>{category.items && recursiveRenderer (category.items, index)}</div>
    </div>;
};

Armament.propTypes = {
  category: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object
  ]),
  recursiveRenderer: PropTypes.func
};

export default Armament;