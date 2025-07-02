#!/bin/bash

echo "========================================"
echo "   Car Tracker - Setup do Projeto"
echo "========================================"
echo

echo "[1/5] Instalando dependencias do projeto principal..."
npm install

echo
echo "[2/5] Instalando dependencias do backend..."
cd backend
npm install
cd ..

echo
echo "[3/5] Instalando dependencias do frontend..."
cd frontend
npm install
cd ..

echo
echo "[4/5] Criando arquivos de ambiente..."
cp backend/env.example backend/.env
cp frontend/env.example frontend/.env.local

echo
echo "[5/5] Setup concluido!"
echo
echo "Para executar o projeto:"
echo "   npm run dev"
echo
echo "Ou execute separadamente:"
echo "   Backend:  npm run dev:backend"
echo "   Frontend: npm run dev:frontend"
echo
echo "URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo 