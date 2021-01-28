import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {useDrop} from 'react-dnd';
import {Clear} from '@material-ui/icons';
import {dispatchCardPosition} from './../../pages/Home/actions'
import {Card, AddCardButton, AddListButton} from '../'
import ItemTypes from './../../pages/Home/ItemTypes'
import './List.component.scss';

// document.body.addEventListener('click', (event) => {
//   if (!(event.target.classList.contains('c-List__empty-list') || event.target.classList.contains('c-List__empty-list__new-list-form'))) {
//     setAdding(false);
//   }
// }, true); 
/* eslint no-unused-vars: 0 */
const List = props => {
  const {index} = props;
  const {cards, displayName, id} = props.list;
  const [addingList, setAddingList] = useState(false);
  const [addingCard, setAddingCard] = useState(false);
  const [cardsInState, setCardsInState] = useState(cards);
  const [{isOver}, drop] = useDrop({
    accept: ItemTypes.CARD,
    drop: (item, monitor) => {
      // console.log(id + ' ' + item.listId)
      if (id !== item.listId) {
        pushCard(item.card);
      }
      return {listId: id}
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver()
    }),
  })

  const pushCard = (card) => {
    // cardsInState.forEach(card => console.log(card.id))
    // console.log(card.id)
    // console.log("in push " + id)
    const newState = [...cardsInState, card]
    // console.log(newState)
    setCardsInState(newState)
    // console.log(cardsInState)
    const postBody = {[id]: newState}
    fetch('http://localhost:3001/todos',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postBody, null, "  ")
      })
      .then((response) => response.json())
      .then((data) => {
        console.log('Success:', data);
        // history.push('/display/forms')
      })
      .catch((error) => {
        console.error('Error:', error);
      });
	}

	const removeCard = (index, listId) => {
    console.log("in remove " + listId)
    const clone = []
    Object.assign(clone, cardsInState)
    clone.splice(index, 1)
    console.log(clone)
    setCardsInState(clone)
	}

	const moveCard = (dragIndex, hoverIndex) => {		
		const dragCard = cardsInState[dragIndex];
    const clone = []
    Object.assign(clone, cardsInState)
    clone.splice(dragIndex, 1)
    clone.splice(hoverIndex, 0, dragCard)
    setCardsInState(clone)
  }

  const addCardToList = (event) => {
    const data = {}
    const form = document.forms['c-List__new-card-form']
    const inputField = [...form.getElementsByTagName('textarea')][0]
    // inputFields && inputFields.forEach((inputField) => {
    //   data[inputField.id] = inputField.value && inputField.value.trim()
    // })

    const newState = [...cardsInState, {title: "test title", description: inputField.value, activity: []}]
    setCardsInState(newState)
    setAddingCard(false)
    inputField.value = ""
  }
  const EmptyList = () => {
    return <div className="col-3 c-Main__list-col">
      <div className={`c-List__empty-list${addingList ? " adding" : ""}`}>
        {addingList ?
          <form id="c-List__emptyList__add-list" className="c-List__empty-list__new-list-form" style={{height: "100%", width: "100%"}}>
            <input type="text" className="c-List__empty-list__new-list-textbox" placeholder="Enter list title" />
            <span className="c-List__empty-list__new-list-button"><button type="button" value="Add">Add List</button></span>
          </form> :  <AddListButton addhandler={() => setAddingList(true)} />
        }
      </div>
    </div>
  }

  const cardRenders = cardsInState && cardsInState.map((card, key) => <Card
        key={key} index={key} listId={id} card={card}
        removeCard={removeCard} moveCard={moveCard} />)
    
  return <div className='c-List' ref={drop}>
        {
          cardRenders ? <div className="c-List__container--modifier">
            <div className="c-List__title">{displayName}</div>
            <div id={`c-List__body-${index}`} className="c-List__body">{cardRenders}</div>
            {addingCard ?
              <form id="c-List__new-card-form" className="c-List__new-card-form" style={{height: "100%", width: "100%"}}>
                <textarea type="text" className="c-List__new-card-textbox" placeholder="Enter a title for this card" />
                <span className="c-List__new-card-button"><button type="button" className="btn btn-success" value="Add Card" onClick={addCardToList}>Add Card</button></span>
                <Clear fontSize="medium" style={{marginLeft: '0.5rem', color: '#ccc', cursor: 'pointer'}} onClick={() => setAddingCard(false)} />
              </form> : <div className="c-List__add-card-button"><AddCardButton addhandler={setAddingCard} /></div>
            }
          </div> :  <EmptyList />
        }
      </div>
};

List.propTypes = {
  list: PropTypes.object,
  index: PropTypes.number
};

const mapDispatchToProps = {
  dispatchCardPosition
}


export default connect(
  null,
  mapDispatchToProps
)(List);