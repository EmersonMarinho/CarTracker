# 🚀 Guia de Início Rápido - Car Tracker

## Pré-requisitos

- Node.js 18+
- npm ou yarn
- MongoDB (opcional para desenvolvimento)

## Instalação Rápida

### 1. Clone e Configure

```bash
git clone <seu-repositorio>
cd CarTracker
```

### 2. Setup Automático

**Windows:**

```bash
setup.bat
```

**Linux/Mac:**

```bash
chmod +x setup.sh
./setup.sh
```

### 3. Setup Manual (se necessário)

```bash
# Instalar dependências
npm run install:all

# Configurar variáveis de ambiente
cp backend/env.example backend/.env
cp frontend/env.example frontend/.env.local
```

## Executar o Projeto

### Desenvolvimento

```bash
# Executar frontend e backend simultaneamente
npm run dev
```

### Separadamente

```bash
# Backend (porta 5000)
npm run dev:backend

# Frontend (porta 3000)
npm run dev:frontend
```

## URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

## Testar a API

### 1. Criar um veículo de teste

```bash
cd examples
node test-api.js
```

### 2. Ou usar curl

```bash
# Criar veículo
curl -X POST http://localhost:5000/api/vehicles \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Meu Carro",
    "licensePlate": "ABC1234",
    "brand": "Toyota",
    "model": "Corolla",
    "year": 2022,
    "color": "Prata",
    "owner": {
      "name": "João Silva",
      "email": "joao@example.com",
      "phone": "(11) 99999-9999"
    }
  }'

# Enviar dados GPS
curl -X POST http://localhost:5000/api/location \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleId": "ID_DO_VEICULO",
    "latitude": -23.5505,
    "longitude": -46.6333,
    "speed": 60,
    "timestamp": "2024-01-01T12:00:00Z"
  }'
```

## Estrutura do Projeto

```
CarTracker/
├── backend/           # API Express + MongoDB
├── frontend/          # Next.js + React
├── examples/          # Scripts de teste
├── package.json       # Scripts principais
└── README.md         # Documentação completa
```

## Próximos Passos

1. Acesse http://localhost:3000
2. Adicione veículos através da interface
3. Configure um dispositivo GPS real
4. Visualize o rastreamento em tempo real

## Suporte

- Consulte o README.md para documentação completa
- Verifique os logs no terminal para debug
- Use o health check para verificar se a API está funcionando
