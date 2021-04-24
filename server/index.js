import { createRequire } from 'module';
const require = createRequire(import.meta.url);

import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import armory from "./routes/armory.js";
import http from "http";
import * as socketio from "socket.io";
// const express = require("express");
// const bodyParser = require("body-parser");
// const cors = require("cors")
// const armory = require("./routes/armory");

var corsOptions = {origin: "*", optionsSuccessStatus: 200,};
const app = express();
const server = http.Server(app);
const io = require("socket.io")(server);
app.use(cors(corsOptions))
app.use(bodyParser.json());
app.use("/armory", armory);

io.on('connection', function(socket) {
    console.log('A user connected');
 
    //Whenever someone disconnects this piece of code executed
    socket.on('disconnect', function () {
       console.log('A user disconnected');
    });
 });

// app.get("/todos", (req, res) => {
//     fs.readFile("data/todos.json", "utf8", function(err, data) {
//         if (err) {
//             // console.log(err)
//             return res.json(err);
//         }
//         // console.log(data)
//         return res.json(data)
//     });
// })

// app.post("/todos", (req, res) => {
//     fs.readFile("data/todos.json", "utf8", function(err, data) {
//         if (err) {
//             return res.json(err);
//         } else {
//             let mainDataAsJson = JSON.parse(data)
//             const jsonData = req.body
//             const key = Object.keys(jsonData)[0]
//             const dataCards = mainDataAsJson.todos.lists
//             dataCards[key] = jsonData[key]
//             fs.writeFile("data/todos_save.json", JSON.stringify(mainDataAsJson, null, 4), function(err, data) {
//                 if (err) {
//                     return res.json(err);
//                 }
//                 return res.json(jsonData)
//             });
//         }
//     });
// })


server.listen(3001, () => {
    console.log("App running on the port 3001");
})