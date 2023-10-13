const express = require("express");
const dotenv = require("dotenv").config();
const errorHandler = require("./middleware/errorHandler");
const cors = require("cors");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const pgSession = require('connect-pg-simple')(session);

const app = express();

const port = process.env.PORT;

const db = require('./db'); // Import your PostgreSQL connection

app.use(express.json());
app.use(bodyParser.json());
app.use(cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));
app.use(cookieParser());
app.use(session({
    store: new pgSession({
        pool: db // Pass your PostgreSQL pool here
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        maxAge: 1000 * 60 * 60 * 24
    }
}));


app.use("/api/", require("./routes/prescriptionsRouter"));


app.use(errorHandler)

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})
