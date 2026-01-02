const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Booking = require("../models/Booking");

exports.createCheckoutSession = async (req, res) => {
  try {
    const { bookingPayload } = req.body;

    // 1. Stripe Checkout Session बनाएँ
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "inr",
          product_data: { 
            name: bookingPayload.roomType,
            description: `Booking for ${bookingPayload.totalNights} night(s)`
          },
          unit_amount: bookingPayload.totalAmount * 100, // Stripe को पैसे (paise) में अमाउंट चाहिए
        },
        quantity: 1,
      }],
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/bookingformpage`,
    });

    res.status(200).json({ id: session.id });
  } catch (error) {
    console.error("Stripe Error:", error);
    res.status(500).json({ error: "Payment initiation failed" });
  }
};