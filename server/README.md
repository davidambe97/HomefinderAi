# HomeFinder AI SaaS Backend Server

Express.js backend server for the HomeFinder AI SaaS application.

## Quick Start

### Development

```bash
# Install dependencies
npm install

# Run with tsx (TypeScript directly)
npm run start:dev

# Or run with watch mode
npm run dev
```

### Production

```bash
# Build TypeScript
npm run build

# Start compiled server
npm start
```

## Environment Variables

Create a `.env` file in the `/server` directory:

```env
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.vercel.app
JWT_SECRET=your-super-secret-jwt-key-change-this
```

See `env.example` for all available variables.

## API Endpoints

### Authentication
- `POST /api/users/register` - Register new agent
- `POST /api/users/login` - Login agent

### Clients (Protected)
- `GET /api/clients` - List all clients
- `POST /api/clients` - Add new client
- `GET /api/clients/:id` - Get client by ID
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

### Dashboard (Protected)
- `GET /api/dashboard` - Get dashboard with listings

### Search
- `POST /api/search` - Search properties

### Alerts (Protected)
- `GET /api/alerts` - Get new listing alerts

### Health
- `GET /health` - Health check endpoint

## Project Structure

```
server/
├── api/           # API route handlers
│   ├── users.ts
│   ├── clients.ts
│   ├── dashboard.ts
│   └── searchProperties.ts
├── scrapers/      # Property scrapers
│   ├── rightmove.ts
│   ├── zoopla.ts
│   ├── openrent.ts
│   └── spareRoom.ts
├── utils/         # Utility functions
│   ├── http.ts
│   └── alerts.ts
├── db/            # JSON database files
├── config.ts      # Configuration constants
├── types.ts       # TypeScript types
├── index.ts       # Express server entry point
└── package.json   # Dependencies and scripts
```

## Deployment

See main `DEPLOYMENT.md` for deployment instructions.

## Development Notes

- Uses ES modules (`"type": "module"`)
- TypeScript compiled to `dist/` directory
- JSON file storage in `/server/db/`
- All routes protected with `authMiddleware` where needed

