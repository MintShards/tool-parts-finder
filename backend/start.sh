#!/bin/bash
python -c "import os; os.system(f'uvicorn app.main:app --host 0.0.0.0 --port {os.getenv(\"PORT\", \"8000\")}')"
