# Risk Tracker

Welcome to **Risk Tracker**, a web application designed to monitor and analyze vehicle risk scores based on real-time telemetry data. This project leverages **Next.js** for the frontend and backend, **MongoDB** for data storage, and a **machine learning API** for risk prediction. The application provides a dashboard for customers to view their risk scores, driving trends, and historical data.

---

## 🛍️ Overview

- **Purpose**: Track and visualize vehicle risk based on speed, traffic conditions, acceleration, and angular velocity.

### 🧰 Technologies

- **Frontend**: Next.js, TypeScript, Recharts  
- **Backend**: Next.js API routes, Mongoose  
- **Database**: MongoDB  
- **Authentication**: NextAuth.js  
- **ML Integration**: Custom ML API (e.g., `http://localhost:8000/predict`)  

### 🔑 Features

- Real-time risk score calculation and display  
- Historical risk trend visualization  
- Periodic risk score aggregation (daily/monthly)  
- User authentication and dashboard access  

---

## ⚙️ Prerequisites

- Node.js (v18.x or later)  
- MongoDB (local or remote like Atlas)  
- npm or yarn  
- Git  
- ML Server: `http://localhost:8000/predict`  

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/risk-tracker.git
cd risk-tracker
```

### 2. Install Dependencies

```bash
npm install
# OR
yarn install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory and add:

```env
MONGODB_URI=mongodb://localhost:27017/your-database-name
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
ML_API_URL=http://localhost:8000
```

- Replace `your-database-name` with your actual database name.  
- Generate `NEXTAUTH_SECRET` using `openssl rand -base64 32`.

### 4. Set Up MongoDB

Start MongoDB server:

```bash
mongod
```

Optionally, use MongoDB Compass or the shell to verify connectivity.

### 5. Initialize Dummy Data (Optional)

```bash
mongo mongodb://localhost:27017/your-database-name
```

Insert data:

```javascript
db.users.insertMany([...]); // See dummy data section
db.vehicleData.insertMany([...]);
db.riskEvent.insertMany([...]);
db.periodicRiskScore.insertMany([...]);
```

### 6. Start the ML Server (Optional)

Ensure your ML server is running at:

```
http://localhost:8000/predict
```

It should accept POST requests and return predictions in the expected format (see `lib/ml-client.ts`).

---

## 🏃 Running the Program

### 1. Start the Development Server

```bash
npm run dev
# OR
yarn dev
```

### 2. Open the Application

Visit:

```
http://localhost:3000
```

### 3. Register / Log In

- Register at: `http://localhost:3000/auth/register-customer`
- Log in at: `http://localhost:3000/auth/signin`
- Dashboard: `http://localhost:3000/dashboard/insurance`

### 4. Run the IoT Simulator (Optional)

```bash
cd scripts
npx ts-node iot-simulator.ts
```

Make sure to update `VEHICLE_NUMBERS` in the simulator script if needed.

---

## 📁 Project Structure

```bash
risk-tracker/
├── app/                  # Next.js App Router pages and API routes
│   ├── api/              # API routes (e.g., /api/customers, /api/vehicle-data)
│   ├── dashboard/        # Dashboard pages
│   └── auth/             # Authentication pages
├── components/           # Reusable UI components
├── lib/                  # Utility functions and configurations
│   ├── db.ts             # MongoDB connection
│   ├── ml-client.ts      # ML API client
│   └── types.ts          # TypeScript types
├── models/               # Mongoose schemas
├── scripts/              # Scripts (e.g., iot-simulator.ts)
├── public/               # Static assets
├── .env.local            # Environment variables
├── tsconfig.json         # TypeScript configuration
├── package.json          # Project dependencies and scripts
└── README.md             # This file
```

---

## 📦 Dependencies

Key dependencies (see `package.json`):

- `next` – Next.js framework  
- `mongoose` – MongoDB object modeling  
- `next-auth` – Authentication  
- `recharts` – Charting library  
- `ts-node` – TypeScript script runner  

Install via:

```bash
npm install
# OR
yarn install
```

---

## 📊 Usage

- **Dashboard**: Real-time + historical data, average speed, brake usage  
- **Simulator**: Mimics IoT device pushing data to your backend  
- **API**: `/api/vehicle-data/[vehicleNumber]` for data interaction  

---

## 🛠️ Troubleshooting

- **MongoDB**: Check URI and ensure MongoDB is running  
- **ML API**: Verify it’s reachable at `ML_API_URL`  
- **Graph Sorting**: Ensure `vehicleData` is sorted by `timestamp`  
- **Auth Issues**: Check `NEXTAUTH_SECRET` and session config  

---

## 🤝 Contributing

Fork the repo, submit issues or PRs. Stick to the existing code style and include tests where possible.

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 🙏 Acknowledgements

- [Next.js](https://nextjs.org)  
- [MongoDB](https://www.mongodb.com)  
- [Recharts](https://recharts.org)  
- [NextAuth.js](https://next-auth.js.org)

---

## 📃 Notes

- **Dummy Data**: You can create a `scripts/dummy-data.js` file to automate DB population  
- **Customization**: Modify URLs, keys, and data models as per your use case  
- **ML Server**: If unavailable, mock `/predict` or disable ML features temporarily  

