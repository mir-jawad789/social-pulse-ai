import { GoogleGenAI } from "@google/genai";
import type { TrendReport, GroundingChunk, MentionedEntity, AITrendResponse, TrendFilters } from '../types';

const MAX_API_RETRIES = 2;

/**
 * Parses the raw text response from the AI, extracts the JSON object,
 * and validates its structure.
 * @param text The raw text string from the AI response.
 * @returns A validated AITrendResponse object.
 * @throws {Error} If the text doesn't contain a JSON object or if the parsed JSON is invalid.
 */
function parseAndValidateResponse(text: string): AITrendResponse {
    const jsonStartIndex = text.indexOf('{');
    const jsonEndIndex = text.lastIndexOf('}');

    if (jsonStartIndex === -1 || jsonEndIndex === -1 || jsonEndIndex < jsonStartIndex) {
        throw new Error("Response from AI does not contain a parsable JSON object.");
    }

    const jsonString = text.substring(jsonStartIndex, jsonEndIndex + 1);
    
    let data;
    try {
        data = JSON.parse(jsonString);
    } catch (e) {
        throw new Error(`Failed to parse JSON. Details: ${(e as Error).message}`);
    }

    const requiredKeys: (keyof AITrendResponse)[] = [
        'googleTrends', 'tiktokTrends', 'redditTrends', 'instagramTrends', 'facebookTrends', 'xTrends', 'mentionedEntities'
    ];

    for (const key of requiredKeys) {
        if (typeof data[key] === 'undefined') {
            throw new Error(`Validation Error: The response JSON is missing the required key: '${key}'.`);
        }
        if (!Array.isArray(data[key])) {
            throw new Error(`Validation Error: The value for key '${key}' must be an array, but it was not.`);
        }
    }

    return data as AITrendResponse;
}

export async function fetchTrends(filters: TrendFilters): Promise<{ trends: TrendReport; sources: GroundingChunk[]; mentions: MentionedEntity[] }> {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set. Please ensure it's properly configured.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-2.5-flash";

  let prompt = `
    Generate a report on the most recent and emerging trends across Google Search, TikTok, Reddit, Instagram, Facebook, and X (formerly Twitter).
    The report MUST be generated in the following language: ${filters.language}.
    The report MUST be filtered based on the following criteria:
    - Country: ${filters.country}
    - Time Range: Last ${filters.timeRange}
  `;
  
  if (filters.timeRange === '3 months') {
    prompt += `
      - Time Series Analysis: Since the time range is 3 months, for each trend, you MUST include a 'monthlyBreakdown' object.
        This object should map the last three calendar month names (e.g., "June", "July", "August") to a relative popularity score from 1 to 100.
        This data should reflect the trend's momentum over the period.
        If time series data is not available for a specific trend, provide an empty object for 'monthlyBreakdown'.
    `;
  }

  if (filters.entityType && filters.entityType !== 'All') {
    prompt += `- Entity Focus: Prioritize trends that prominently feature entities of the type: '${filters.entityType}'.\n`;
  }

  if (filters.keywords) {
    const terms = filters.keywords.match(/"[^"]+"|[^,\s]+/g) || [];
    const processedTerms = terms
      .map(term => term.trim())
      .filter(term => term.length > 0 && !/^(AND|OR)$/i.test(term))
      .map(term => {
        if (term.startsWith('"') && term.endsWith('"')) {
          return term;
        }
        return `"${term}"`;
      });
    
    if (processedTerms.length > 0) {
        const keywordsFormatted = processedTerms.join(` ${filters.logic} `);
        prompt += `- Keywords: The trend must be related to the following keywords: ${keywordsFormatted}. Use ${filters.logic} logic for multiple keywords. Prioritize exact phrases given in quotes.\n`;
    }
  }

  prompt += `
    For each platform, provide a list of the top 3-5 trending topics.
    For each trending topic, you MUST perform a sentiment analysis and an excitement level analysis.
    - 'sentiment': A score from 0 (very negative) to 100 (very positive) representing the emotional tone.
    - 'excitementLevel': A score from 0 (low excitement) to 100 (high excitement) representing public buzz and engagement.
    
    Your response MUST be ONLY a valid JSON object. Do not include any other text, explanations, or markdown formatting.
    The JSON object must have keys 'googleTrends', 'tiktokTrends', 'redditTrends', 'instagramTrends', 'facebookTrends', and 'xTrends'.
    Each key's value must be an array of objects, where each object has 'topic', 'description', 'sentiment', and 'excitementLevel' properties.
    If no trends are found for a platform, its key MUST contain an empty array ([]).

    After generating the trends, perform a second analysis on all the combined trend descriptions.
    From this analysis, identify and extract any mentioned key entities. Categorize each entity as a 'Retailer', 'Brand', 'E-commerce Website', or 'Celebrity/Influencer'.
    For each entity, provide an 'influenceScore' from 1 to 100, where 100 indicates the highest influence based on the frequency and context of its mentions within the trends.
    The final JSON object MUST include a 'mentionedEntities' key. This key's value should be an array of objects, each with 'name', 'type', and 'influenceScore' properties.
    If no key entities are found, the value for 'mentionedEntities' MUST be an empty array ([]).

    Example of a valid response:
    {
      "googleTrends": [{
        "topic": "Sustainable Fashion",
        "description": "A growing trend focused on ethical clothing production from brands like Patagonia.",
        "monthlyBreakdown": { "June": 60, "July": 75, "August": 90 },
        "sentiment": 85,
        "excitementLevel": 78
      }],
      "tiktokTrends": [],
      "redditTrends": [{
        "topic": "r/skincareaddiction finds",
        "description": "Users are discussing new products from The Ordinary available on Sephora.com.",
        "monthlyBreakdown": {},
        "sentiment": 75,
        "excitementLevel": 88
      }],
      "instagramTrends": [],
      "facebookTrends": [],
      "xTrends": [],
      "mentionedEntities": [
        {"name": "Patagonia", "type": "Brand", "influenceScore": 92},
        {"name": "Zendaya", "type": "Celebrity/Influencer", "influenceScore": 95},
        {"name": "Sephora.com", "type": "E-commerce Website", "influenceScore": 85},
        {"name": "The Ordinary", "type": "Brand", "influenceScore": 78}
      ]
    }
  `;
  
  let lastApiError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_API_RETRIES; attempt++) {
    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });
        
        const text = response.text.trim();
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] || [];

        try {
            const responseData = parseAndValidateResponse(text);
            const trends: TrendReport = {
                googleTrends: responseData.googleTrends || [],
                tiktokTrends: responseData.tiktokTrends || [],
                redditTrends: responseData.redditTrends || [],
                instagramTrends: responseData.instagramTrends || [],
                facebookTrends: responseData.facebookTrends || [],
                xTrends: responseData.xTrends || [],
            };
            const mentions: MentionedEntity[] = responseData.mentionedEntities || [];
            
            return { trends, sources, mentions };

        } catch (parsingError) {
            console.warn(`Initial parsing failed on attempt ${attempt}. Error: ${(parsingError as Error).message}. Attempting AI self-correction.`);
            
            const correctionPrompt = `
              The following response you previously provided resulted in a software error.
              Error details: ${(parsingError as Error).message}.
              Please analyze the following text, correct the JSON syntax and structure, and provide ONLY the valid and complete JSON object as a response.
              Ensure all required keys ('googleTrends', 'tiktokTrends', 'redditTrends', 'instagramTrends', 'facebookTrends', 'xTrends', 'mentionedEntities') are present, even if their value is an empty array.
              Do not include any other text, explanations, or markdown formatting.

              Invalid Response to correct:
              ---
              ${text}
              ---
            `;

            const correctionResponse = await ai.models.generateContent({ model, contents: correctionPrompt });
            const correctedText = correctionResponse.text.trim();
            const correctedResponseData = parseAndValidateResponse(correctedText);

            const trends: TrendReport = {
                googleTrends: correctedResponseData.googleTrends || [],
                tiktokTrends: correctedResponseData.tiktokTrends || [],
                redditTrends: correctedResponseData.redditTrends || [],
                instagramTrends: correctedResponseData.instagramTrends || [],
                facebookTrends: correctedResponseData.facebookTrends || [],
                xTrends: correctedResponseData.xTrends || [],
            };
            const mentions: MentionedEntity[] = correctedResponseData.mentionedEntities || [];

            console.log("AI self-correction was successful.");
            return { trends, sources, mentions };
        }

    } catch (error) {
        lastApiError = error as Error;
        console.error(`Error during fetch attempt ${attempt}:`, error);

        if (lastApiError.message.includes("API key not valid")) {
            throw new Error("The API key is not valid. Please ensure it is configured correctly.");
        }
        
        if (attempt < MAX_API_RETRIES) {
            const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
            console.log(`An issue occurred. Retrying in ${Math.round(delay / 1000)} seconds...`);
            await new Promise(res => setTimeout(res, delay));
        }
    }
  }

  if (lastApiError instanceof SyntaxError || (lastApiError && (lastApiError.message.includes("JSON") || lastApiError.message.includes("Validation")))) {
      throw new Error("The AI's response couldn't be read, even after an attempt to self-correct. This can happen with very niche or complex queries. Please try adjusting your filters.");
  }

  throw new Error(`Failed to fetch trends after ${MAX_API_RETRIES} attempts. Please check your network connection or try again later.`);
}