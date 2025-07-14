# Cryptocurrency Exchange System

A P2P cryptocurrency exchange platform built with Node.js, Express, and Sequelize ORM that allows users to trade cryptocurrencies (BTC, ETH, XRP, DOGE) using fiat currencies (THB, USD).

## Features

- **User Management**: Registration and authentication system
- **Multi-Currency Wallets**: Automatic wallet creation for each supported cryptocurrency
- **P2P Trading**: Create and accept buy/sell offers between users
- **Order Matching**: Automatic order matching system for trades
- **Internal Transfers**: Transfer cryptocurrencies between users within the platform
- **External Transfers**: Withdraw cryptocurrencies to external addresses
- **Transaction History**: Complete transaction logging and history
- **Multi-Fiat Support**: Trade using THB and USD

## Database Design

### ER Diagram
The system uses the following entities:
- **User**: Stores user account information
- **Wallet**: Digital wallets for each user-cryptocurrency pair
- **Cryptocurrency**: Supported cryptocurrencies (BTC, ETH, XRP, DOGE)
- **FiatCurrency**: Supported fiat currencies (THB, USD)
- **Order**: Buy/sell orders created by users
- **Transaction**: Records of all transfers and trades
- **P2P_Offer**: P2P trading offers posted by users

### Entity Relationships
- User (1) → Wallet (N): Each user has multiple wallets
- User (1) → Order (N): Users can place multiple orders
- User (1) → P2P_Offer (N): Users can create multiple P2P offers
- Wallet (N) → Cryptocurrency (1): Each wallet stores one cryptocurrency type
- Wallet (1) → Transaction (N): Wallets can have multiple transactions
- Order (1) → Transaction (1): Each completed order generates a transaction
- Order (N) → Cryptocurrency (1): Orders are for specific cryptocurrencies
- Order (N) → FiatCurrency (1): Orders use specific fiat currencies
- P2P_Offer (N) → Cryptocurrency (1): Offers are for specific cryptocurrencies
- P2P_Offer (N) → FiatCurrency (1): Offers use specific fiat currencies

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **ORM**: Sequelize
- **Authentication**: bcrypt for password hashing

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MySQL Server
- npm or yarn package manager

### Step 1: Clone the Repository
```bash
git clone https://github.com/yourusername/crypto-exchange.git
cd crypto-exchange
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Setup MySQL Database
1. Login to MySQL:
```bash
mysql -u root -p
```

2. Create database and user:
```sql
CREATE DATABASE crypto_exchange;
CREATE USER 'crypto_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON crypto_exchange.* TO 'crypto_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Step 4: Configure Database Connection
Edit `config/database.js` with your database credentials:
```javascript
const sequelize = new Sequelize({
  dialect: 'mysql',
  host: 'localhost',
  username: 'crypto_user',  // or 'root'
  password: 'your_password', // your MySQL password
  database: 'crypto_exchange',
  logging: false
});
```

### Step 5: Run Database Seed
This will create all tables and populate test data:
```bash
npm run seed
```

### Step 6: Start the Server
```bash
# Production mode
npm start

# Development mode (with auto-restart)
npm run dev
```

The server will start on `http://localhost:3000`

## API Endpoints

### User Management
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login
- `GET /api/users/:userId/wallets` - Get user's wallets

### P2P Trading
- `GET /api/p2p/offers` - List all P2P offers
- `POST /api/p2p/offers` - Create new P2P offer
- `POST /api/p2p/offers/:offerId/accept` - Accept P2P offer

### Orders
- `POST /api/orders` - Create buy/sell order
- `GET /api/users/:userId/orders` - Get user's orders
- `PUT /api/orders/:orderId/cancel` - Cancel pending order

### Transactions
- `POST /api/transactions/internal` - Internal transfer between users
- `POST /api/transactions/external` - External withdrawal
- `GET /api/wallets/:walletId/transactions` - Get wallet transaction history

## API Usage Examples

### Register User
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "securepassword123"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "alice",
    "password": "password123"
  }'
```

### Get User Wallets
```bash
curl http://localhost:3000/api/users/1/wallets
```

### Create Buy Order
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "order_type": "buy",
    "crypto_id": 1,
    "fiat_id": 1,
    "amount": 0.001,
    "price": 1200000
  }'
```

### Internal Transfer
```bash
curl -X POST http://localhost:3000/api/transactions/internal \
  -H "Content-Type: application/json" \
  -d '{
    "from_wallet_id": 1,
    "to_wallet_address": "btc_abc123...",
    "amount": 0.0001
  }'
```

## 🧪 Test Data

The seed script creates the following test data:

### Users
- alice / password123
- bob / password123
- charlie / password123

### Cryptocurrencies
- BTC (Bitcoin) - ID: 1
- ETH (Ethereum) - ID: 2
- XRP (Ripple) - ID: 3
- DOGE (Dogecoin) - ID: 4

### Fiat Currencies
- THB (Thai Baht) - ID: 1
- USD (US Dollar) - ID: 2

### Initial Setup
- Each user gets wallets for all cryptocurrencies with random balances
- Sample P2P offers are created
- Sample orders and transactions are generated

