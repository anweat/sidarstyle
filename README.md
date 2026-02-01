# Sidarstyle

An AI outfit assistant with personalized recommendations, aesthetic memory, and quick "what to wear" decisions.

## Overview

Sidarstyle is a monorepo application that helps users get outfit recommendations based on their preferences and constraints. It consists of:

- **Web App** (React + TypeScript + Vite) - User interface for outfit recommendations, wardrobe management, and history
- **API** (Node + TypeScript + Express) - Backend with rule-based recommendation engine
- **Shared Package** - Common types and Zod schemas for validation

## Features

### Quick Outfit Recommendations
- Input occasion, style, formality level, comfort preferences, and budget
- Add custom constraints (e.g., "No red colors", "Must include jacket")
- Get 2-3 outfit recommendations with scores (0-100) and rationale
- Provide feedback and select your favorite outfit

### Wardrobe Management
- Full CRUD operations for wardrobe items
- Categories: Tops, Bottoms, Shoes, Accessories, Outerwear
- Tag items for better recommendations
- Color and image URL support

### History & Feedback
- View all past recommendation requests
- See which outfits you selected
- Track your feedback ratings
- Review outfit combinations and their scores

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, React Router
- **Backend**: Node.js, Express, TypeScript
- **Database**: SQLite with Prisma ORM
- **Validation**: Zod schemas
- **Monorepo**: npm workspaces

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/linwuwuw/Sidarstyle.git
cd Sidarstyle
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
cd apps/api
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
```

### Running the Application

1. Start the API server:
```bash
cd apps/api
npm run dev
```
The API will run on http://localhost:3001

2. In a new terminal, start the web app:
```bash
cd apps/web
npm run dev
```
The web app will run on http://localhost:3000

Alternatively, from the root directory:
```bash
npm run dev
```

## API Endpoints

### Wardrobe Items
- `GET /api/wardrobe/items` - List all wardrobe items
- `GET /api/wardrobe/items/:id` - Get a specific item
- `POST /api/wardrobe/items` - Create a new item
- `PUT /api/wardrobe/items/:id` - Update an item
- `DELETE /api/wardrobe/items/:id` - Delete an item

### Recommendations
- `POST /api/recommendations` - Get outfit recommendations
- `GET /api/recommendations/history` - Get recommendation history

### Feedback
- `POST /api/feedback` - Submit feedback for an outfit
- `GET /api/feedback` - Get all feedback

## Project Structure

```
Sidarstyle/
├── apps/
│   ├── api/               # Express API server
│   │   ├── prisma/        # Database schema and seeds
│   │   └── src/           # API source code
│   └── web/               # React web application
│       └── src/
│           ├── pages/     # React pages
│           └── App.tsx    # Main app component
├── packages/
│   └── shared/            # Shared types and schemas
│       └── src/
│           └── schemas.ts # Zod validation schemas
└── package.json           # Root package.json with workspaces
```

## Development

### Building

Build all packages:
```bash
npm run build
```

### Type Checking

Run TypeScript type checking:
```bash
npm run typecheck
```

### Linting

Run linting across all packages:
```bash
npm run lint
```

## Recommendation Engine

The current implementation uses a rule-based scoring system:

1. **Base Score**: Every outfit starts with a base score of 50/100
2. **Formality Match**: Bonus points for items matching the requested formality level
3. **Comfort Bonus**: Extra points if comfort ≥7 and outfit includes comfortable items
4. **Completeness**: Bonus for having top, bottom, and shoes

The engine generates 2-3 outfit combinations and provides detailed rationale for each recommendation.

## Database Schema

The application uses SQLite with the following main models:
- `WardrobeItem` - User's clothing items
- `RecommendationRequest` - Saved recommendation requests
- `Outfit` - Generated outfit recommendations
- `OutfitItem` - Junction table linking outfits to wardrobe items
- `Feedback` - User feedback on outfits

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License
