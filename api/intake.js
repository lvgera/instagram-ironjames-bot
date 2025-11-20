// api/intake.js
// HTTP-endpoint для Инста-бота на Vercel с логами для дебага

module.exports = async (req, res) => {
  // 1) Проверка вебхука от Instagram (GET с hub.* параметрами)
  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];
    const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

    console.log("WEBHOOK VERIFY CALL:", {
      mode,
      token,
      challenge,
      VERIFY_TOKEN
    });

    // Instagram шлёт это, когда проверяет callback URL
    if (mode === "subscribe" && token === VERIFY_TOKEN && challenge) {
      console.log("WEBHOOK VERIFIED OK, SENDING CHALLENGE");
      res.setHeader("Content-Type", "text/plain");
      return res.status(200).send(String(challenge));
    }

    console.log("WEBHOOK VERIFY FAILED");
    return res.status(403).send("Forbidden");
  }

  // 2) Основная логика — обработка входящих сообщений (POST)
  if (req.method === "POST") {
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
        reply
      });
    } catch (err) {
      console.error("INTAKE ERROR:", err);
      return res.status(500).json({ ok: false, error: "Server error" });
    }
  }

  // Любой другой метод (PUT, DELETE и т.п.)
  return res.status(405).send("Method not allowed");
};
