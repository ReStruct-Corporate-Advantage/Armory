import mongoose from "mongoose";
import extendSchema from "mongoose-extend-schema";
import { armamentSchema } from "./armory";

const componentSchema = extendSchema(armamentSchema,
  {
    selfClosing: Boolean,
    top: {
      type: String,
      default: "16px",
    },
    left: {
      type: String,
      default: "16px",
    },
    descriptor: {
      allowChildren: {
        type: Boolean,
        default: false,
      },
      elemType: {
        type: String,
        default: "div",
      },
      defaultWidth: {
        type: String,
        default: "6rem",
      },
      defaultHeight: {
        type: String,
        default: "3rem",
      },
      armamentCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ArmamentCategory",
      },
      children: [Map],
      handlers: Map,
      classes: String,
      styles: Map,
    },
  }
);

const Component = mongoose.model("Component", componentSchema);

export {componentSchema, Component};