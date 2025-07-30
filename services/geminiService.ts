
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Category } from '../types';

// Este arquivo ilustra como o Gemini seria usado.
// Na implementação atual, sua saída é pré-calculada e armazenada em `data/processedData.ts`
// para garantir que o aplicativo funcione sem uma chave de API ativa.

// Certifique-se de que a API_KEY esteja definida em suas variáveis de ambiente para que isso funcione.
const apiKey = process.env.API_KEY;
if (!apiKey) {
  console.warn("A variável de ambiente API_KEY não está definida. O serviço Gemini não funcionará.");
}
const ai = new GoogleGenAI({ apiKey: apiKey || "DISABLED" });

/**
 * Categoriza uma ementa legislativa usando a API Gemini.
 * @param summary O texto da ementa da matéria legislativa.
 * @returns A categoria da matéria.
 */
export async function categorizeSummary(summary: string): Promise<Category> {
  if (!apiKey) return Category.UrbanInfrastructure; // Fallback padrão

  const model = "gemini-2.5-flash";
  const prompt = `
    Analise a seguinte solicitação legislativa de um contexto municipal brasileiro e classifique-a em uma das categorias especificadas.
    Sua resposta deve ser um objeto JSON com uma única chave "category".

    Categorias:
    - "${Category.UrbanInfrastructure}": Pavimentação, reparos de vias, obras públicas.
    - "${Category.EnvironmentAndSanitation}": Coleta de lixo, reciclagem, esgoto, drenagem, poda de árvores.
    - "${Category.MobilityAndTransit}": Sinalização de trânsito, faixas de pedestres, lombadas, problemas de transporte público.
    - "${Category.PublicServices}": Iluminação pública, problemas no fornecimento de água.
    - "${Category.PublicSafety}": Pedidos de aumento de policiamento, defesa do consumidor (PROCON).
    - "${Category.CommunitySpaces}": Melhorias em parques, praças e áreas de lazer públicas.

    Solicitação Legislativa: "${summary}"

    Com base nisso, qual é a categoria mais apropriada?
    `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: {
              type: Type.STRING,
              enum: Object.values(Category),
              description: "A categoria de classificação para a solicitação legislativa.",
            },
          },
          required: ["category"],
        },
      },
    });
    
    const jsonStr = response.text.trim();
    const result = JSON.parse(jsonStr);
    return result.category as Category;

  } catch (error) {
    console.error("Erro ao categorizar ementa com Gemini:", error);
    // Retorna uma categoria padrão ou trata o erro conforme apropriado
    return Category.UrbanInfrastructure;
  }
}

/**
 * Extrai uma localização estruturada de uma ementa legislativa usando a API Gemini.
 * @param summary O texto da ementa da matéria legislativa.
 * @returns Um objeto de localização estruturado.
 */
export async function extractLocation(summary: string): Promise<{ address: string; neighborhood?: string }> {
    if (!apiKey) return { address: 'Localização não extraída' }; // Fallback padrão

    const model = "gemini-2.5-flash";
    const prompt = `
        Do texto a seguir, extraia o endereço principal (Rua/Avenida) e, se mencionado, o bairro.
        Sua resposta deve ser um objeto JSON.

        Texto: "${summary}"

        Exemplo de Saída:
        {
          "address": "Rua Sestílio Gasperi, ao final",
          "neighborhood": "Humaitá"
        }
    `;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        address: {
                            type: Type.STRING,
                            description: "O nome completo da rua e número ou ponto de referência.",
                        },
                        neighborhood: {
                            type: Type.STRING,
                            description: "O bairro, se especificado.",
                        },
                    },
                    required: ["address"],
                },
            },
        });

        const jsonStr = response.text.trim();
        const result = JSON.parse(jsonStr);
        return result;

    } catch (error) {
        console.error("Erro ao extrair localização com Gemini:", error);
        return { address: "Não foi possível determinar a localização." };
    }
}
