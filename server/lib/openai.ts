import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Generate AI response for a sub
export async function generateSubResponse(prompt: string, userMessage: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: prompt
        },
        {
          role: "user",
          content: userMessage
        }
      ]
    });

    return response.choices[0].message.content || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Error generating AI response:", error);
    throw new Error("Failed to generate AI response");
  }
}

// Generate AI response in JSON format
export async function generateJsonResponse(prompt: string, userMessage: string): Promise<any> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `${prompt} Respond with JSON in this format: { "response": "your response here" }`
        },
        {
          role: "user",
          content: userMessage
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content || '{"response": "I apologize, but I could not generate a valid response."}';
    return JSON.parse(content);
  } catch (error) {
    console.error("Error generating JSON response:", error);
    throw new Error("Failed to generate AI response");
  }
}
