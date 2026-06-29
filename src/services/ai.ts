import { GoogleGenerativeAI } from '@google/generative-ai';
import type { NearbyFacility } from './places';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// Initialize the API only if the key exists to prevent crashing during build/setup
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export interface AIAnalysisResult {
  issueType: string;
  severity: number;
  riskLevel: string;
  explanation: string;
}

export interface AIPriorityResult {
  priorityScore: number;
  department: string;
  priorityReasoning: string;
  weatherAlert?: string;
}

interface WeatherData {
  precipitation: number;
  weatherCode: number;
  alert?: string;
}

const weatherCache = new Map<string, { data: WeatherData | null; timestamp: number }>();
const WEATHER_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

const getLiveWeatherContext = async (lat?: number, lng?: number): Promise<WeatherData | null> => {
  if (!lat || !lng) return null;
  const cacheKey = `${lat.toFixed(2)},${lng.toFixed(2)}`;
  const cached = weatherCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < WEATHER_CACHE_TTL)) {
    return cached.data;
  }

  try {
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=precipitation,rain,weather_code`);
    if (!response.ok) return null;
    const data = await response.json();
    const current = data.current || {};
    const precip = current.precipitation || 0;
    const code = current.weather_code || 0;
    
    let result: WeatherData | null = null;
    if (precip > 0 || code >= 51) {
      result = {
        precipitation: precip,
        weatherCode: code,
        alert: `⚠️ Adverse Weather Active (${precip}mm rain) — Municipal Priority Escalated`
      };
    } else {
      result = { precipitation: precip, weatherCode: code };
    }

    weatherCache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  } catch (err) {
    console.error("Failed to fetch Open-Meteo weather:", err);
    return null;
  }
};

export const analyzeIssueImage = async (base64Image: string, mimeType: string, userDescription?: string): Promise<AIAnalysisResult> => {
  if (!genAI) {
    throw new Error("Gemini API key is missing");
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-robotics-er-1.6-preview" });

    const prompt = `
      You are an expert City Infrastructure Inspector.
      Analyze the provided image of a civic issue (e.g., pothole, broken streetlight, open manhole, garbage dump).
      ${userDescription ? `\nCRITICAL CONTEXT FROM THE CITIZEN WHO TOOK THE PHOTO:\n"${userDescription}"\nUse this context to inform your severity and risk level (e.g., if they say it smells like gas, or someone tripped, increase the severity dramatically).` : ''}
      
      Return ONLY a raw, valid JSON object (no markdown, no backticks, no codeblocks) with the following exact keys:
      {
        "issueType": "Pothole", // Short, concise title
        "severity": 7, // Number from 1 to 10
        "riskLevel": "High", // Low, Medium, High, or Critical
        "explanation": "1-2 sentences explaining why this is an issue and its potential impact on citizens."
      }
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: mimeType
        }
      }
    ]);

    const responseText = result.response.text();
    const cleanJsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(cleanJsonString) as AIAnalysisResult;

  } catch (error) {
    console.error("Error analyzing image with Gemini:", error);
    throw new Error("Failed to analyze image");
  }
};

export const calculatePriorityScore = async (
  analysis: AIAnalysisResult,
  facilities: NearbyFacility[],
  upvotes: number = 0,
  userDescription?: string,
  lat?: number,
  lng?: number
): Promise<AIPriorityResult> => {
  if (!genAI) {
    throw new Error("Gemini API key is missing");
  }

  try {
    const weather = await getLiveWeatherContext(lat, lng);
    const model = genAI.getGenerativeModel({ model: "gemini-robotics-er-1.6-preview" });

    const facilitiesText = facilities.length > 0 
      ? facilities.map(f => `${f.name} (${f.type}) - ${f.distance}m away`).join(', ')
      : 'None nearby';

    const prompt = `
      You are an advanced Civic Intelligence Engine prioritizing municipal issues.
      Calculate a priority score based on the base issue severity, nearby critical infrastructure, citizen reports, direct citizen context, and weather conditions.

      Input Data:
      - Issue: ${analysis.issueType}
      - Base Severity: ${analysis.severity}/10
      - Base Risk: ${analysis.riskLevel}
      - Citizen Upvotes: ${upvotes}
      - Nearby Facilities (within 1000m): ${facilitiesText}
      ${userDescription ? `- Direct Citizen Context: "${userDescription}"` : ''}
      ${weather?.alert ? `- Live Weather Alert: "${weather.alert}"` : '- Weather: Calm / Clear'}

      Instructions:
      1. Calculate a priority score from 0 to 100. Higher severity + closer proximity to sensitive facilities (schools, hospitals) + active storm conditions = much higher score.
      2. Determine the most appropriate government department to handle this from: 'Roads & Traffic (PWD)', 'Solid Waste (SWM)', 'Power Grid (DISCOM)', or 'Water (Jal Board)'.

      Return ONLY a raw, valid JSON object (no markdown, no backticks) with the following exact keys:
      {
        "priorityScore": 95, // Number from 0 to 100
        "department": "Roads & Traffic (PWD)", // Best matching department from the list above
        "priorityReasoning": "1-2 sentences explaining why this score was assigned."
      }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    const cleanJsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedResult = JSON.parse(cleanJsonString) as AIPriorityResult;

    if (weather?.alert) {
      parsedResult.priorityScore = Math.min(100, Math.round(parsedResult.priorityScore * 1.3));
      parsedResult.weatherAlert = weather.alert;
    }

    return parsedResult;

  } catch (error) {
    console.error("Error calculating priority score with Gemini:", error);
    throw new Error("Failed to calculate priority score");
  }
};

export const generateMunicipalReply = async (issue: any): Promise<string> => {
  if (!genAI) {
    return `Thank you for reporting this ${issue.issueType}. The ${issue.department || "City Department"} has logged ticket #${issue.id?.slice(0,6) || "CIVIC"} and scheduled a site inspection.`;
  }
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-robotics-er-1.6-preview" });
    const prompt = `
      You are a formal, professional Municipal Communications Officer for the ${issue.department || "City Infrastructure Board"}.
      Write a concise, reassuring 2-3 sentence public status update to the citizen who reported this issue.
      
      Issue Details:
      - Type: ${issue.issueType}
      - Citizen Notes: ${issue.userDescription || "None"}
      - Assigned Dept: ${issue.department}
      - Priority Score: ${issue.priorityScore}/100
      
      Guidelines:
      1. Express empathy and thank them for civic vigilance.
      2. State clearly that dispatch/inspection crews have been alerted.
      3. Keep tone respectful, official, and direct. Do not include placeholders or brackets. Return plain text only.
    `;
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (err) {
    console.error("Municipal reply generation failed:", err);
    return `Thank you for reporting this ${issue.issueType}. Our municipal team has logged ticket #${issue.id?.slice(0,6) || "CIVIC"} and prioritized dispatch.`;
  }
};
