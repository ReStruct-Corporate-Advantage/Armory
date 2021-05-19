import mongoose from "mongoose";

const armamentSchema = new mongoose.Schema({
    name: String
});

const Armament = mongoose.model('Armament', armamentSchema);

export {armamentSchema, Armament};