from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# PostgreSQLへの接続URL
# 形式: postgresql://ユーザー名:パスワード@ホスト名:ポート名/データベース名
#SQLALCHEMY_DATABASE_URL = "postgresql://kakeibo_user:mysecretpassword@localhost:5432/kakeibo_db"

SQLALCHEMY_DATABASE_URL = "sqlite:///./kakeibo.db"

# エンジンの作成
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# セッション（データベースとのやり取りの窓口）の作成
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# モデル（テーブル）のベースクラス
Base = declarative_base()

# リクエストごとにセッションを取得し、終了後に閉じるための関数
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()