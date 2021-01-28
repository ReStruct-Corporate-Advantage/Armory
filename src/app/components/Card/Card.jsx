import React, {useRef} from 'react';
import PropTypes from 'prop-types';
import ItemTypes from './../../pages/Home/ItemTypes'
import {useDrag, useDrop} from 'react-dnd'
import './Card.component.scss';
import {Clear} from '@material-ui/icons';

const Card = props => {
  const ref = useRef(null)
  const {card, index, listId, moveCard, removeCard} = props
  const cardId = `c-Card-${listId + "-" + index}`
  card && (card.id = cardId)
  const [{isDragging}, drag] = useDrag({
    item: {type: ItemTypes.CARD, index, card, listId},
    end(item, monitor) {
      const dr = monitor.getDropResult();
      let dropListId;
      dr && (dropListId = dr.listId)
      // console.log(item.listId + " " + dropListId);
      if (monitor.didDrop() && item.listId !== dropListId) {
        removeCard(index, listId)
      }
    },
		collect: monitor => ({
      isDragging: !!monitor.isDragging()
		}),
  })

  const [, drop] = useDrop({
    accept: ItemTypes.CARD,
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
      moveCard(dragIndex, hoverIndex)
      item.index = hoverIndex
    },
  })
  drag(drop(ref))
  return <div
    id={cardId}
    className='c-Card c-Card--modifier c-AttributeCreator--shadow'
    ref={ref}
    style={{
      opacity: isDragging ? 0.5 : 1,
      cursor: 'move',
      position: 'relative'
    }}>
      <Clear className="c-Card__close-button" fontSize="small" onClick={() => removeCard(index, listId)} />
      <div style={{marginTop: '10px'}}>{card && card.title}</div>
      <div>{card && card.description}</div>
    </div>
};

Card.propTypes = {
  card: PropTypes.object,
  index: PropTypes.number,
  listId: PropTypes.string
};

export default Card;