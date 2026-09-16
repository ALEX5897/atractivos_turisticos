#!/bin/bash

echo "========================================"
echo "  REINICIANDO SISTEMA QUITO TURISMO"
echo "========================================"
echo

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Función para detener procesos
stop_processes() {
    local process_name=$1
    local display_name=$2

    echo -e "${YELLOW}Deteniendo procesos de $display_name...${NC}"

    if pgrep -f "$process_name" > /dev/null; then
        pkill -f "$process_name"
        sleep 2
        if pgrep -f "$process_name" > /dev/null; then
            echo -e "${RED}  ✗ No se pudieron detener todos los procesos de $display_name${NC}"
        else
            echo -e "${GREEN}  ✓ Procesos de $display_name detenidos${NC}"
        fi
    else
        echo -e "${GREEN}  ✓ No hay procesos de $display_name ejecutándose${NC}"
    fi
}

# Función para verificar puerto
check_port() {
    local port=$1
    local service=$2

    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${RED}  ✗ Puerto $port ($service) ocupado${NC}"
        return 1
    else
        echo -e "${GREEN}  ✓ Puerto $port ($service) disponible${NC}"
        return 0
    fi
}

# Detener procesos existentes
stop_processes "node" "Node.js"
stop_processes "python" "Python"

echo
echo -e "${YELLOW}Esperando que se liberen los puertos...${NC}"
sleep 3

# Verificar puertos
BACKEND_PORT=3000
FRONTEND_PORT=5174

echo
echo -e "${YELLOW}Verificando disponibilidad de puertos...${NC}"
check_port $BACKEND_PORT "Backend"
check_port $FRONTEND_PORT "Frontend"

echo
echo -e "${YELLOW}Iniciando servicios...${NC}"

# Iniciar backend
echo -e "${CYAN}Iniciando backend...${NC}"
cd backend
npm run dev &
BACKEND_PID=$!

if ps -p $BACKEND_PID > /dev/null; then
    echo -e "${GREEN}  ✓ Backend iniciado (PID: $BACKEND_PID)${NC}"
else
    echo -e "${RED}  ✗ Error al iniciar backend${NC}"
fi

cd ..

# Esperar antes de iniciar frontend
sleep 3

# Iniciar frontend
echo -e "${CYAN}Iniciando frontend...${NC}"
cd frontend
npm run dev &
FRONTEND_PID=$!

if ps -p $FRONTEND_PID > /dev/null; then
    echo -e "${GREEN}  ✓ Frontend iniciado (PID: $FRONTEND_PID)${NC}"
else
    echo -e "${RED}  ✗ Error al iniciar frontend${NC}"
fi

cd ..

echo
echo -e "${CYAN}========================================"
echo -e "${CYAN}  SISTEMA REINICIADO EXITOSAMENTE"
echo -e "${CYAN}=======================================${NC}"
echo
echo -e "${WHITE}URLs de acceso:${NC}"
echo -e "${WHITE}  Backend:  http://localhost:$BACKEND_PORT${NC}"
echo -e "${WHITE}  Frontend: http://localhost:$FRONTEND_PORT${NC}"
echo
echo -e "${WHITE}Procesos en ejecución:${NC}"
ps aux | grep -E "(node|npm)" | grep -v grep | head -10

echo
echo -e "${GRAY}Presiona Ctrl+C para detener...${NC}"

# Mantener el script ejecutándose para monitorear
trap 'echo -e "\n${YELLOW}Deteniendo servicios...${NC}"; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit' INT

# Esperar indefinidamente
while true; do
    sleep 1
done