import mongoose from "mongoose";

const armamentCategorySchema = new mongoose.Schema(
    {
      name: String,
      displayName: String,
      icon: String,
      expanded: Boolean,
      scope: String,
      leafCategory: Boolean,
      order: Number,
      meta: {
        tags: [String],
        createdBy: String,
        updatedBy: String,
      },
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
