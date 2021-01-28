import React, {useEffect, useState} from 'react';
// import {DndProvider} from 'react-dnd';
// import HTML5Backend from 'react-dnd-html5-backend';
import {BoardHeader, List} from './../';
import {todos} from './../../config/todos.json';
import './Main.component.scss';

const Main = props => {
  const [todoList, setTodoList] = useState({})

  useEffect(() => {
    fetch('http://localhost:3001/todos')
      .then(res => res.json())
      .then(data => {
        console.log(JSON.parse(data))
        setTodoList(JSON.parse(data).todoList.lists)
      })
      .catch((err) => {
        console.log("Error: " + err)
        setTodoList(todos.lists)
      })
  }, [])
  const todoRenders = todoList && Object.keys(todoList).map((todo, key) => <List list={todoList[todo]} index={key + 1} key={key} />)
  return (
    <div className="container c-Main">
      <div className="row">
        <BoardHeader />
      </div>
      <div className="row c-Main__list-row">
        {todoRenders}
      </div>
    </div>
  );
};

Main.propTypes = {

};

export default Main;