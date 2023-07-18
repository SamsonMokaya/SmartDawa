const express = require("express");
const dotenv  = require("dotenv").config();
const errorHandler = require("./middleware/errorHandler");
const cors = require("cors");
const session = require("express-session")
const cookiParser = require("cookie-parser")
const bodyParser = require("body-parser")

const app = express();

const port = process.env.PORT;

app.use(express.json())
app.use(bodyParser.json())
app.use(cors(
    {origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true}
))
app.use(cookiParser())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        maxAge: 1000 * 60 * 60 * 24
    }
}))


app.use("/api/", require("./routes/prescriptionsRouter"));


app.use(errorHandler)

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})