import { GoogleGenAI } from "@google/genai";
import { ProductCategory } from "../types";

// Safety check for process.env in browser environments
const getApiKey = () => {
  try {
    // @ts-ignore
    return process.env.API_KEY;
  } catch (e) {
    console.warn("process.env.API_KEY is not accessible. AI features will be disabled.");
    return "";
  }
};

// Initialize the AI client
const ai = new GoogleGenAI({ apiKey: getApiKey() });

/**
 * Generates a marketing description for a digital product based on title and category.
 */
export const generateProductDescription = async (
  title: string,
  category: ProductCategory,
  features: string
): Promise<string> => {
  try {
    const model = "gemini-2.5-flash";
    
    const prompt = `
      Ты опытный копирайтер для платформы продажи цифровых товаров (аналог Gumroad).
      Напиши продающее, краткое и структурированное описание на русском языке для продукта.
      
      Название: ${title}
      Категория: ${category}
      Ключевые особенности (если есть): ${features}
      
      Структура ответа:
      1. Короткий цепляющий заголовок (hook).
      2. Описание проблемы, которую решает продукт (1-2 предложения).
      3. Список того, что внутри (буллиты).
      4. Призыв к действию.
      
      Не используй markdown разметку для заголовков (###), используй просто текст и эмодзи.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 400,
      }
    });

    return response.text || "Не удалось сгенерировать описание.";
  } catch (error) {
    console.error("Error generating description:", error);
    return "Ошибка при генерации описания. Проверьте API ключ.";
  }
};

/**
 * Suggests a price in RUB based on the product details.
 */
export const suggestPrice = async (title: string, category: ProductCategory): Promise<number> => {
  try {
    const model = "gemini-2.5-flash";
    const prompt = `
      Порекомендуй цену в рублях (RUB) для цифрового товара.
      Название: ${title}
      Категория: ${category}
      
      Ответь ТОЛЬКО числом (например: 1500). Не добавляй текст.
      Оценивай адекватно рынку цифровых товаров в РФ.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt
    });

    const text = response.text?.trim();
    const price = parseInt(text || "0", 10);
    return isNaN(price) ? 1000 : price;
  } catch (error) {
    console.error("Error suggesting price:", error);
    return 990; // Fallback price
  }
};

/**
 * Generates a cover image for the product.
 */
export const generateCoverImage = async (title: string, category: ProductCategory): Promise<string | null> => {
  try {
    const model = "gemini-2.5-flash-image";
    const prompt = `
      Generate a high-quality, minimalistic, and modern digital art cover image for a digital product named "${title}" in the category "${category}".
      Style: Abstract, gradient, 3D render, high tech, clean.
      No text on the image.
      Aspect Ratio: 4:3.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "4:3",
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
};