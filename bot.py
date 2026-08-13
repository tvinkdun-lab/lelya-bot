import os
import random
import string
from flask import Flask, jsonify, request
import requests

app = Flask(__name__)

# Токен и Telegram ID разбиты правильно
TOKEN = "8790088326:AAHdEeGW4HlDTXOAPGWW1BoxBxAVwNgfv0A"
ADMIN_ID = "5773841673"

TELEGRAM_API = f"https://api.telegram.org/bot{TOKEN}"

# Простая база данных в памяти
DATABASE = {"keys": {}, "hwids": {}, "banned": []}


def send_telegram_message(chat_id, text):
  url = f"{TELEGRAM_API}/sendMessage"
  payload = {"chat_id": chat_id, "text": text, "parse_mode": "Markdown"}
  try:
    requests.post(url, json=payload, timeout=5)
  except Exception as e:
    print(f"Ошибка отправки сообщения: {e}")


def generate_key():
  return "".join(
      random.choices(string.ascii_uppercase + string.digits, k=12)
  )


@app.route("/")
def index():
  return "Lelya Hack Bot is active!", 200


@app.route("/webhook", methods=["POST"])
def webhook():
  data = request.json
  if not data or "message" not in data:
    return "OK", 200

  message = data["message"]
  chat_id = str(message["chat"]["id"])
  text = message.get("text", "")
  user_name = message["from"].get("username", "unknown")

  if text.startswith("/start"):
    send_telegram_message(
        chat_id,
        "🤖 **Ляхухак клиент бот активен!**\nОтправьте HWID из игры или используйте /gen для создания ключа.",
    )

  elif "HWID:" in text:
    try:
      hwid_part = text.split("HWID:")[1].split()[0].strip()

      existing_key = None
      for k, v in DATABASE["keys"].items():
        if v.get("hwid") == hwid_part:
          existing_key = k
          break

      if existing_key:
        send_telegram_message(
            chat_id, f"🔑 У этого HWID уже есть активный ключ:\n`{existing_key}`"
        )
      else:
        send_telegram_message(
            chat_id,
            f"⚠️ **Запрос ключа от игрока!**\nHWID: `{hwid_part}`\nСоздатель: @{user_name}\n\nОтправьте /gen для создания.",
        )
    except Exception as e:
      print(f"Ошибка обработки HWID: {e}")

  elif text.startswith("/gen"):
    # Проверка, чтобы только ты мог генерировать ключи
    if ADMIN_ID and chat_id != ADMIN_ID:
      send_telegram_message(chat_id, "❌ У вас нет прав для генерации ключей.")
      return "OK", 200

    new_key = generate_key()
    DATABASE["keys"][new_key] = {"hwid": None, "active": True}
    send_telegram_message(
        chat_id,
        f"✅ **Ваш новый ключ активации:**\n`{new_key}`\n\nВведите его в скрипте игры!",
    )

  return "OK", 200


@app.route("/verify", methods=["POST"])
def verify_key():
  data = request.json
  if not data:
    return jsonify({"status": "error", "message": "No data provided"}), 400

  hwid = data.get("hwid")
  key = data.get("key")

  if hwid in DATABASE["banned"]:
    return jsonify({"status": "banned", "message": "Your HWID is banned."}), 403

  if key in DATABASE["keys"]:
    key_data = DATABASE["keys"][key]
    if not key_data["active"]:
      return jsonify({"status": "error", "message": "Key is inactive."}), 403

    if key_data["hwid"] is None:
      key_data["hwid"] = hwid
      DATABASE["hwids"][hwid] = key

    if key_data["hwid"] == hwid:
      return jsonify({"status": "success", "message": "Access granted."}), 200
    else:
      return (
          jsonify(
              {
                  "status": "error",
                  "message": "Key is already bound to another device.",
              }
          ),
          403,
      )

  return jsonify({"status": "error", "message": "Invalid key."}), 403


if __name__ == "__main__":
  port = int(os.environ.get("PORT", 5000))
  app.run(host="0.0.0.0", port=port)
