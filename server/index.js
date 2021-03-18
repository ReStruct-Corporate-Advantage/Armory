const fs = require("fs");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors")

var corsOptions = {origin: "*", optionsSuccessStatus: 200,}
const app = express();
app.use(cors(corsOptions))
app.use(bodyParser.json());

app.get("/todos", (req, res) => {
    fs.readFile("data/todos.json", "utf8", function(err, data) {
        if (err) {
            // console.log(err)
            return res.json(err);
        }
        // console.log(data)
        return res.json(data)
    });
})

app.get("/armory", (req, res) => {
    fs.readFile("data/armory.json", "utf8", function(err, data) {
        if (err) {
            // console.log(err)
            return res.json(err);
        }
        // console.log(data)
        return res.json(data)
    });
})

app.post("/todos", (req, res) => {
    fs.readFile("data/todos.json", "utf8", function(err, data) {
        if (err) {
            return res.json(err);
        } else {
            let mainDataAsJson = JSON.parse(data)
            const jsonData = req.body
            const key = Object.keys(jsonData)[0]
            const dataCards = mainDataAsJson.todos.lists
            dataCards[key] = jsonData[key]
            fs.writeFile("data/todos_save.json", JSON.stringify(mainDataAsJson, null, 4), function(err, data) {
                if (err) {
                    return res.json(err);
                }
                return res.json(jsonData)
            });
        }
    });
})


app.listen(3001, () => {
    console.log("App running on the port 3001");
})