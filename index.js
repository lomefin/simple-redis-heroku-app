const express = require("express");
const redis = require("redis");

const client = redis.createClient({
    'url': process.env.REDIS_URL || "redis://localhost:6379"
});

const app = express();
app.get("/", (req, res) => {
    client.get("counter", (err, reply) => {
        let obj = reply ? JSON.parse(reply) : {"counter": 0};
        obj.counter++;
        client.set("counter", JSON.stringify(obj), (err) => {
            res.type("text/plain");
            res.send("Counter is " + obj.counter).end();
        })
    })
})
app.listen(process.env.PORT || 8080);
