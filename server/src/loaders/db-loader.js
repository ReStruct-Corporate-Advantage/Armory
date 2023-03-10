import mongoose from "mongoose";

function dbInit(callback) {
  if (!global.db) {
    mongoose.connect(
        `${global.config.db["development"].protocol}://${
          global.config.db["development"].host
        }/${global.config.db["development"].database}${
        global.config.db["development"].options ?
          "?" + global.config.db["development"].options :
          ""
        }`,
        {useNewUrlParser: true, useUnifiedTopology: true},
    );
    const db = mongoose.connection;

    db.on("error", console.error.bind(console, "connection error:"));
    db.once("open", () => (callback ? callback() : {}));
    global.db = db;
    return db;
  }
}

export default dbInit;
