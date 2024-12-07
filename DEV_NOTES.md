# AI Chat Assistant Project Documentation

## Project Overview
A full-stack chat application built with Deno and React, featuring Google's Gemini AI model for intelligent conversations. The application provides a modern, responsive interface for users to interact with an AI assistant.

## Technology Stack

### Backend
- **Runtime**: Deno 2.1.1
- **Framework**: Hono v4.1.2
- **JS Runtime**: V8 13.0.245.12-rusty
- **TypeScript**: 5.6.2
- **AI Integration**: Google Generative AI (Gemini-1.5-flash)
- **Environment**: Configurable via `.env`
- **Standard Library**: Deno std@0.220.0

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Framework**: Tailwind CSS
- **Components**: Headless UI
- **HTTP Client**: Axios
- **Markdown Rendering**: React Markdown

## Project Structure
```
deno-2-hono-react-nextjs/
├── backend/
│   ├── src/
│   │   ├── config/         # Environment configuration
│   │   ├── routes/         # API route handlers
│   │   ├── services/       # Business logic and AI integration
│   │   └── index.ts        # Application entry point
│   ├── tests/              # Test files
│   ├── deno.json          # Deno configuration and import maps
│   ├── Dockerfile         # Backend container configuration
│   └── .env              # Environment variables (not in repo)
│
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── api/          # API integration
│   │   ├── App.tsx       # Main application component
│   │   └── index.css     # Global styles
│   ├── public/           # Static assets
│   ├── package.json      # Dependencies and scripts
│   ├── Dockerfile        # Frontend container configuration
│   └── .env             # Frontend environment variables
│
├── docker-compose.yml    # Container orchestration
└── DEV_NOTES.md         # Project documentation
```

## Key Features
- Real-time chat interface with AI
- Responsive design using Tailwind CSS
- Markdown support for AI responses
- Development and production environment configurations
- Docker containerization for both frontend and backend

## Environment Setup

### Backend (.env)
```env
PORT=8000
GEMINI_API_KEY=your_api_key_here
DENO_ENV=development
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
```

## Running the Application

### Local Development

#### Backend
```bash
cd backend
deno task dev
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Using Docker

#### Development Mode
```bash
docker compose --profile development up --build
```

#### Production Mode
```bash
docker compose --profile production up --build
```

## API Endpoints

### Chat Endpoints
- `POST /chat/start` - Start a new chat session
- `POST /chat/continue` - Continue an existing chat
- `POST /chat/recommendations` - Get AI recommendations based on chat history

## Design Decisions

### Frontend Architecture
- Clean separation of components and API logic
- Responsive design with mobile-first approach
- Efficient state management using React hooks
- Modern UI with Tailwind CSS for styling

### Backend Architecture
- Modular structure with clear separation of concerns
- Service-based architecture for AI integration
- Environment-based configuration
- Efficient error handling and response formatting

### Container Strategy
- Separate development and production configurations
- Volume mounts for hot reloading in development
- Environment-specific optimizations
- Network isolation using Docker Compose

## Development Workflow
1. Start with local development using native commands
2. Test changes in development Docker environment
3. Build and test production Docker environment
4. Deploy production containers

## Best Practices
- Use TypeScript for type safety
- Follow ESLint rules for code consistency
- Keep environment variables secure
- Regular testing of both frontend and backend
- Document code changes and new features

## Testing

### Backend Testing
The backend uses Deno's built-in testing framework. Tests are located in the `backend/tests` directory.

#### Running Tests
```bash
cd backend
deno task test
```

```bash
deno task test                                                                                                                                                                                        ─╯
Task test deno test --allow-net --allow-read --allow-env
Check file:///[path]/mission_ready/level-05/mission-05/research/deno-2-hono-react-nextjs/backend/tests/chat.test.ts
running 3 tests from ./tests/chat.test.ts
Chat API - /v1/start - should require message ... ok (5ms)
Chat API - /v1/continue - should require history and message ... ok (0ms)
Chat API - /v1/recommend - should require context ... ok (0ms)

ok | 3 passed | 0 failed (11ms)
```


#### Test Structure
- **API Tests** (`chat.test.ts`):
  - Tests for chat endpoint input validation
  - Tests for required fields in requests
  - Tests for error handling
  - Tests for API response format

#### Test Coverage
Current test suite covers:
- Input validation for all chat endpoints
- Error handling for missing required fields
- API response format validation

### Frontend Testing
Currently, the frontend does not have automated tests implemented. This is an area for improvement.

#### Recommended Frontend Test Implementation
- Add Jest for unit testing
- Add React Testing Library for component testing
- Implement tests for:
  - ChatInterface component
  - API integration
  - Message formatting
  - UI state management

## Troubleshooting
- Ensure all environment variables are properly set
- Check Docker logs for container issues
- Verify network connectivity between services
- Confirm Gemini API key is valid and has sufficient quota

## Future Considerations
- User authentication
- Message persistence
- Enhanced error handling
- Performance optimization
- Additional AI model options
- Implement comprehensive frontend testing
- Add integration tests
- Add end-to-end testing with Cypress or Playwright
- Implement continuous integration with automated testing