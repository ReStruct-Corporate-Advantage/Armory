import mongoose from "mongoose";
import extendSchema from "mongoose-extend-schema";
import { armamentSchema } from "./armory";

const pageSchema = extendSchema(armamentSchema,
    {
      descriptor: {
        components: [{type: mongoose.Schema.Types.ObjectId, ref: "Component"}]
      }
    }
);

const Page = mongoose.model("Page", pageSchema);

export {pageSchema, Page};