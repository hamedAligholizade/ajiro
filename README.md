# Ajiro Platform

Ajiro is a comprehensive business management platform designed for small businesses in Iran, with particular emphasis on retail and food service establishments.

This repository contains the orchestration code for the Ajiro platform, managing both frontend and backend services.

## Architecture

The platform consists of:

- **Frontend**: React application with Vite, TypeScript, and Tailwind CSS
- **Backend**: Node.js/Express API with PostgreSQL database
- **Nginx**: Reverse proxy for both services
- **PostgreSQL**: Database for the application
- **Redis**: Caching and session management

## Prerequisites

- Docker and Docker Compose
- Git
- Node.js (for local development)

## Setup

1. Clone this repository:
   ```bash
   git clone https://github.com/your-username/ajiro-platform.git
   cd ajiro-platform
   ```

2. Run the setup script:
   ```bash
   chmod +x scripts/setup.sh
   ./scripts/setup.sh
   ```

3. Clone the frontend and backend repositories:
   ```bash
   git clone https://github.com/your-username/ajiro-frontend.git frontend
   git clone https://github.com/your-username/ajiro-backend.git backend
   ```

4. Update the `.env` file with your configuration

5. Start the development environment:
   ```bash
   docker-compose up -d
   ```

## Development

- Frontend will be available at: http://localhost:5173
- Backend API will be available at: http://localhost:3000
- API documentation: http://localhost:3000/api-docs

## Production Deployment

1. Configure your production settings in `.env`

2. Use the deployment script:
   ```bash
   chmod +x scripts/deploy.sh
   ./scripts/deploy.sh production
   ```

## Project Structure

```
ajiro-platform/              # Root directory
├── docker-compose.yml       # Development configuration
├── docker-compose.prod.yml  # Production configuration
├── nginx/                   # Nginx configuration
│   └── sites-available/     # Virtual host configurations
├── scripts/                 # Utility scripts
├── frontend/                # Frontend application
└── backend/                 # Backend API
```

## License

[Your license information]

## Contributors

[Your name and contributors] 