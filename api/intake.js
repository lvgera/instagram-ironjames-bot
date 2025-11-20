// api/intake.js
// Вебхук для Инста-бота на Vercel

module.exports = async (req, res) => {
  // 1) ПРОВЕРКА ВЕБХУКА ОТ META (GET с hub.* параметрами)
  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    console.log("WEBHOOK VERIFY REQUEST:", { mode, token, challenge });

    if (mode === "subscribe" && token === process.env.VERIFY_TOKEN) {
      console.log("WEBHOOK VERIFIED OK");
      // Meta ждёт тут просто challenge в ответе
      return res.status(200).send(challenge);
    } else {
      console.warn("WEBHOOK VERIFY FAILED");
      return res.status(403).send("Verification failed");
    }
  }

  // 2) ПРОСТАЯ ПРОВЕРКА, ЧТО ЭНДПОИНТ ЖИВОЙ (для браузера и т.п.)
  if (req.method !== "POST") {
    return res.status(200).json({
      ok: true,
      message: "Instagram Iron James bot is running. Send POST JSON to this URL.",
    });
  }

  // 3) ОБРАБОТКА СООБЩЕНИЙ (пока просто автоответ)
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
