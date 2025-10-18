import IntaSend from "intasend-node";
import Course from "../models/Course.js";
import User from "../models/User.js";

// Initialize IntaSend instance with your environment variables
const intasend = new IntaSend(
  process.env.INTASEND_PUBLIC_KEY,
  process.env.INTASEND_SECRET_KEY,
  process.env.INTASEND_ENVIRONMENT // "sandbox" or "production"
);

/**
 * Create IntaSend Checkout Session
 * POST /api/payment/initiate
 * Body: { courseId }
 */
export const initiatePayment = async (req, res) => {
  try {
    const { courseId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    // Create a payment collection request
    const payment = await intasend.collection().create({
      amount: course.price,
      currency: "KES", // or USD if needed
      email: req.user.email,
      phone_number: req.user.phone || "254700000000",
      redirect_url: `${process.env.CLIENT_URL}/payment/success`,
      webhook_url: `${process.env.SERVER_URL}/api/payment/webhook`,
      api_ref: `${req.user._id}-${courseId}-${Date.now()}`, // unique ref to track payment
    });

    res.status(200).json({
      message: "Payment initialized successfully",
      checkout_url: payment.url,
    });
  } catch (error) {
    console.error("IntaSend payment error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Handle IntaSend Webhook
 * POST /api/payment/webhook
 */
export const handleWebhook = async (req, res) => {
  try {
    const event = req.body;

    // Only proceed if payment is complete
    if (event.status === "COMPLETE") {
      const [userId, courseId] = event.api_ref.split("-");

      const course = await Course.findById(courseId);
      const user = await User.findById(userId);

      if (course && user && !course.students.includes(userId)) {
        course.students.push(userId);
        await course.save();

        if (!user.enrolledCourses) user.enrolledCourses = [];
        user.enrolledCourses.push(courseId);
        await user.save();
      }
    }

    res.status(200).send("Webhook received successfully");
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).send("Webhook processing failed");
  }
};
