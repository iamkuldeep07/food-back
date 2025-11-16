import { Feedback } from "../models/Feedback.js";

export const submitFeedback = async (req, res) => {
  try {
    const { mealType, rating, message, photoUrl } = req.body;

    const feedback = await Feedback.create({
      userId: req.user.id,
      mealType,
      rating,
      message,
      photoUrl: photoUrl || null
    });

    res.json({ message: "Feedback submitted", feedback });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllFeedback = async (req, res) => {
    try {
        const feedbacks = await Feedback.find().populate("userId", "name email");
        res.json(feedbacks);
    } catch (err) {
        res.status(500).json({ message: "Error", error: err.message });
    }
};

export const getMyFeedback = async (req, res) => {
    try {
        const myFeedback = await Feedback.find({ userId: req.user.id });
        res.json(myFeedback);
    } catch (err) {
        res.status(500).json({ message: "Error", error: err.message });
    }
};

export const updateFeedbackStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const fb = await Feedback.findById(id);
        if (!fb) return res.status(404).json({ message: "Feedback not found" });

        fb.status = status;
        await fb.save();

        res.json({ message: "Status updated", fb });
    } catch (err) {
        res.status(500).json({ message: "Error", error: err.message });
    }
};