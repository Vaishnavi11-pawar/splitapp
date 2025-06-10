# Split Expense Tracker API

A RESTful API service for managing and splitting group expenses, built with Node.js, Express, and MongoDB.

## 🚀 Live Demo
- API Base URL: [https://splitapp-ebrj.onrender.com/api/v1](https://splitapp-ebrj.onrender.com/api/v1)
- API Documentation: [Postman Collection](your-gist-url)

## 🛠️ Tech Stack
- Node.js & Express.js
- MongoDB with Mongoose
- CORS enabled
- Error handling middleware
- Async utilities

## 🏗️ Project Structure
```
src/
├── controllers/       # Request handlers
├── models/           # Database schemas
├── routes/           # API routes
├── utils/           # Helper functions
├── app.js           # Express app setup
├── index.js         # Entry point
└── db/              # Database connection
```

## ⚙️ Setup Instructions

1. **Clone the repository**
```bash
git clone <repository-url>
cd split-expense-tracker
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
Create a `.env` file:
```env
PORT=3000
MONGODB_URL="your-mongodb-connection-string"
CORS_ORIGIN=*
```

4. **Start the server**
```bash
# Development
npm run dev

# Production
npm run dev
```

## 📜 API Documentation

### Core Endpoints

#### 1. Expense Management
- **Add Expense**
  ```http
  POST /api/v1/expenses
  ```
  ```json
  {
    "amount": 1000,
    "description": "Dinner",
    "paid_by": "John",
    "shared_between": ["John", "Alice"],
    "split_type": "equal",
    "category": "Food"
  }
  ```

- **Get All Expenses**
  ```http
  GET /api/v1/expenses
  ```

- **Update Expense**
  ```http
  PUT /api/v1/expenses/:id
  ```

- **Delete Expense**
  ```http
  DELETE /api/v1/expenses/:id
  ```

#### 2. Split Management
- **Get All People**
  ```http
  GET /api/v1/people
  ```

- **Get Balances**
  ```http
  GET /api/v1/balances
  ```

- **Get Settlements**
  ```http
  GET /api/v1/settlements
  ```

#### 3. Analytics
- **Category-wise Spending**
  ```http
  GET /api/v1/spending-category
  ```

- **Monthly Summary**
  ```http
  GET /api/v1/monthly-summary
  ```

- **Spending Patterns**
  ```http
  GET /api/v1/spending-patterns
  ```

- **Top Expenses**
  ```http
  GET /api/v1/top-expensive?limit=5
  ```

## 💡 Settlement Logic

The application uses a two-step process for calculating settlements:

1. **Balance Calculation (`calculateBalances`)**
   - Processes all expenses
   - For each expense:
     - Calculates individual shares based on split type
     - Updates running balances
   - Returns net balance for each person

2. **Settlement Optimization (`simplifySettlements`)**
   - Takes net balances
   - Sorts debtors and creditors
   - Generates minimal transactions to settle all debts
   - Uses greedy approach for optimization

## 📝 Database Schema

### Expense Model
```javascript
{
  amount: Number,
  description: String,
  paid_by: String,
  shared_between: [String],
  split_type: enum['equal', 'percentage', 'exact'],
  split_details: Mixed,
  category: enum['Food', 'Travel', 'Entertainment', 'Shopping', 'Bills', 'Other']
}
```

## ⚠️ Known Limitations & Assumptions

1. **Split Types**
   - Equal: Divides amount equally
   - Percentage: Requires split_details with percentages
   - Exact: Requires split_details with exact amounts

2. **Validation Rules**
   - Amount must be positive
   - At least one person in shared_between
   - Percentage splits must total 100%
   - Exact splits must total expense amount

3. **Categories**
   - Limited to predefined categories
   - Default category is 'Other'

## 🧪 Testing

1. Import Postman Collection from [Gist URL]
2. Collection includes example requests
3. Pre-request scripts populate test data

## 📈 Future Enhancements

1. User authentication/authorization
2. Group management
3. Receipt image upload
4. Expense recurrence
5. Budget tracking

