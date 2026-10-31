import time
import schedule
import subprocess


def run_backup():
  print("🔄 定期バックアップを開始します...")
  # すでに作成した backup_to_s3.py を実行する
  result = subprocess.run(["python3", "backup_to_s3.py"])
  if result.returncode == 0:
    print("✅ 定期バックアップが正常に完了しました。")
  else:
    print("❌ バックアップの実行中にエラーが発生しました。")


# 実行するスケジュールを設定（例: 毎日深夜3:00）
schedule.every().day.at("12:00").do(run_backup)

# テスト用に「1分ごとに実行」したい場合は上の行をコメントアウトして下の行を有効化できます
# schedule.every(5).seconds.do(run_backup)

print("🚀 Pythonバックアップ自動化スクリプトが起動しました。待機中...")

# 常駐ループ
while True:
  schedule.run_pending()
  time.sleep(1)