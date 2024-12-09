import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { config } from "../config/env.ts";

export interface ChatMessage {
  role: 'user' | 'model';
  parts: string;
}

export interface InsuranceRecommendation {
  hasTruck: boolean;
  hasRacingCar: boolean;
  hasOldCar: boolean;
  hasEnoughInfo: boolean;
  policyRecommendation: "MBI" | "CCI" | "3RDP" | "NULL";
  policyRecommendations: ("MBI" | "CCI" | "3RDP")[];
  carAgeStatus: "CONFIRMED_OLD" | "CONFIRMED_NEW" | "UNKNOWN";
}

interface GenerativeContent {
  role: string;
  parts: [{ text: string }];
}

// Constants for chat responses
const INITIAL_GREETING = "I'm Tina. I can help you to choose the right insurance policy. May I ask you a few personal questions to make sure I recommend the best policy for you?";

const SYSTEM_INSTRUCTIONS = `You are Tina, an AI insurance consultant specializing in car insurance only. Your role is to help users find the best insurance policy for their needs.

Available Policies:
1. Mechanical Breakdown Insurance (MBI) - Covers mechanical and electrical failures
2. Comprehensive Car Insurance (CCI) - Full coverage including accidents, theft, and natural disasters
3. Third Party Car Insurance (3RDP) - Basic coverage for damage to other vehicles

Business Rules:
- MBI is not available for trucks and racing cars
- CCI is only available for vehicles less than 10 years old
- All policies require information about the vehicle type and age

Required Information:
1. Is the vehicle a truck? (yes/no)
2. Is the vehicle a racing car? (yes/no)
3. Is the vehicle more than 10 years old? (yes/no)

Conversation Flow:
1. First, determine if the vehicle is a truck
2. Then, if not a truck, determine if it's a racing car
3. Finally, determine the vehicle's age
4. Based on these answers, recommend one of the three policies above

Remember to:
1. Be professional and friendly
2. Ask ONLY questions about vehicle type and age
3. Ask one question at a time
4. Only recommend from the three policies listed above
5. Make recommendations based on the business rules
6. NEVER ask about coverage types or other insurance details`;

export class ChatService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    this.genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 200,
        topP: 1,
        topK: 1
      },
      systemInstruction: SYSTEM_INSTRUCTIONS
    });
  }

  private async checkOptIn(userResponse: string, history: ChatMessage[]): Promise<boolean> {
    try {
      const schema = {
        type: SchemaType.OBJECT,
        properties: {
          optIn: {
            type: SchemaType.BOOLEAN,
            description: "Whether the user has agreed to proceed with the consultation",
            nullable: false
          }
        },
        required: ["optIn"]
      };

      // Create a separate model instance for structured output
      const model = this.genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: {
          temperature: 0,
          responseMimeType: "application/json",
          responseSchema: schema
        }
      });
      
      console.log('Checking opt-in for response:', userResponse);

      const prompt = `Analyze if the user wants to proceed with the insurance consultation.
Response: "${userResponse}"

Return true if the response indicates agreement (e.g., "yes", "sure", "okay", "I would like that", "please help")
Return false if the response indicates disagreement or uncertainty (e.g., "no", "not now", "maybe later")`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const { optIn } = JSON.parse(response.text());
      
      console.log('Opt-in result:', optIn);
      return optIn;
    } catch (error) {
      console.error('Error checking opt-in:', error);
      return false;
    }
  }

  async startChat(message: string, history: ChatMessage[] = []) {
    try {
      if (!message) {
        // Initial greeting
        const initialHistory: ChatMessage[] = [
          {
            role: 'model',
            parts: INITIAL_GREETING
          }
        ];
        return { 
          response: INITIAL_GREETING,
          messageType: 'greeting',
          history: initialHistory
        };
      }

      let updatedHistory: ChatMessage[] = [];
      
      // If no history provided but we have a message, add the initial greeting
      if (history.length === 0 && message) {
        updatedHistory = [
          {
            role: 'model',
            parts: INITIAL_GREETING
          }
        ];
      } else {
        updatedHistory = [...history];
      }

      // Add user's response to history
      if (message) {
        updatedHistory.push({ role: 'user' as const, parts: message });
      }
      
      // Check if the user has opted in
      const hasOptedIn = await this.checkOptIn(message, updatedHistory);
      
      if (!hasOptedIn) {
        const farewell = "Thank you for your time. I'm here to help you choose a policy when you are ready. Bye for now! :-)";
        return {
          response: farewell,
          messageType: 'farewell',
          history: [...updatedHistory, { role: 'model', parts: farewell }]
        };
      }

      // If user has opted in, start the actual consultation
      const firstQuestion = "Great! Let me start by asking about your vehicle. What type of vehicle do you own?";
      return {
        response: firstQuestion,
        messageType: 'question',
        history: [...updatedHistory, { role: 'model', parts: firstQuestion }]
      };
    } catch (error) {
      console.error('Error starting chat:', error);
      throw error;
    }
  }

  private formatHistoryForModel(history: ChatMessage[]): GenerativeContent[] {
    return history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.parts }]
    }));
  }

  public async analyzeConversation(history: ChatMessage[]): Promise<InsuranceRecommendation> {
    try {
      const schema = {
        type: SchemaType.OBJECT,
        properties: {
          truckStatus: {
            type: SchemaType.STRING,
            description: "What we know about whether the user has a truck",
            enum: ["CONFIRMED_YES", "CONFIRMED_NO", "UNKNOWN"],
            nullable: false
          },
          racingCarStatus: {
            type: SchemaType.STRING,
            description: "What we know about whether the user has a racing car",
            enum: ["CONFIRMED_YES", "CONFIRMED_NO", "UNKNOWN"],
            nullable: false
          },
          carAgeStatus: {
            type: SchemaType.STRING,
            description: "What we know about whether the car is more than 10 years old",
            enum: ["CONFIRMED_OLD", "CONFIRMED_NEW", "UNKNOWN"],
            nullable: false
          },
          hasEnoughInfo: {
            type: SchemaType.BOOLEAN,
            description: "Whether we have enough confirmed information to make a policy recommendation",
            nullable: false
          },
          policyRecommendations: {
            type: SchemaType.ARRAY,
            description: "The recommended policies based on the business rules",
            items: {
              type: SchemaType.STRING,
              enum: ["MBI", "CCI", "3RDP"]
            }
          }
        },
        required: ["truckStatus", "racingCarStatus", "carAgeStatus", "hasEnoughInfo", "policyRecommendations"]
      };

      // Create a separate model instance for structured output
      const model = this.genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: {
          temperature: 0,
          responseMimeType: "application/json",
          responseSchema: schema
        }
      });
      
      const prompt = `Analyze the following conversation and determine what we DEFINITELY know about the user's vehicle based on our business rules.

Business Rules:
- For trucks or racing cars:
  * Only 3RDP is available
- For non-truck, non-racing cars:
  * If over 10 years old: Both MBI and 3RDP are available
  * If 10 years or younger: Both MBI and CCI are available

For each status field, only return:
- CONFIRMED_YES/CONFIRMED_OLD if the user has explicitly confirmed it
- CONFIRMED_NO/CONFIRMED_NEW if the user has explicitly denied it
- UNKNOWN if we don't have clear confirmation

We have enough information only if:
1. We know definitively if it's a truck (CONFIRMED_YES or CONFIRMED_NO)
2. We know definitively if it's a racing car (CONFIRMED_YES or CONFIRMED_NO)
3. We know definitively the age status (CONFIRMED_OLD or CONFIRMED_NEW)

Policy recommendation rules:
- If truck status or racing car status is CONFIRMED_YES:
  * Return ["3RDP"]
- If both are CONFIRMED_NO:
  * If age is CONFIRMED_OLD: Return ["MBI", "3RDP"]
  * If age is CONFIRMED_NEW: Return ["MBI", "CCI"]
- In all other cases: Return []

Conversation History:
${history.map(msg => `${msg.role}: ${msg.parts}`).join('\n')}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const analysisResult = JSON.parse(await response.text());
      
      console.log('Analysis result:', analysisResult);

      // Convert the new format to the old format for compatibility
      // but include the array of recommendations and carAgeStatus
      return {
        hasTruck: analysisResult.truckStatus === "CONFIRMED_YES",
        hasRacingCar: analysisResult.racingCarStatus === "CONFIRMED_YES",
        hasOldCar: analysisResult.carAgeStatus === "CONFIRMED_OLD",
        hasEnoughInfo: analysisResult.hasEnoughInfo,
        policyRecommendation: analysisResult.policyRecommendations[0] || "NULL", // Keep first recommendation for backward compatibility
        policyRecommendations: analysisResult.policyRecommendations, // Add array of all recommendations
        carAgeStatus: analysisResult.carAgeStatus // Add the raw carAgeStatus
      };
    } catch (error) {
      console.error('Error analyzing conversation:', error);
      return {
        hasTruck: false,
        hasRacingCar: false,
        hasOldCar: false,
        hasEnoughInfo: false,
        policyRecommendation: "NULL",
        policyRecommendations: [],
        carAgeStatus: "UNKNOWN"
      };
    }
  }

  public async generateRecommendation(recommendation: InsuranceRecommendation): Promise<string> {
    const policyNames = {
      "MBI": "Mechanical Breakdown Insurance (MBI)",
      "CCI": "Comprehensive Car Insurance (CCI)",
      "3RDP": "Third Party Car Insurance (3RDP)"
    };

    const vehicleDescription = (() => {
      const parts = [
        recommendation.hasTruck ? "you have a truck" : "you don't have a truck",
        recommendation.hasRacingCar ? "you have a racing car" : "you don't have a racing car"
      ];
      
      // Only include age description if we have a regular car (not truck or racing car)
      if (!recommendation.hasTruck && !recommendation.hasRacingCar) {
        if (recommendation.carAgeStatus === "CONFIRMED_OLD") {
          parts.push("your vehicle is more than 10 years old");
        } else if (recommendation.carAgeStatus === "CONFIRMED_NEW") {
          parts.push("your vehicle is 10 years old or newer");
        }
        // Don't add age description if UNKNOWN
      }
      
      return parts.join(", and ");
    })();

    // Generate recommendation message based on available policies
    const policies = recommendation.policyRecommendations;
    if (policies.length === 0) {
      return "I need more information about your vehicle to make a recommendation.";
    }

    const policyList = policies.map(p => policyNames[p as keyof typeof policyNames]).join(" or ");
    return `Thank you for providing that information. Based on what you've told me, ${vehicleDescription}. Given these details, I recommend considering ${policyList} as suitable options for your needs.`;
  }

  async continueChat(message: string, history: ChatMessage[] = []) {
    try {
      const updatedHistory: ChatMessage[] = [...history];
      if (message) {
        updatedHistory.push({ role: 'user' as const, parts: message });
      }
      
      // Analyze the conversation first
      const analysis = await this.analyzeConversation(updatedHistory);
      
      if (analysis.hasEnoughInfo) {
        // If we have enough info, generate the final recommendation
        const recommendation = await this.generateRecommendation(analysis);
        return { 
          response: recommendation,
          history: [...updatedHistory, { role: 'model', parts: recommendation }],
          messageType: 'recommendation'
        };
      }
      
      // If we don't have enough info, continue the conversation
      const formattedHistory = this.formatHistoryForModel(updatedHistory);
      
      const result = await this.model.generateContent({
        contents: formattedHistory,
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 200,
          topP: 1,
          topK: 1
        }
      });

      const response = await result.response;
      const text = await response.text();
      const assistantResponse = this.extractAssistantResponse(text);
      
      return { 
        response: assistantResponse,
        history: [...updatedHistory, { role: 'model', parts: assistantResponse }],
        messageType: 'question'
      };
    } catch (error) {
      console.error('Error continuing chat:', error);
      throw error;
    }
  }

  private extractAssistantResponse(text: string): string {
    // If the text contains markdown or formatting, try to clean it
    if (text.includes('**')) {
      const matches = text.match(/\*\*.*?\*\*.*?(?=\n|$)/g);
      if (matches && matches.length > 0) {
        // Get the content after the last heading/bold text
        const lastMatch = matches[matches.length - 1];
        return lastMatch.split('**').pop()?.trim() || text;
      }
    }
    return text; // Return as is if no formatting detected
  }

  async getRecommendations(context: string, history: ChatMessage[] = []) {
    try {
      const updatedHistory: ChatMessage[] = [...history];
      if (context) {
        updatedHistory.push({ role: 'user' as const, parts: context });
      }
      
      const prompt = `Based on the conversation below, provide 3-5 relevant recommendations or suggestions that could help continue or enhance the discussion. Make the recommendations specific and actionable.

Conversation:
${updatedHistory.map(msg => `${msg.role}: ${msg.parts}`).join('\n')}

Please format your response as a natural, friendly list of suggestions without any special formatting or markdown.`;
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = await response.text();
      return { recommendations: text, history: updatedHistory };
    } catch (error) {
      console.error('Error getting recommendations:', error);
      throw error;
    }
  }
}

export const chatService = new ChatService();
