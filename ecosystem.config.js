module.exports = {
  apps: [
    {
      name: "kakeibo-backend",
      script: "venv/bin/uvicorn",
      args: "main:app --host 0.0.0.0 --port 8000",
      interpreter: "none",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
