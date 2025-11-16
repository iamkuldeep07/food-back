import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    mealType: {
        type: String,
        enum: ["breakfast", "lunch", "snacks", "dinner"],
        required: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    photoUrl: { 
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: ["Pending", "Viewed", "Resolved"],
        default: "Pending"
    }
}, { timestamps: true });

export const Feedback = mongoose.model("Feedback", feedbackSchema);