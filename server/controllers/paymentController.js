import axios from "axios";
import dotenv from "dotenv";
import User from "../models/User.js";
import Course from "../models/Course.js";

dotenv.config();

/* ============================================================
   🔐 MPESA STK PUSH - GENERATE ACCESS TOKEN
   ============================================================ */
const getAccessToken = async () => {
  const auth = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString("base64");

  const { data } = await axios.get(
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    {
      headers: { Authorization: `Basic ${auth}` },
    }
  );
  return data.access_token;
};

/* ============================================================
   ✅ INITIATE PAYMENT (after trial expires)
   ============================================================ */
export const initiatePayment = async (req, res) => {
  try {
    const { courseId, phoneNumber } = req.body;
    const user = req.user;

    if (!courseId || !phoneNumber) {
      return res.status(400).json({ message: "Course ID and phone number required" });
    }

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    // Generate STK Push
    const token = await getAccessToken();
    const timestamp = new Date()
      .toISOString()
      .replace(/[^0-9]/g, "")
      .slice(0, 14);

    const shortcode = process.env.MPESA_SHORTCODE;
    const passkey = process.env.MPESA_PASSKEY;
    const password = Buffer.from(shortcode + passkey + timestamp).toString("base64");

    const payload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: course.price || 1, // use course price, fallback to 1 for test
      PartyA: phoneNumber.startsWith("254") ? phoneNumber : `254${phoneNumber.slice(-9)}`,
      PartyB: shortcode,
      PhoneNumber: phoneNumber.startsWith("254") ? phoneNumber : `254${phoneNumber.slice(-9)}`,
      CallBackURL: `${process.env.SERVER_URL}/api/payment/mpesa-callback`,
      AccountReference: `${user._id}-${courseId}`,
      TransactionDesc: `Payment for ${course.title}`,
    };

    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.status(200).json({
      success: true,
      message: "STK Push initiated",
      checkoutRequestID: response.data.CheckoutRequestID,
      merchantRequestID: response.data.MerchantRequestID,
    });
  } catch (error) {
    console.error("💥 M-Pesa payment error:", error.response?.data || error.message);
    res
      .status(500)
      .json({ message: error.response?.data?.errorMessage || "Payment initiation failed" });
  }
};

/* ============================================================
   ✅ MPESA CALLBACK (update user access)
   ============================================================ */
export const mpesaCallback = async (req, res) => {
  try {
    const body = req.body;

    console.log("📩 M-Pesa Callback received:", JSON.stringify(body, null, 2));

    const resultCode = body?.Body?.stkCallback?.ResultCode;
    const description = body?.Body?.stkCallback?.ResultDesc;
    const metadata = body?.Body?.stkCallback?.CallbackMetadata?.Item;

    if (resultCode === 0) {
      // ✅ Successful payment
      const accountRef = body.Body.stkCallback.CheckoutRequestID; // or AccountReference from payload
      const transactionAmount = metadata?.find((i) => i.Name === "Amount")?.Value;

      // Extract IDs from AccountReference
      const [userId, courseId] = body.Body.stkCallback.MerchantRequestID.split("-");

      const user = await User.findById(userId);
      if (!user) throw new Error("User not found");

      // Update user enrollment record
      const record = user.enrolledCourses.find(
        (c) => c.course.toString() === courseId
      );
      if (record) {
        record.hasPaid = true;
      }
      await user.save();

      console.log(
        `✅ Payment successful for user ${user.email} - Course ${courseId} - Amount: ${transactionAmount}`
      );
    } else {
      console.warn("❌ Payment failed:", description);
    }

    res.status(200).json({ message: "Callback processed successfully" });
  } catch (error) {
    console.error("Error processing M-Pesa callback:", error);
    res.status(500).json({ message: "Callback processing failed" });
  }
};
