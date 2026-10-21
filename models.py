from sqlalchemy import Column, Integer, String, Float, Date
from database import Base

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(String, nullable=False)      # 日付 (例: "2026-10-21")
    amount = Column(Float, nullable=False)     # 金額 (例: 1200.0)
    category = Column(String, nullable=False)  # カテゴリ (例: "食費")
    memo = Column(String, nullable=True)       # メモ (例: "スーパーでの買い物")