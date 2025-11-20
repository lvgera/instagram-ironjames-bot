// api/intake.js
// Вебхук для Instagram Iron James бота на Vercel

module.exports = async (req, res) => {
  // ========= 1. Верификация вебхука (GET) =========
  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    console.log("WEBHOOK VERIFY", {
      mode,
      token,
      envVerifyToken: process.env.VERIFY_TOKEN,
    });

    // Если всё совпало — отдаем challenge
    if (mode === "subscribe" && token === process.env.VERIFY_TOKEN) {
      return res.status(200).send(challenge || "ok");
    }

    // ВРЕМЕННЫЙ дебаг (если открыть ?debug=1)
    if (req.query.debug === "1") {
      return res.status(200).json({
        mode,
        token,
        envVerifyToken: process.env.VERIFY_TOKEN || null,
      });
    }

    return res.status(403).send("Verification failed");
  }

  // ========= 2. Хелс-чек для браузера (не POST) =========
  if (req.method !== "POST") {
    return res.status(200).json({
      ok: true,
      message:
        "Instagram Iron James bot is running. Send POST JSON to this URL.",
    });
  }

  // ========= 3. Обработка сообщений (POST) =========
  try {
    const body = req.body || {};
    const text = body.message || body.text || "";

    console.log("Incoming Instagram payload:", body);

    const reply =
      "Hi, this is Iron James intake bot.\n\n" +
      "To review your accident case, please reply in ONE message with:\n" +
      "1) How did the accident happen?\n" +
      "2) What injuries do you have?\n" +
      "3) Did you go to a hospital or urgent care? When?\n" +
      "4) Is your car drivable, or is it a total loss?\n\n" +
      "After you send this, a case manager will review your answers and contact you.";

    return res.status(200).json({
      ok: true,
      echo: text,
      reply,
    });
  } catch (err) {
    console.error("INTAKE ERROR:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
};
