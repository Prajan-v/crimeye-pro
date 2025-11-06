#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LOG_DIR="$SCRIPT_DIR/logs"
mkdir -p "$LOG_DIR"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

log(){
  echo -e "${BLUE}[CrimeEye Launcher]${NC} $1"
}

warn(){
  echo -e "${YELLOW}[CrimeEye Launcher] $1${NC}"
}

info(){
  echo -e "${GREEN}[CrimeEye Launcher] $1${NC}"
}

error(){
  echo -e "${RED}[CrimeEye Launcher] $1${NC}" >&2
}

start_process(){
  local name="$1"
  shift
  local command=("$@")
  local log_file="$LOG_DIR/${name}.log"

  warn "Starting $name ..."
  ("${command[@]}" >"$log_file" 2>&1 & echo $! > "$LOG_DIR/${name}.pid")
  sleep 1
  if ps -p $(cat "$LOG_DIR/${name}.pid") > /dev/null 2>&1; then
    info "$name started (PID $(cat "$LOG_DIR/${name}.pid"))"
    info "Logs: $log_file"
  else
    error "Failed to start $name. Check $log_file"
  fi
}

stop_if_running(){
  local pattern="$1"
  if pgrep -f "$pattern" >/dev/null 2>&1; then
    warn "Stopping existing $pattern processes"
    pkill -f "$pattern" || true
    sleep 2
  fi
}

info "Ensuring prerequisite services are running"

if ! pg_isready -h localhost -p 5432 >/dev/null 2>&1; then
  warn "PostgreSQL not running. Attempting to start via brew services"
  if command -v brew >/dev/null 2>&1; then
    brew services start postgresql || warn "Please start PostgreSQL manually"
    sleep 3
  else
    warn "Homebrew not available. Start PostgreSQL manually."
  fi
else
  info "PostgreSQL is running"
fi

if ! redis-cli ping >/dev/null 2>&1; then
  warn "Redis not running. Attempting to start via brew services"
  if command -v brew >/dev/null 2>&1; then
    brew services start redis || warn "Please start Redis manually"
    sleep 2
  else
    warn "Homebrew not available. Start Redis manually."
  fi
else
  info "Redis is running"
fi

info "Preparing environments"

# YOLO service env
YOLO_DIR="$SCRIPT_DIR/yolo-service"
if [ ! -d "$YOLO_DIR/venv" ]; then
  warn "Setting up YOLO virtual environment"
  python3 -m venv "$YOLO_DIR/venv"
  source "$YOLO_DIR/venv/bin/activate"
  pip install -r "$YOLO_DIR/requirements.txt"
  deactivate
fi

# FastAPI backend env
BACKEND_DIR="$SCRIPT_DIR/backend"
if [ ! -d "$BACKEND_DIR/venv" ]; then
  warn "Setting up FastAPI virtual environment"
  python3 -m venv "$BACKEND_DIR/venv"
  source "$BACKEND_DIR/venv/bin/activate"
  pip install -r "$BACKEND_DIR/requirements.txt"
  deactivate
fi

# Node modules
if [ ! -d "$SCRIPT_DIR/node_modules" ]; then
  warn "Installing Node.js dependencies"
  npm install
fi

if [ ! -d "$SCRIPT_DIR/frontend/node_modules" ]; then
  warn "Installing frontend dependencies"
  (cd "$SCRIPT_DIR/frontend" && npm install)
fi

info "Stopping existing CrimeEye services (if any)"
stop_if_running "uvicorn app.main"
stop_if_running "node server.js"
stop_if_running "python app.py"
stop_if_running "react-scripts start"

info "Starting services"

start_process "yolo-service" bash -c "cd '$YOLO_DIR' && source venv/bin/activate && python app.py"
start_process "fastapi-backend" bash -c "cd '$BACKEND_DIR' && source venv/bin/activate && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000"
start_process "node-backend" bash -c "cd '$SCRIPT_DIR/backend' && node server.js"
start_process "react-frontend" bash -c "cd '$SCRIPT_DIR/frontend' && npm start"

warn "Ollama LLM Service"
if curl -s http://localhost:11434/api/tags >/dev/null 2>&1; then
  info "Ollama service detected"
else
  warn "Ollama (LLM) not reachable. Start it manually if LLM analysis is required."
fi

cat <<EOF

${GREEN}All services are launching!${NC}
${YELLOW}Logs are stored in:${NC} $LOG_DIR
${YELLOW}To tail logs:${NC} tail -f $LOG_DIR/*.log

${GREEN}Service URLs:${NC}
  Frontend:      http://localhost:3000
  FastAPI API:   http://localhost:8000
  FastAPI Docs:  http://localhost:8000/docs
  Node.js API:   http://localhost:5001
  YOLO Service:  http://localhost:5002
  WebSocket:     ws://localhost:8000/ws

EOF
