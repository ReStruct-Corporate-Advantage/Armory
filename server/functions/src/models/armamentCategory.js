import mongoose from "mongoose";
import extendSchema from "mongoose-extend-schema";
import { armamentSchema } from "./armory";

const armamentCategorySchema = extendSchema(armamentSchema,
    {
      icon: String,
      expanded: Boolean,
      scope: String,
      leafCategory: Boolean,
      armamentCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ArmamentCategory",
      },
      items: [{type: mongoose.Schema.Types.ObjectId, ref: "Armament"}],
    },
    {timestamps: true},
);

const ArmamentCategory = mongoose.model(
    "ArmamentCategory",
    armamentCategorySchema,
);

export {armamentCategorySchema, ArmamentCategory};
