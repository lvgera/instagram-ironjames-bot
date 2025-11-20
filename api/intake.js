// api/intake.js
// Простейший HTTP-endpoint для Инста-бота на Vercel

module.exports = async (req, res) => {
  // Для проверки, что всё живое
  if (req.method !== "POST") {
    return res.status(200).json({
      ok: true,
      message: "Instagram Iron James bot is running. Send POST JSON to this URL."
    });
  }

  try {
    const body = req.body || {};
    const text = body.message || body.text || "";

    console.log("Incoming Instagram payload:", body);

    // Пока супер-простой автоответ без ИИ.
    // Главное — чтобы вебхук работал. GPT добавим следующим шагом.
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
};
