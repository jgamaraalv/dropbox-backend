const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");

class App {
  constructor() {
    this.express = express();
    this.server = require("http").Server(this.express);
    this.io = require("socket.io")(this.server);

    this.middlewares();
    this.routes();
  }

  middlewares() {
    this.express.use(cors());

    this.express.use(express.urlencoded({ extended: true }));

    this.io.on("connection", socket => {
      socket.on("connectRoom", box => {
        socket.join(box);
      });
    });

    mongoose.connect(
      `mongodb+srv://${process.env.NAME_DB}:${
        process.env.PASSWORD_DB
      }@cluster0-2exys.mongodb.net/${process.env.NAME_DB}?retryWrites=true`,
      {
        useNewUrlParser: true
      }
    );

    this.express.use((req, res, next) => {
      req.io = this.io;

      return next();
    });

    this.express.use(express.json());

    this.express.use(express.urlencoded({ extended: true }));

    this.express.use(
      "/files",
      express.static(path.resolve(__dirname, "..", "tmp"))
    );
  }

  routes() {
    this.express.use(require("./routes"));
  }
}

module.exports = new App().express;
