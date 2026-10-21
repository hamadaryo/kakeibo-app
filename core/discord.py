import requests

# Webhook URL（※後で環境変数などに移すとさらに安全です）
DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1562401558287884318/UmHfRzersLK_1zRYN2r-42jTgslDP5NXV669UanIpFCxUK-pZ1dq9SvdOGjKJ0f3aKhF"

def send_discord_notification(path: str, client_host: str):
    """
    Discordにアクセス通知を送信する関数
    """
    message = {
        "content": f"🚨 家計簿アプリにアクセスがありました！\n・パス: `{path}`\n・アクセス元IP: `{client_host}`"
    }
    try:
        requests.post(DISCORD_WEBHOOK_URL, json=message, timeout=3.0)
    except Exception as e:
        print(f"Discord通知失敗: {e}")