const express = require("express");
const redis = require("redis");
const exphbs = require("express-handlebars");
const path = require("path");
var cors = require('cors');
const bodyParser = require('body-parser')
require("dotenv").config();

const client = redis.createClient({
    'url': process.env.REDIS_URL || "redis://localhost:6379"
});


var Pusher = require('pusher');

var pusher = new Pusher({
  appId: '998708',
  key: '3885b4a37adc34f0c3e2',
  secret: 'f24976da2f3f743dbe4a',
  cluster: 'mt1',
  encrypted: true
});

pusher.trigger('my-channel', 'my-event', {
  "message": "hello world"
});

const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());
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

app.get("/lightstate", (req, res) => {
    client.get("lightstate", (err, reply) => {
        res.send(reply);
    })
})

app.post("/lightstate", (req, res) => {
    console.log(req.body)
    client.set("lightstate", JSON.stringify(req.body), (err, reply) => {
        res.sendStatus(200);
    });
    pusher.trigger('lights-status','lights-status-update', req.body)
})

app.get("/people", (req, res) => {
    client.get("people", (err, reply) => {
        res.send(reply);
    })
})
app.get("/addpeople", (req, res) => {
    client.set("people", req.query.data, (err, reply) =>{
        res.sendStatus(200);
    })
})
app.get("/clear", (req, res) => {
    client.set("people",JSON.stringify([]), (err, reply) => {
        res.sendStatus(200);
    });
})
app.post("/people", (req, res) => {
    console.log(req.body)
    client.set("people", JSON.stringify(req.body), (err, reply) => {
        res.sendStatus(200);
    });
})
app.listen(process.env.PORT || 8080);


