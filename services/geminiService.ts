import { GoogleGenAI, Type } from "@google/genai";
import type { RepoData, ReadmeJson } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const readmeSchema = {
  type: Type.OBJECT,
  properties: {
    projectTitle: { type: Type.STRING, description: "A catchy and descriptive title for the project." },
    tagline: { type: Type.STRING, description: "A short, one-sentence tagline for the project." },
    badges: {
      type: Type.ARRAY,
      description: "A list of relevant markdown badges for things like licenses, build status, etc.",
      items: {
        type: Type.OBJECT,
        properties: {
          label: { type: Type.STRING },
          url: { type: Type.STRING }
        },
        required: ["label", "url"]
      }
    },
    description: { type: Type.STRING, description: "A 2-3 paragraph explanation of the project's purpose and functionality." },
    keyFeatures: {
      type: Type.ARRAY,
      description: "A bulleted list of the project's key features.",
      items: { type: Type.STRING }
    },
    technologies: {
        type: Type.ARRAY,
        description: "A list of primary technologies used, with shield.io badge URLs.",
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            badgeUrl: { type: Type.STRING }
          },
          required: ["name", "badgeUrl"]
        }
    },
    installation: {
      type: Type.ARRAY,
      description: "A list of step-by-step installation instructions, including shell commands.",
      items: { type: Type.STRING }
    },
    usage: { type: Type.STRING, description: "Instructions on how to use the application, with code examples if relevant." },
    contributing: { type: Type.STRING, description: "A brief section on how others can contribute." },
    license: { type: Type.STRING, description: "A statement about the project's license." }
  },
  required: [
    "projectTitle", "tagline", "description", "keyFeatures", 
    "technologies", "installation", "usage", "contributing", "license"
  ]
};

const constructMarkdown = (data: ReadmeJson): string => {
  const sections = [];
  
  sections.push(`# ${data.projectTitle}`);
  sections.push(`> ${data.tagline}`);
  
  if (data.badges && data.badges.length > 0) {
    sections.push(data.badges.map(b => `![${b.label}](${b.url})`).join(' '));
  }

  sections.push(`## 🚀 Description\n\n${data.description}`);
  sections.push(`## ✨ Key Features\n\n${data.keyFeatures.map(f => `- ${f}`).join('\n')}`);
  
  if (data.technologies && data.technologies.length > 0) {
    sections.push(`## 🛠️ Technologies Used\n\n${data.technologies.map(t => `![${t.name}](${t.badgeUrl})`).join(' ')}`);
  }

  sections.push(`## 📦 Installation\n\n\`\`\`bash\n${data.installation.join('\n')}\n\`\`\``);
  sections.push(`##  usage\n\n\`\`\`\n${data.usage}\n\`\`\``);
  sections.push(`## 🤝 Contributing\n\n${data.contributing}`);
  sections.push(`## 📄 License\n\n${data.license}`);

  return sections.join('\n\n');
};

export const generateReadme = async (repoUrl: string, repoData: RepoData, tone: string): Promise<string> => {
  const languageList = Object.keys(repoData.languages).join(', ');
  const fileList = repoData.tree.slice(0, 30).join('\n'); // Limit file list size
  const dependencyList = repoData.dependencies.length > 0
    ? repoData.dependencies.slice(0, 25).join(', ') // Limit dependency list size
    : 'No common dependency files found.';

  const prompt = `
    As an expert software engineer, create a comprehensive and professional README.md file in JSON format for a GitHub repository.

    **Repository URL:** ${repoUrl}

    **Analysis of the repository:**
    - **Primary Languages:** ${languageList}
    - **Detected Libraries/Frameworks:** ${dependencyList}
    - **File Structure (sample):**\n${fileList}
    
    **Instructions:**
    - The tone of the README should be: **${tone}**.
    - Generate a JSON object that strictly adheres to the provided schema.
    - Based on the detected languages and libraries, generate relevant technology badges using URLs from https://img.shields.io. For example, for 'react' you might generate a badge for React.
    - The 'installation' steps should be provided as a list of shell commands.
    - The final output must be ONLY the raw JSON object.
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: readmeSchema
        }
    });

    const jsonText = response.text.trim();
    const parsedJson: ReadmeJson = JSON.parse(jsonText);
    return constructMarkdown(parsedJson);

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to generate README from AI. The model may have returned an invalid response.");
  }
};