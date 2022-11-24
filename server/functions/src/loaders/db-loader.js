import mongoose from "mongoose";

function dbInit(callback) {
  if (!global.db) {
    mongoose.connect(
      `${global.config.db[process.env.NODE_ENV].protocol}://${
        global.config.db[process.env.NODE_ENV].host
      }/${global.config.db[process.env.NODE_ENV].database}${
        global.config.db[process.env.NODE_ENV].options
          ? "?" + global.config.db[process.env.NODE_ENV].options
          : ""
      }`,
      { useNewUrlParser: true, useUnifiedTopology: true }
    );
    const db = mongoose.connection;

    db.on("error", console.error.bind(console, "connection error:"));
    db.once("open", () => (callback ? callback() : {}));
    global.db = db;
    return db;
  }
}

export default dbInit;
