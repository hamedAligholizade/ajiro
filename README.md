# Ajiro - SaaS Solution for Small Physical Shops in Iran

Ajiro is a scalable, containerized web application designed specifically for small physical shops in Iran. It features a robust Node.js backend with Express, PostgreSQL database, and a React frontend with full RTL and Farsi language support.

## Project Structure

```
ajiro/
├── backend/             # Node.js Express backend
│   ├── src/
│   │   ├── config/      # Configuration files
│   │   ├── models/      # Sequelize database models
│   │   ├── routes/      # API routes
│   │   ├── middleware/  # Custom middleware
│   │   └── index.js     # Entry point
│   ├── .env.example     # Environment variables template
│   ├── Dockerfile       # Backend Docker configuration
│   └── package.json     # Dependencies
├── frontend/            # React Vite frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page-level components
│   │   ├── i18n/        # Internationalization configs
│   │   └── App.jsx      # Main application component
│   ├── Dockerfile       # Frontend Docker configuration
│   └── package.json     # Dependencies
└── docker-compose.yml   # Orchestration of all services
```

## Features

- **Multi-tenancy support**: Data isolation for each shop
- **Full RTL and Farsi support**: Designed for Iranian users
- **Containerized**: Easy deployment with Docker
- **Scalable architecture**: Ready for future feature expansion

## Getting Started

### Prerequisites
- Docker and Docker Compose installed on your system

### Setup and Deployment

1. Clone the repository:
   ```
   git clone https://github.com/your-username/ajiro.git
   cd ajiro
   ```

2. Start the application:
   ```
   docker-compose up -d
   ```

3. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000

## Development

### Backend Development
```
cd backend
npm install
npm run dev
```

### Frontend Development
```
cd frontend
npm install
npm run dev
```

## Environment Variables

Create a `.env` file in the backend directory based on the `.env.example` template.

## License

[MIT](LICENSE) 