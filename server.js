//imports
const express = require("express");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const https = require("https");
const http = require("http");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const { Server } = require("socket.io");
const cookieParser = require("cookie-parser");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

// app initilize
const app = express();

// db initilize
require("./config/db");

//register middleware
const coreOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 204,
  allowedHeaders:
    "Content-Type, Authorization, X-Requested-With, Accept, VERSION",
  exposedHeaders:
    "Content-Type, Authorization, X-Requested-With, Accept, VERSION",
};
app.use(cors(coreOptions));
app.use(morgan("dev"));
app.use(express.json());


const local = false;
let credentials = {};

if (local) {
  credentials = {
    key: fs.readFileSync("/etc/apache2/ssl/onlinetestingserver.key", "utf8"),
    cert: fs.readFileSync("/etc/apache2/ssl/onlinetestingserver.crt", "utf8"),
    ca: fs.readFileSync("/etc/apache2/ssl/onlinetestingserver.ca")
  };
} else {
  credentials = {
    key: fs.readFileSync("./certs/ssl.key"),
    cert: fs.readFileSync("./certs/ssl.crt"),
    ca: fs.readFileSync("./certs/ca-bundle")
  };
 }



var httpsServer = https.createServer(credentials, app);
// var httpsServer = http.createServer(app);

//limiting the api calls
const limiter = rateLimit({
  max: 1000000,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});


app.use("/api", limiter);

//static routes
app.use("/Uploads", express.static("./Uploads"));

// routes register
app.use("/api", require("./Routes/index"));

//test route
app.get("/", (req, res) => {
  res.send("Eloquint Art Server Running");
});

httpsServer.listen(3004, ()=>{
  console.log(`Listening on port ${3004}`);
})


const io = require("socket.io")(httpsServer, { cors: true, origin: ["*"] });

io.on("connection", (socket) => {
  socket.on("join", (id) => {
    socket.join(id);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

