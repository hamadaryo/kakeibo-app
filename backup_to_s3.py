import os
import boto3
from botocore.exceptions import NoCredentialsError
import requests  # Discord通知用

# S3クライアントの作成
s3 = boto3.client('s3')

BUCKET_NAME = 'kakeibo-backup-20261031'  # ご自身のS3バケット名
LOCAL_FILE = 'kakeibo.db'  # バックアップ対象のファイル
S3_FILE_KEY = 'backup/expenses.db'  # S3上での保存先パス

# Discord Webhook URL（正しいURLをシングルクォーテーションで囲む）
DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1562401558287884318/UmHfRzersLK_1zRYN2r-42jTgslDP5NXV669UanIpFCxUK-pZ1dq9SvdOGjKJ0f3aK'


def send_discord_notification(message):
  if not DISCORD_WEBHOOK_URL or 'your-webhook-url' in DISCORD_WEBHOOK_URL:
    print('⚠️ Discord Webhook URLが正しく設定されていません。')
    return

  data = {'content': message}
  try:
    response = requests.post(DISCORD_WEBHOOK_URL, json=data)
    if response.status_code in [200, 204]:
      print('✅ Discord通知の送信に成功しました！')
    else:
      print(
          f'❌ Discord通知エラー: ステータスコード {response.status_code},'
          f' レスポンス: {response.text}'
      )
  except Exception as e:
    print(f'❌ Discord通知の例外発生: {e}')


def upload_backup():
  try:
    if not os.path.exists(LOCAL_FILE):
      print(f"エラー: アップロードするファイル '{LOCAL_FILE}' が見つかりません。")
      return

    print(f"S3バケット '{BUCKET_NAME}' へアップロード中...")
    s3.upload_file(LOCAL_FILE, BUCKET_NAME, S3_FILE_KEY)
    print('✅ バックアップのアップロードが成功しました！')

    # バックアップ成功時にDiscordへ通知
    send_discord_notification(
        '✅ 家計簿のデータベースがAWS S3にバックアップされました！'
    )

  except NoCredentialsError:
    print(
        'エラー: AWSの認証情報が見つかりません。AWS CLIの設定などを確認してください。'
    )
    send_discord_notification(
        '❌ 家計簿のバックアップ失敗: AWS認証情報エラー'
    )
  except Exception as e:
    print(f'予期せぬエラーが発生しました: {e}')
    send_discord_notification(f'❌ 家計簿のバックアップに失敗しました: {e}')


if __name__ == '__main__':
  upload_backup()