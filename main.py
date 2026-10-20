import sqlite3
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="家計簿アプリ API")

# ⚠️ React（http://localhost:5173）からの通信を許可する設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "*"], # 開発時は "*" でもOKです
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Hello from FastAPI!"}

# --- 1. Pydanticによるデータの「型・設計図」定義 ---
# リクエスト（入力）用
class ExpenseCreate(BaseModel):
    date: str       # 例: "2026-03-01"
    category: str   # 例: "食費"
    amount: int     # 例: 1200 (自動で数値チェックされる!)

# レスポンス（出力）用
class ExpenseResponse(ExpenseCreate):
    id: int

class ExpenseListResponse(BaseModel):
    expenses: list[ExpenseResponse]
    total: int


# --- 2. DB初期化関数 ---
def init_db():
    conn = sqlite3.connect("kakeibo.db")
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS expenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            category TEXT NOT NULL,
            amount INTEGER NOT NULL
        )
    """)
    conn.commit()
    conn.close()

init_db()


# --- 3. APIエンドポイント（ルーティング） ---

# 1. 履歴一覧取得 API
@app.get("/api/expenses", response_model=ExpenseListResponse)
def get_expenses():
    conn = sqlite3.connect("kakeibo.db")
    cursor = conn.cursor()
    cursor.execute("SELECT id, date, category, amount FROM expenses ORDER BY date DESC, id DESC")
    rows = cursor.fetchall()
    conn.close()
    
    expenses = []
    total_amount = 0
    
    for row in rows:
        amount = row[3]
        total_amount += amount
        expenses.append({
            "id": row[0],
            "date": row[1],
            "category": row[2],
            "amount": amount
        })
    
    return {"expenses": expenses, "total": total_amount}


# 2. 新規登録 API
@app.post("/api/expenses", response_model=ExpenseResponse)
def create_expense(expense: ExpenseCreate):
    conn = sqlite3.connect("kakeibo.db")
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO expenses (date, category, amount) VALUES (?, ?, ?)",
        (expense.date, expense.category, expense.amount)
    )
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    
    return {
        "id": new_id,
        "date": expense.date,
        "category": expense.category,
        "amount": expense.amount
    }


# 3. 1件取得 API（編集画面などで使用）
@app.get("/api/expenses/{expense_id}", response_model=ExpenseResponse)
def get_expense(expense_id: int):
    conn = sqlite3.connect("kakeibo.db")
    cursor = conn.cursor()
    cursor.execute("SELECT id, date, category, amount FROM expenses WHERE id = ?", (expense_id,))
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        raise HTTPException(status_code=404, detail="指定された支出が見つかりません")
        
    return {
        "id": row[0],
        "date": row[1],
        "category": row[2],
        "amount": row[3]
    }


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