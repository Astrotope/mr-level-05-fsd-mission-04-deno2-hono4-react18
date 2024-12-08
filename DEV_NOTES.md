# Insurance Recommendation Chatbot

A smart chatbot application built with Deno and Google's Generative AI (Gemini) that provides personalized insurance policy recommendations based on vehicle information.

## Features

- Interactive chat interface for gathering vehicle information
- Smart analysis of user responses using Google's Gemini AI
- Multiple policy recommendations based on vehicle characteristics
- Structured JSON responses for reliable recommendation processing

## Technology Stack

- **Backend**: Deno with Hono framework
- **AI Model**: Google Generative AI (Gemini 1.5-flash)
- **API**: RESTful endpoints for chat interaction

## Insurance Policy Rules

The chatbot recommends insurance policies based on the following business rules:

1. For trucks or racing cars:
   - Only Third Party Car Insurance (3RDP) is available

2. For non-truck, non-racing cars:
   - If over 10 years old: Both Mechanical Breakdown Insurance (MBI) and Third Party Car Insurance (3RDP) are available
   - If 10 years or younger: Both Mechanical Breakdown Insurance (MBI) and Comprehensive Car Insurance (CCI) are available

### Decision Tree
```
Is it a truck?
├── YES → [3RDP]
└── NO
    └── Is it a racing car?
        ├── YES → [3RDP]
        └── NO
            └── Is it over 10 years old?
                ├── YES → [MBI, 3RDP]
                └── NO → [MBI, CCI]
```

## Key Components

### Chat Service (/backend/src/services/chat.service.ts)

The chat service manages the conversation flow and policy recommendations:

#### Key Methods

1. checkOptIn(): 
   - Analyzes user responses to determine if they agree to proceed with the consultation
   - Returns structured JSON with opt-in status

2. analyzeConversation():
   - Processes chat history to extract vehicle information
   - Uses structured JSON schema for reliable analysis
   - Determines:
     * Truck status (CONFIRMED_YES/CONFIRMED_NO/UNKNOWN)
     * Racing car status (CONFIRMED_YES/CONFIRMED_NO/UNKNOWN)
     * Vehicle age status (CONFIRMED_OLD/CONFIRMED_NEW/UNKNOWN)

3. generateRecommendation():
   - Creates user-friendly recommendation messages
   - Handles multiple policy recommendations
   - Includes vehicle characteristics in the response

4. continueChat():
   - Manages the conversation flow
   - Determines when enough information is gathered
   - Returns appropriate recommendations or continues gathering information

#### Response Format

The service returns structured recommendations in the following format:
```typescript
interface InsuranceRecommendation {
  hasTruck: boolean;
  hasRacingCar: boolean;
  hasOldCar: boolean;
  hasEnoughInfo: boolean;
  policyRecommendation: "MBI" | "CCI" | "3RDP" | "NULL";
  policyRecommendations: ("MBI" | "CCI" | "3RDP")[];
}
```

## Recent Updates

### Test Coverage Enhancements

#### New Opt-in Test Suite
Added comprehensive test cases for the opt-in functionality:
1. **Positive Opt-in Test**: Verifies that when a user agrees to proceed, the conversation continues with vehicle-related questions
2. **Negative Opt-in Test**: Confirms that when a user declines, the conversation ends with a polite farewell
3. **Ambiguous Response Test**: Ensures that unclear responses are treated as non-opt-in
4. **Continuation After Opt-in Test**: Tests the complete flow from opt-in through to policy recommendation

#### Test Infrastructure Improvements
- Added rate limiting configuration (RATE_LIMIT_DELAY = 5000ms) to handle Gemini API's 15 requests per minute limit
- Centralized delay configuration for easier maintenance
- Added proper delays between test cases to prevent rate limiting issues

### Code Improvements

#### TypeScript Enhancements
1. **chat.service.ts**:
   - Made ChatMessage and InsuranceRecommendation interfaces exportable
   - Added proper type assertions for role literals ('user' | 'model')
   - Improved type safety in history management

2. **chat.ts**:
   - Added proper typing for request body parameters
   - Added default empty array for history in recommend endpoint
   - Improved error handling with proper type checking

#### API Endpoint Updates
- Modified `/v1/recommend` endpoint to properly handle history parameter
- Updated response formatting to ensure consistent type safety
- Improved error messages and status codes

### Testing Guidelines
When running tests:
- Tests are rate-limited to comply with Gemini API restrictions
- Each test includes appropriate delays (5000ms) between API calls
- Tests are organized in order of complexity: unit tests, API validation tests, opt-in tests, and integration tests
- The simulateConversation helper function includes proper delays to prevent rate limiting

## Environment Setup

1. Required environment variables:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

2. Dependencies:
   - @google/generative-ai
   - hono
   - deno

## API Endpoints

1. Start Chat:
   ```
   POST /chat/v1/start
   Body: { "message": string, "history": ChatMessage[] }
   ```

2. Continue Chat:
   ```
   POST /chat/v1/continue
   Body: { "message": string, "history": ChatMessage[] }
   ```

## Running the Application

1. Install dependencies:
   ```bash
   deno task install
   ```

2. Start the server:
   ```bash
   deno task dev
   ```

## Security Considerations

- API keys are managed through environment variables
- Structured JSON responses prevent injection attacks
- Input validation at all endpoints

## Future Enhancements

- Additional policy types and recommendation rules
- User authentication and session management
- Conversation history persistence
- Enhanced error handling and edge cases

## Testing Examples

### Opt-in Test Examples

### 1. Positive Opt-in
```bash
curl -X POST http://localhost:8000/chat/v1/start \
-H "Content-Type: application/json" \
-d '{
  "message": "Yes, I would like help choosing insurance"
}' | jq '.'
```
Expected response: Continues conversation with vehicle-related questions

### 2. Negative Opt-in
```bash
curl -X POST http://localhost:8000/chat/v1/start \
-H "Content-Type: application/json" \
-d '{
  "message": "No thanks, not interested right now"
}' | jq '.'
```
Expected response: Polite farewell message

### 3. Ambiguous Response
```bash
curl -X POST http://localhost:8000/chat/v1/start \
-H "Content-Type: application/json" \
-d '{
  "message": "Not sure about this yet"
}' | jq '.'
```
Expected response: Treated as non-opt-in, polite farewell message

### 1. Truck Scenario [3RDP]
```bash
curl -X POST http://localhost:8000/chat/v1/continue \
-H "Content-Type: application/json" \
-d '{
  "message": "Yes, it'\''s a Ford F-150 truck",
  "history": [
    {
      "role": "model",
      "parts": "Great! First, I need to know: is your vehicle a truck?"
    }
  ]
}' | jq '.'
```
Expected response: Single recommendation for 3RDP

### 2. Racing Car Scenario [3RDP]
```bash
curl -X POST http://localhost:8000/chat/v1/continue \
-H "Content-Type: application/json" \
-d '{
  "message": "Yes, it'\''s a modified racing car that I use for weekend competitions",
  "history": [
    {
      "role": "model",
      "parts": "Thank you. Is this vehicle used for racing or is it a racing car?"
    },
    {
      "role": "user",
      "parts": "No, it'\''s not a truck, it'\''s a sports car"
    }
  ]
}' | jq '.'
```
Expected response: Single recommendation for 3RDP

### 3. Regular Car Over 10 Years [MBI, 3RDP]
```bash
curl -X POST http://localhost:8000/chat/v1/continue \
-H "Content-Type: application/json" \
-d '{
  "message": "It'\''s a 2010 model, so about 14 years old",
  "history": [
    {
      "role": "model",
      "parts": "Thank you. Is this vehicle used for racing or is it a racing car?"
    },
    {
      "role": "user",
      "parts": "No, it'\''s just a regular commuter car"
    },
    {
      "role": "model",
      "parts": "Could you tell me how old your vehicle is?"
    }
  ]
}' | jq '.'
```
Expected response: Multiple recommendations for both MBI and 3RDP

### 4. Regular Car 10 Years or Younger [MBI, CCI]
```bash
curl -X POST http://localhost:8000/chat/v1/continue \
-H "Content-Type: application/json" \
-d '{
  "message": "It'\''s a 2020 model Toyota Camry, so about 4 years old",
  "history": [
    {
      "role": "model",
      "parts": "Thank you. Is this vehicle used for racing or is it a racing car?"
    },
    {
      "role": "user",
      "parts": "No, it'\''s just a regular commuter car"
    },
    {
      "role": "model",
      "parts": "Could you tell me how old your vehicle is?"
    }
  ]
}' | jq '.'
```
Expected response: Multiple recommendations for both MBI and CCI

### 5. Brand New Car [MBI, CCI]
```bash
curl -X POST http://localhost:8000/chat/v1/continue \
-H "Content-Type: application/json" \
-d '{
  "message": "It'\''s brand new, just got it from the dealership last month",
  "history": [
    {
      "role": "model",
      "parts": "Thank you. Is this vehicle used for racing or is it a racing car?"
    },
    {
      "role": "user",
      "parts": "No, it'\''s just a regular commuter car"
    },
    {
      "role": "model",
      "parts": "Could you tell me how old your vehicle is?"
    }
  ]
}' | jq '.'
```
Expected response: Multiple recommendations for both MBI and CCI

### 6. Complete Conversation Flow Example
```bash
# Start chat
curl -X POST http://localhost:8000/chat/v1/start \
-H "Content-Type: application/json" \
-d '{
  "message": "Hi, I need help choosing insurance",
  "history": []
}' | jq '.'

# Confirm not a truck
curl -X POST http://localhost:8000/chat/v1/continue \
-H "Content-Type: application/json" \
-d '{
  "message": "No, it'\''s a regular sedan",
  "history": [
    {
      "role": "model",
      "parts": "I'\''m Tina. I can help you to choose the right insurance policy. May I ask you a few personal questions to make sure I recommend the best policy for you?"
    },
    {
      "role": "user",
      "parts": "Hi, I need help choosing insurance"
    },
    {
      "role": "model",
      "parts": "Great! First, I need to know: is your vehicle a truck?"
    }
  ]
}' | jq '.'

# Confirm not a racing car
curl -X POST http://localhost:8000/chat/v1/continue \
-H "Content-Type: application/json" \
-d '{
  "message": "No, just for normal daily driving",
  "history": [
    {
      "role": "model",
      "parts": "Thank you. Is this vehicle used for racing or is it a racing car?"
    },
    {
      "role": "user",
      "parts": "No, it'\''s a regular sedan"
    }
  ]
}' | jq '.'

# Provide age (under 10 years)
curl -X POST http://localhost:8000/chat/v1/continue \
-H "Content-Type: application/json" \
-d '{
  "message": "It'\''s a 2022 model, about 2 years old",
  "history": [
    {
      "role": "model",
      "parts": "Could you tell me how old your vehicle is?"
    },
    {
      "role": "user",
      "parts": "No, just for normal daily driving"
    }
  ]
}' | jq '.'
```
Expected response: Multiple recommendations for both MBI and CCI

Each test case follows a branch of the decision tree and should receive the appropriate policy recommendations as shown in brackets. The complete conversation flow example shows how the chatbot gathers all necessary information before making a recommendation.


## API Endpoint Updates

Based on the codebase search, here are all the API endpoints and their purposes:

1. ***POST*** /chat/v1/start
- Starts a new chat conversation
- Request body: { message: string, history?: ChatMessage[] }
- Used for initial contact and opt-in scenarios
Returns: Response message, message type, and conversation history

2. ***POST*** /chat/v1/continue
- Continues an existing chat conversation
- Request body: { message: string, history: ChatMessage[] }
- Used for gathering vehicle information and providing recommendations
- Returns: Response message, message type, and updated conversation history

3. ***POST*** /chat/v1/recommend
- Gets direct policy recommendations based on context
- Request body: { context: string, history?: ChatMessage[] }
- Used for quick policy recommendations without full conversation flow
- Returns: Policy recommendations and conversation history

4. ***GET*** /health
- Simple health check endpoint
- No request body needed
- Returns: { status: "ok" }
- Used for monitoring server status

All endpoints are served at http://localhost:8000 and have CORS enabled for http://localhost:5173 (Vite's default port).

The endpoints handle various error cases:

- Missing required fields return 400 Bad Request
- Internal errors return 500 Internal Server Error
- All responses are in JSON format