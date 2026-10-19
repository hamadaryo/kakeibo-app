import sqlite3
from flask import Flask, render_template, request, redirect

app = Flask(__name__)

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

# 1. 履歴一覧（ホーム画面）
@app.route("/")
def home():
    conn = sqlite3.connect("kakeibo.db")
    cursor = conn.cursor()
    cursor.execute("SELECT id, date, category, amount FROM expenses ORDER BY date DESC, id DESC")
    rows = cursor.fetchall()
    conn.close()
    
    expenses = []
    total_amount = 0  # 合計金額を計算するための変数
    
    for row in rows:
        amount = row[3]
        total_amount += amount  # Pythonのループで合計を足し込んでいく
        
        expenses.append({
            "id": row[0],
            "date": row[1],
            "category": row[2],
            "amount": amount
        })
    
    # HTMLには、整形したデータ(expenses)と計算済みの合計(total)を渡す
    return render_template("index.html", expenses=expenses, total=total_amount)


# 2. 入力ページ
@app.route("/add", methods=["GET", "POST"])
def add_expense():
    if request.method == "POST":
        date = request.form.get("date")
        category = request.form.get("category")
        amount = request.form.get("amount")
        
        conn = sqlite3.connect("kakeibo.db")
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO expenses (date, category, amount) VALUES (?, ?, ?)",
            (date, category, int(amount))
        )
        conn.commit()
        conn.close()
        return redirect("/")
    
    return render_template("add.html")


# 3. 編集ページ
@app.route("/edit/<int:id>", methods=["GET", "POST"])
def edit_expense(id):
    conn = sqlite3.connect("kakeibo.db")
    cursor = conn.cursor()
    
    if request.method == "POST":
        date = request.form.get("date")
        category = request.form.get("category")
        amount = request.form.get("amount")
        
        cursor.execute(
            "UPDATE expenses SET date = ?, category = ?, amount = ? WHERE id = ?",
            (date, category, int(amount), id)
        )
        conn.commit()
        conn.close()
        return redirect("/")
    
    cursor.execute("SELECT id, date, category, amount FROM expenses WHERE id = ?", (id,))
    row = cursor.fetchone()
    conn.close()
    
    expense = {
        "id": row[0],
        "date": row[1],
        "category": row[2],
        "amount": row[3]
    }
    
    return render_template("edit.html", expense=expense)


# 4. 削除処理
@app.route("/delete/<int:id>", methods=["POST"])
def delete_expense(id):
    conn = sqlite3.connect("kakeibo.db")
    cursor = conn.cursor()
    cursor.execute("DELETE FROM expenses WHERE id = ?", (id,))
    conn.commit()
    conn.close()
    
    return redirect("/")


if __name__ == "__main__":
    app.run(debug=True)