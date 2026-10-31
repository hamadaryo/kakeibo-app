import boto3
from botocore.exceptions import NoCredentialsError
import os

# S3クライアントの作成（AWSの認証情報は環境変数やAWS CLIの設定を利用）
s3 = boto3.client('s3')

BUCKET_NAME = 'your-kakeibo-backup-bucket-name'  # ご自身のS3バケット名
LOCAL_FILE = 'expenses.db'                       # バックアップ対象のファイル（家計簿データなど）
S3_FILE_KEY = 'backup/expenses.db'               # S3上での保存先パス

def upload_backup():
    try:
        if not os.path.exists(LOCAL_FILE):
            print(f"エラー: アップロードするファイル '{LOCAL_FILE}' が見つかりません。")
            return

        print(f"S3バケット '{BUCKET_NAME}' へアップロード中...")
        s3.upload_file(LOCAL_FILE, BUCKET_NAME, S3_FILE_KEY)
        print("✅ バックアップのアップロードが成功しました！")
        
    except NoCredentialsError:
        print("エラー: AWSの認証情報が見つかりません。AWS CLIの設定などを確認してください。")
    except Exception as e:
        print(f"予期せぬエラーが発生しました: {e}")

if __name__ == "__main__":
    upload_backup()