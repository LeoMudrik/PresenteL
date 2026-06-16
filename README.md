# 🎂 Lista de Presentes do Lucca

Sistema web completo para gerenciamento de lista de presentes de aniversário.

## ✅ Pré-requisitos

- **Node.js** v18 ou superior → https://nodejs.org
- **npm** (vem com o Node.js)

## 🚀 Instalação

### 1. Backend

```bash
cd backend
npm install
npm run dev
```

O servidor iniciará em: http://localhost:3001

### 2. Frontend (em outro terminal)

```bash
cd frontend
npm install
npm run dev
```

O site abrirá em: http://localhost:5173

## 🔑 Acesso Administrativo

- **Login:** `admin`
- **Senha:** `admin123`

> Troque a senha após o primeiro acesso em: Área Admin → Contas → Alterar Senha

## 📁 Estrutura

```
Lucca/
├── backend/          # API Node.js + Express + SQLite
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── utils/
│   ├── uploads/      # Imagens enviadas
│   └── lucca.db      # Banco de dados (criado automaticamente)
└── frontend/         # React + Vite + Tailwind CSS
    └── src/
        ├── components/
        ├── context/
        ├── pages/
        └── services/
```

## 🎯 Funcionalidades

### Para Convidados
- Tela inicial animada com foto do Lucca
- Listagem de presentes com fotos, valores e estoque
- Carrinho de compras com controle de quantidade
- Pagamento via QR Code PIX gerado automaticamente

### Para o Administrador
- Dashboard com métricas e gráficos
- CRUD completo de presentes (foto, nome, descrição, valor, estoque)
- Configurações da festa (local, data, horário, convite, imagens)
- Configuração PIX com teste de QR Code
- Gerenciamento de contas administrativas
- Exportação de relatórios em Excel (.xlsx)

## 💡 Dicas

- O banco de dados `lucca.db` é criado automaticamente na primeira execução
- As imagens são salvas na pasta `backend/uploads/`
- Para fazer backup, basta copiar o arquivo `lucca.db` e a pasta `uploads/`
