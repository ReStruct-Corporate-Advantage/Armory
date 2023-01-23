import mongoose from "mongoose";

const componentSchema = new mongoose.Schema(
    {
        owner: String,
        freeze: {
          type: Boolean,
          default: false
        },
        meta: {
          tags: [String],
          createdBy: String,
          updatedBy: String,
        },
        state: {
          type: String,
          enum: ["NEW", "INPROGRESS", "COMPLETED", "ABANDONED", "DEFERRED", "ARCHIVED"],
          default: "NEW"
        },
        visibility: {
          type: String,
          default: "public",
        },
        descriptor: {
          
        },
        isTemplate: {
          type: Boolean,
          default: true
        },
    },
    {timestamps: true},
);

const Component = mongoose.model("Component", componentSchema);

export {componentSchema, Component};