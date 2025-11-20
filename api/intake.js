// api/intake.js
// Вебхук для Instagram на Vercel: верификация + автоответ в DM

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const IG_ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN;
const IG_SENDER_ID = process.env.IG_SENDER_ID; // 17841478576695143

module.exports = async (req, res) => {
  // 1) Верификация вебхука (GET с hub.*)
  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    console.log("VERIFY REQUEST:", { mode, token, challenge });

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      // Всё ок — отдаем challenge как есть
      return res.status(200).send(challenge);
    } else {
      return res.status(403).send("Verification failed");
    }
  }

  // 2) Простой health-check для браузера/GET без параметров
  if (req.method !== "POST") {
    return res.status(200).json({
      ok: true,
      message: "Instagram Iron James bot is running. Send POST JSON to this URL."
    });
  }

  // 3) Обработка входящего webhook-события от Instagram
  try {
    const body = req.body || {};
    console.log("Incoming Instagram payload:", JSON.stringify(body, null, 2));

    // Структура примерно:
    // body.entry[0].changes[0].value.messages[0].text.body
    const entry = Array.isArray(body.entry) ? body.entry[0] : null;
    const change = entry && Array.isArray(entry.changes) ? entry.changes[0] : null;
    const value = change ? change.value : null;

    const messages = value && Array.isArray(value.messages) ? value.messages : [];
    const firstMessage = messages[0] || null;

    const fromId =
      (firstMessage && firstMessage.from) ||
      (value &&
        Array.isArray(value.contacts) &&
        value.contacts[0] &&
        value.contacts[0].id) ||
      null;

    const text =
      (firstMessage && firstMessage.text && firstMessage.text.body) ||
      "";

    // Если это не сообщение в DM — просто подтверждаем
    if (!fromId || !text) {
      console.log("No DM message found in webhook, skipping.");
      return res.status(200).json({ ok: true, skipped: true });
    }

    // 4) Текст автоответа
    const replyText =
      "Hi, this is Iron James intake bot.\n\n" +
      "To review your accident case, please reply in ONE message with:\n" +
      "1) How did the accident happen?\n" +
      "2) What injuries do you have?\n" +
      "3) Did you go to a hospital or urgent care? When?\n" +
      "4) Is your car drivable, or is it a total loss?\n\n" +
      "After you send this, a case manager will review your answers and contact you.";

    // 5) Отправляем ответ через Graph API в Instagram DM
    const url =
      `https://graph.facebook.com/v21.0/${IG_SENDER_ID}/messages` +
      `?access_token=${encodeURIComponent(IG_ACCESS_TOKEN)}`;

    const payload = {
      messaging_product: "instagram",
      recipient: { id: fromId },
      message: { text: replyText }
    };

    console.log("Sending reply via Graph API:", payload);

    const graphRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const graphData = await graphRes.json();
    console.log("Graph API response:", graphRes.status, graphData);

    if (!graphRes.ok) {
      throw new Error(
        "Graph API error " +
          graphRes.status +
          " " +
          JSON.stringify(graphData)
      );
    }

    // Отвечаем Meta, что всё ок
    return res.status(200).json({
      ok: true,
      received_text: text,
      sent_text: replyText
    });
  } catch (err) {
    console.error("INTAKE ERROR:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
};
