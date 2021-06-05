import mongoose from "mongoose";

const armamentSchema = new mongoose.Schema({
    displayName: String,
    componentName: String,
    meta: {    
        tags: [String],
        createdBy: String,
        updatedBy: String,
    },
    armamentCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'ArmamentCategory' },
    descriptor: {
        allowChildren: {
            type: Boolean,
            default: false
        },
        elemType: {
            type: String,
            default: "div"
        },
        defaultWidth: {
            type: String,
            default: "6rem"
        },
        defaultHeight: {
            type: String,
            default: "3rem"
        },
        handlers: Map,
        classes: String,
        styles: Map
    }
},
{ timestamps: true });

const Armament = mongoose.model('Armament', armamentSchema);

export {armamentSchema, Armament};