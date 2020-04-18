const express = require("express");
const redis = require("redis");
const exphbs = require("express-handlebars")
const path = require("path");
require("dotenv").config();

const client = redis.createClient({
    'url': process.env.REDIS_URL || "redis://localhost:6379"
});

const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.engine("handlebars", exphbs({"defaultLayout": "main"}));
app.set("view engine", "handlebars");

app.get("/", (req, res) => {
    client.get("counter", (err, reply) => {
        let obj = reply ? JSON.parse(reply) : {"counter": 0};
        obj.counter++;
        client.set("counter", JSON.stringify(obj), (err) => {
            res.render("root", obj);
        })
    })
})

app.get("/people", (req, res) => {
    client.get("people", (err, reply) => {
        res.render("root", reply);
    })
})
app.listen(process.env.PORT || 8080);
