import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import thunk from "redux-thunk"
import Immutable from "immutable"
import {createStore, applyMiddleware, compose} from "redux"
import reducer from "./reducer";
import Router from "./router";
import * as serviceWorker from "./serviceWorker";
import OverlayScrollbars from "overlayscrollbars";
import * as $ from "jquery";
import "bootstrap/dist/css/bootstrap.min.css"
import 'overlayscrollbars/css/OverlayScrollbars.css';
import "./main.scss"

// Use this for debugging when required to view "name" of an incoming object via API or import
// This will help to look for available API on that object
// Object.prototype.getName = function() { 
//   var funcNameRegex = /function (.{1,})\(/;
//   var results = (funcNameRegex).exec((this).constructor.toString());
//   return (results && results.length > 1) ? results[1] : "";
// };

const composeEnhancers =
typeof window === "object" &&
window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?   
window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
  trace: true,
  traceLimit: 25,
  serialize: { // prettier-ignore
    immutable: Immutable
  }
}) : compose;
const store = createStore(reducer, composeEnhancers(applyMiddleware(thunk)))

ReactDOM.render(<BrowserRouter>
  <Router store={store} />
</BrowserRouter>, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();
serviceWorker.register();