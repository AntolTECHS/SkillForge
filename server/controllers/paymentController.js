import axios from "axios";
import Course from "../models/Course.js";
import User from "../models/User.js";

export const initiatePayment = async (req, res) => {
  try {
    const { courseId } = req.body;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    // Make a REST call directly to IntaSend Checkout API
    const response = await axios.post(
      "https://payment.intasend.com/api/v1/checkout/",
      {
        amount: course.price,
        currency: "KES",
        email: req.user.email,
        phone_number: req.user.phone || "254700000000",
        redirect_url: `${process.env.CLIENT_URL}/payment/success`,
        webhook_url: `${process.env.SERVER_URL || "http://localhost:5000"}/api/payment/webhook`,
        api_ref: `${req.user._id}-${courseId}-${Date.now()}`,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.INTASEND_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.status(200).json({
      message: "Payment initialized successfully",
      checkout_url: response.data.url,
    });
  } catch (error) {
    console.error("💥 IntaSend payment error:", error.response?.data || error.message);
    res.status(500).json({ message: error.response?.data?.detail || error.message });
  }
};

export const handleWebhook = async (req, res) => {
  try {
    const event = req.body;

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
