import mongoose from "mongoose";

const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    questions: [
      {
        question: { type: String, required: true },
        options: [String],
        correctAnswer: String,
      },
    ],
  },
  { timestamps: true }
);

const Quiz = mongoose.models.Quiz || mongoose.model("Quiz", quizSchema);
export default Quiz;
