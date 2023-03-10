import mongoose from "mongoose";

const armamentSchema = new mongoose.Schema(
    {
      displayName: String,
      name: String,
      owner: String,
      meta: {
        tags: [String],
        createdBy: String,
        updatedBy: String,
      },
      order: Number,
      freeze: {
        type: Boolean,
        default: false
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
      isTemplate: {
        type: Boolean,
        default: false
      },
    },
    {timestamps: true},
);

const Armament = mongoose.model("Armament", armamentSchema);

export {armamentSchema, Armament};
