import { GoogleGenAI } from "@google/genai";
import { MODEL_CHOICES } from '../constants';

// Mock implementation for other providers since we don't have backend proxies
const mockGenerate = async (model: string, prompt: string) => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  return `[MOCK OUTPUT for ${model}]\n\nProcessed request: ${prompt.substring(0, 50)}...\n\nAnalyzed content based on regulatory standards.`;
};

export const generateText = async (
  model: string, 
  systemPrompt: string, 
  userPrompt: string, 
  apiKeys: Record<string, string>
) => {
  const provider = MODEL_CHOICES[model as keyof typeof MODEL_CHOICES];

  try {
    if (provider === 'gemini') {
        if (!apiKeys.gemini) throw new Error("Gemini API Key missing");
        
        // Use the official Google GenAI SDK
        const ai = new GoogleGenAI({ apiKey: apiKeys.gemini });
        
        const response = await ai.models.generateContent({
            model: model,
            contents: userPrompt,
            config: {
                systemInstruction: systemPrompt,
            }
        });
        
        // Safely extract text
        return {
            text: response.text || "No response text generated.",
            tokens: Math.floor(userPrompt.length / 4), // Estimation
            provider: 'Gemini'
        };
    } else if (provider === 'anthropic') {
        // Client-side Anthropic calls are usually blocked by CORS, 
        // but if we had a proxy, this is where it would go.
        // For this demo, if no backend is available, we mock.
        // If you have a proxy, replace this.
        const text = await mockGenerate(model, userPrompt);
        return {
            text,
            tokens: Math.floor(userPrompt.length / 4) + 100,
            provider: 'Anthropic'
        };
    }
    
    // For others, use mock for this demo as we can't implement server-side calls here
    const text = await mockGenerate(model, userPrompt);
    return {
        text,
        tokens: Math.floor(userPrompt.length / 4) + 100,
        provider: provider ? (provider.charAt(0).toUpperCase() + provider.slice(1)) : 'Unknown'
    };
  } catch (e: any) {
    return {
        text: `Error: ${e.message}`,
        tokens: 0,
        provider: provider || 'Unknown'
    };
  }
};

export const extractTextFromDocument = async (
    file: File,
    apiKeys: Record<string, string>
): Promise<string> => {
    // Helper to convert file to base64
    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const result = reader.result as string;
                // Remove data:application/pdf;base64, prefix
                const base64 = result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = error => reject(error);
        });
    };

    try {
        // 1. Try Gemini Multimodal OCR if key exists
        if (apiKeys.gemini) {
            const base64Data = await fileToBase64(file);
            const ai = new GoogleGenAI({ apiKey: apiKeys.gemini });
            
            // gemini-2.5-flash is excellent for document understanding
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: {
                    parts: [
                        {
                            inlineData: {
                                mimeType: file.type,
                                data: base64Data
                            }
                        },
                        {
                            text: "Please transcribe the full text of this document into Markdown format. Preserve tables, headers, and structure. If there are forms, extract the values."
                        }
                    ]
                }
            });
            
            return response.text || "No text extracted.";
        }

        // 2. Fallback Mock if no key
        await new Promise(resolve => setTimeout(resolve, 2500));
        return `# OCR Result for ${file.name}
        
**Document Info**: ${file.type}, ${(file.size / 1024).toFixed(2)} KB
**Date**: ${new Date().toLocaleDateString()}

## Executive Summary
(Simulated Extraction) This document appears to be a regulatory submission containing technical specifications and clinical data.

## Extracted Content
**Product Name**: Example Medical Device 2000
**Manufacturer**: Global MedTech Inc.
**Indication**: For the treatment of mild to moderate hypertension.

### Clinical Data Table
| Parameter | Cohort A | Cohort B | P-Value |
|-----------|----------|----------|---------|
| N         | 150      | 150      | -       |
| Response  | 85%      | 62%      | <0.001  |

*Note: To get real AI OCR, please enter a valid Gemini API Key in the sidebar.*`;

    } catch (error: any) {
        console.error("OCR Error", error);
        return `Error extracting text: ${error.message}`;
    }
};