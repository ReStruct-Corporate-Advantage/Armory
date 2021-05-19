import mongoose from "mongoose";

function dbInit (callback) {
    if (!global.db) {
        mongoose.connect(`mongodb://${global.config.db.host}/${global.config.db.database}`, {useNewUrlParser: true, useUnifiedTopology: true});
        const db = mongoose.connection;

        db.on("error", console.error.bind(console, "connection error:"));
        db.once("open", () => callback ? callback() : {});
        return db;
    }
}

export default dbInit;