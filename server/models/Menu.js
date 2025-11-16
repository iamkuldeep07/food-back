// server/models/Menu.js
import mongoose from "mongoose";

const reactionSub = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const menuSchema = new mongoose.Schema({
  day: {
    type: String,
    required: true,
    enum: [
      "Monday", "Tuesday", "Wednesday", "Thursday",
      "Friday", "Saturday", "Sunday"
    ]
  },
  breakfast: { type: String, required: true },
  lunch: { type: String, required: true },
  snacks: { type: String },
  dinner: { type: String, required: true },
  special: { type: String, default: "" },

  // per-meal reactions
  breakfastLikes:   { type: [reactionSub], default: [] },
  breakfastDislikes:{ type: [reactionSub], default: [] },

  lunchLikes:       { type: [reactionSub], default: [] },
  lunchDislikes:    { type: [reactionSub], default: [] },

  snacksLikes:      { type: [reactionSub], default: [] },
  snacksDislikes:   { type: [reactionSub], default: [] },

  dinnerLikes:      { type: [reactionSub], default: [] },
  dinnerDislikes:   { type: [reactionSub], default: [] },

}, { timestamps: true });

export const Menu = mongoose.model("Menu", menuSchema);