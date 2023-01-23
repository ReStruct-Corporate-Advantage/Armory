import mongoose from "mongoose";

const pageSchema = new mongoose.Schema(
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
          components: [{type: mongoose.Schema.Types.ObjectId, ref: "Component"}]
        },
        isTemplate: {
          type: Boolean,
          default: true
        },
    },
    {timestamps: true},
);

const Page = mongoose.model("Page", pageSchema);

export {pageSchema, Page};