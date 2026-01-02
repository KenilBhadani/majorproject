const stripe = require("stripe")("YOUR_SECRET_KEY"); // अपनी Secret Key यहाँ डालें

app.post("/api/bookings/create-checkout-session", async (req, res) => {
  try {
    const { bookingPayload } = req.body;

    // Stripe Checkout Session बनाना
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr", // भारतीय रुपयों के लिए 'inr'
            product_data: {
              name: bookingPayload.roomType,
              description: `Stay for ${bookingPayload.totalNights} night(s)`,
            },
            unit_amount: bookingPayload.totalAmount * 100, // Stripe को पैसे (cents/paise) में अमाउंट चाहिए होता है
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      // पेमेंट सफल होने पर यूजर इस URL पर जाएगा
      success_url: "http://localhost:3000/booking-success?session_id={CHECKOUT_SESSION_ID}",
      // पेमेंट कैंसिल करने पर यूजर वापस इस URL पर आएगा
      cancel_url: "http://localhost:3000/bookingformpage",
    });

    res.json({ id: session.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});