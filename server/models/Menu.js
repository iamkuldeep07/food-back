import mongoose from "mongoose";

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
    special: { type: String, default: "" }
}, { timestamps: true });

export const Menu = mongoose.model("Menu", menuSchema);