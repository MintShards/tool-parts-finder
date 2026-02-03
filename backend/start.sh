#!/bin/bash
echo "PORT environment variable: $PORT"
export PORT=${PORT:-8000}
echo "Using PORT: $PORT"
exec uvicorn app.main:app --host 0.0.0.0 --port $PORT
