// api/intake.js

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const IG_ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN;
const IG_SENDER_ID = process.env.IG_SENDER_ID;

module.exports = async (req, res) => {
  // --- Verify webhook (GET) ---
  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    } else {
      return res.status(403).send("Verification failed");
    }
  }

  // --- Handle POST events ---
  if (req.method !== "POST") {
    return res.status(200).json({
      ok: true,
      message: "Instagram Iron James bot is running"
    });
  }

  try {
    const body = req.body || {};
    console.log("Incoming Instagram payload:", JSON.stringify(body, null, 2));

    let senderId = null;
    let incomingText = "";

    try {
      const entry = body.entry?.[0];
      const messaging = entry?.messaging?.[0];

      senderId = messaging?.sender?.id;
      incomingText = messaging?.message?.text || "";
    } catch (e) {
      console.error("Parse error:", e);
    }

    if (senderId && IG_ACCESS_TOKEN && IG_SENDER_ID) {
      const url = `https://graph.facebook.com/v21.0/${IG_SENDER_ID}/messages?access_token=${IG_ACCESS_TOKEN}`;

      const replyText =
        "Hi, this is Iron James.\n\n" +
        "To review your accident case, please reply with:\n" +
        "1) How did the accident happen?\n" +
        "2) What injuries do you have?\n" +
        "3) Did you go to a hospital or urgent care? When?\n" +
        "4) Is your car drivable or a total loss?\n\n" +
        "Once you send this, a case manager will contact you.";

      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient: { id: senderId },
          message: { text: replyText }
        })
      });
    }

    return res.status(200).json({
      ok: true,
      status: "received",
      echo: incomingText
    });
  } catch (err) {
    console.error("INTAKE ERROR:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
};
