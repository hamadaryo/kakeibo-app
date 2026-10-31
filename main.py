import os
import sqlite3
from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List
import models
from database import engine, get_db
from core.discord import send_discord_notification  # 作成した関数をインポート

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="家計簿アプリ API")

# ⚠️ React（http://localhost:5173）からの通信を許可する設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "*"], # 開発時は "*" でもOKです
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- 1. Pydanticによるデータの「型・設計図」定義 ---
# リクエスト（入力）用
class ExpenseCreate(BaseModel):
    date: str       # 例: "2026-03-01"
    category: str   # 例: "食費"
    amount: int     # 例: 1200 (自動で数値チェックされる!)
    memo: str = None

# レスポンス（出力）用
class ExpenseResponse(ExpenseCreate):
    id: int

    class Config:
        orm_mode = True

class ExpenseListResponse(BaseModel):
    expenses: list[ExpenseResponse]
    total: int


# --- 3. APIエンドポイント（ルーティング） ---

# 1. データの取得（GET）
@app.get("/api/expenses", response_model=List[ExpenseResponse])
def get_expenses(db: Session = Depends(get_db)):
    expenses = db.query(models.Expense).order_by(desc(models.Expense.date)).all()
    return expenses



# 2. データの登録（POST）
@app.post("/api/expenses", response_model=ExpenseResponse)
def create_expense(expense: ExpenseCreate, db: Session = Depends(get_db)):
    db_expense = models.Expense(
        date=expense.date,
        amount=expense.amount,
        category=expense.category,
        memo=expense.memo
    )
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense


# 4. 更新 API
@app.put("/api/expenses/{expense_id}", response_model=ExpenseResponse)
def update_expense(expense_id: int, expense: ExpenseCreate):
    conn = sqlite3.connect("kakeibo.db")
    cursor = conn.cursor()
    
    # 存在確認
    cursor.execute("SELECT id FROM expenses WHERE id = ?", (expense_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="指定された支出が見つかりません")
        
    cursor.execute(
        "UPDATE expenses SET date = ?, category = ?, amount = ? WHERE id = ?",
        (expense.date, expense.category, expense.amount, expense_id)
    )
    conn.commit()
    conn.close()
    
    return {
        "id": expense_id,
        "date": expense.date,
        "category": expense.category,
        "amount": expense.amount
    }


# 5. 削除 API
@app.delete("/api/expenses/{expense_id}")
def delete_expense(expense_id: int):
    conn = sqlite3.connect("kakeibo.db")
    cursor = conn.cursor()
    
    cursor.execute("SELECT id FROM expenses WHERE id = ?", (expense_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="指定された支出が見つかりません")
        
    cursor.execute("DELETE FROM expenses WHERE id = ?", (expense_id,))
    conn.commit()
    conn.close()
    
    return {"message": f"ID: {expense_id} のデータを削除しました"}


# --- 4. フロントエンド（React）の静的ファイル配信設定 ---
frontend_dist = os.path.join(os.path.dirname(__file__), "frontend", "dist")

if os.path.exists(frontend_dist):
    # /assets パスの静的ファイル（JS, CSS等）を配信
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")

    # API以外のすべてのリクエストに対して React の index.html を返す
    @app.get("/{full_path:path}")
    async def serve_react(full_path: str):
        target_file = os.path.join(frontend_dist, full_path)
        if os.path.exists(target_file) and os.path.isfile(target_file):
            return FileResponse(target_file)
        return FileResponse(os.path.join(frontend_dist, "index.html"))