# 🚗 Car Tracker - Sistema de Rastreamento em Tempo Real

Um sistema fullstack para rastreamento de veículos em tempo real, desenvolvido com React (Next.js) e Node.js/Express.

## 🚀 Funcionalidades

- **Rastreamento em Tempo Real**: Visualize a localização do veículo em um mapa interativo
- **Dashboard Intuitivo**: Interface moderna e responsiva
- **API RESTful**: Backend robusto para receber dados de GPS
- **WebSocket**: Comunicação em tempo real entre cliente e servidor
- **Histórico de Rotas**: Visualize trajetos anteriores
- **Alertas**: Notificações de eventos importantes

## 🛠️ Tecnologias Utilizadas

### Frontend

- **Next.js 14** - Framework React com SSR
- **React** - Biblioteca de interface
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Leaflet** - Mapas interativos
- **Socket.io Client** - Comunicação em tempo real

### Backend

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **Socket.io** - WebSockets para tempo real
- **MongoDB** - Banco de dados
- **JWT** - Autenticação
- **CORS** - Cross-origin resource sharing

## 📁 Estrutura do Projeto

```
CarTracker/
├── frontend/          # Aplicação Next.js
├── backend/           # API Express
├── package.json       # Scripts principais
└── README.md         # Documentação
```

## 🚀 Como Executar

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- MongoDB (opcional para desenvolvimento)

### Instalação

1. **Clone o repositório**

```bash
git clone <seu-repositorio>
cd CarTracker
```

2. **Instale as dependências**

```bash
npm run install:all
```

3. **Configure as variáveis de ambiente**

```bash
# Backend (.env)
cp backend/.env.example backend/.env
# Edite o arquivo .env com suas configurações

# Frontend (.env.local)
cp frontend/.env.example frontend/.env.local
# Edite o arquivo .env.local com suas configurações
```

4. **Execute o projeto**

```bash
# Desenvolvimento
npm run dev

# Produção
npm run build
npm start
```

### Portas

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000

## 📡 API Endpoints

### Veículos

- `GET /api/vehicles` - Lista todos os veículos
- `GET /api/vehicles/:id` - Obtém dados de um veículo
- `POST /api/vehicles` - Cria novo veículo
- `PUT /api/vehicles/:id` - Atualiza veículo
- `DELETE /api/vehicles/:id` - Remove veículo

### Localização

- `POST /api/location` - Recebe dados de GPS
- `GET /api/location/:vehicleId` - Obtém localização atual
- `GET /api/location/:vehicleId/history` - Histórico de localizações

### WebSocket Events

- `location_update` - Atualização de localização
- `vehicle_status` - Status do veículo
- `alert` - Alertas do sistema

## 🗺️ Como Usar

1. **Acesse o dashboard** em http://localhost:3000
2. **Adicione um veículo** através da interface
3. **Configure o dispositivo GPS** para enviar dados para a API
4. **Visualize o rastreamento** em tempo real no mapa

## 🔧 Configuração do Dispositivo GPS

Para integrar com um dispositivo GPS real, configure-o para enviar dados POST para:

```
POST http://localhost:5000/api/location
Content-Type: application/json

{
  "vehicleId": "seu-vehicle-id",
  "latitude": -23.5505,
  "longitude": -46.6333,
  "speed": 60,
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Se você tiver alguma dúvida ou problema, abra uma issue no repositório.
