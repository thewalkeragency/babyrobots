import { PrismaClient } from '@prisma/client';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

class AIAgent {
  constructor(agentDefinition) {
    this.agentId = agentDefinition.agentId;
    this.agentName = agentDefinition.agentName;
    this.persona = agentDefinition.persona;
    this.coreResponsibilities = agentDefinition.coreResponsibilities;
    this.aiCapabilities = agentDefinition.aiCapabilities;
    this.interactionProtocols = agentDefinition.interactionProtocols;
    this.specializedPrompts = agentDefinition.specializedPrompts;
    this.performanceMetrics = agentDefinition.performanceMetrics;
    this.technicalIntegration = agentDefinition.technicalIntegration;
  }

  async executeTask(task) {
    // To be implemented by each agent
    throw new Error('executeTask not implemented');
  }
}

class ArtDepartmentAgent extends AIAgent {
  async executeTask(task) {
    console.log(`Art Department agent executing task: ${task.title}`);

    if (!task.projectId) {
      throw new Error('Missing projectId in the task');
    }

    const track = await prisma.track.findUnique({
      where: { id: task.projectId },
    });

    if (!track) {
      throw new Error(`Track with ID ${task.projectId} not found`);
    }

    const concepts = this.generateArtConcepts(track);

    await prisma.task.update({
      where: { id: task.id },
      data: { 
        result: { concepts },
        status: 'completed',
        completedAt: new Date(),
       },
    });

    console.log(`Art concepts generated for track: ${track.title}`);
  }

  generateArtConcepts(track) {
    const { title, mood, genre } = track;
    return [
      `An abstract, vibrant oil painting representing the fusion of ${genre} and ${mood}. Use a color palette of deep blues, purples, and fiery oranges to capture the song's energy. The title '${title}' is subtly integrated into the artwork in a flowing, handwritten script.`,
      `A minimalist, black and white photograph of a single, symbolic object that represents the core theme of '${title}'. The image should be stark and evocative, with a lot of negative space. The mood is ${mood}, and the genre is ${genre}.`,
      `A surreal, dreamlike digital illustration that visualizes the lyrical narrative of '${title}'. The scene is set in a fantastical landscape, with colors and imagery that reflect the song's ${mood} and ${genre} influences. Think cinematic, atmospheric, and highly detailed.`,
    ];
  }
}

class GeminiCliAgent extends AIAgent {
  async executeTask(task) {
    // Implement task execution logic for the Gemini CLI agent
    console.log(`Gemini CLI agent executing task: ${task.title}`);
    // ...
  }
}

class JulesAgent extends AIAgent {
  async executeTask(task) {
    // Implement task execution logic for the Jules agent
    console.log(`Jules agent executing task: ${task.title}`);
    // ...
  }
}

class MemexAgent extends AIAgent {
  async executeTask(task) {
    // Implement task execution logic for the Memex agent
    console.log(`Memex agent executing task: ${task.title}`);
    // ...
  }
}

class WarpAgent extends AIAgent {
  async executeTask(task) {
    // Implement task execution logic for the Warp agent
    console.log(`Warp agent executing task: ${task.title}`);
    // ...
  }
}

const agents = {};

async function loadAgents() {
  const agentsDirPath = path.join(__dirname, '../.ai_rules/agents');
  const agentFiles = await fs.readdir(agentsDirPath);

  for (const agentFile of agentFiles) {
    if (agentFile.endsWith('.md')) {
      const agentFilePath = path.join(agentsDirPath, agentFile);
      const agentDefinitionStr = await fs.readFile(agentFilePath, 'utf-8');
      
      // A simple parser for the markdown agent definitions
      const agentDefinition = agentDefinitionStr.split('---').reduce((acc, section) => {
        const lines = section.trim().split('\n');
        const titleLine = lines.shift();
        if (titleLine) {
          const key = titleLine.replace(/#/g, '').trim().toLowerCase().replace(/ /g, '_');
          acc[key] = lines.join('\n').trim();
        }
        return acc;
      }, {});

      const agentId = agentFile.replace('_agent.md', '');
      agentDefinition.agentId = agentId;


      switch (agentId) {
        case 'art_department':
          agents[agentId] = new ArtDepartmentAgent(agentDefinition);
          break;
        case 'gemini_cli':
          agents[agentId] = new GeminiCliAgent(agentDefinition);
          break;
        case 'jules':
          agents[agentId] = new JulesAgent(agentDefinition);
          break;
        case 'memex':
          agents[agentId] = new MemexAgent(agentDefinition);
          break;
        case 'warp':
          agents[agentId] = new WarpAgent(agentDefinition);
          break;
        default:
          console.warn(`Unknown agent type: ${agentId}`);
      }
    }
  }
}

async function getAgent(agentId) {
  if (Object.keys(agents).length === 0) {
    await loadAgents();
  }
  return agents[agentId];
}

async function executeTask(taskId) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) {
    throw new Error(`Task with ID ${taskId} not found`);
  }

  const agent = await getAgent(task.agentId);
  if (!agent) {
    throw new Error(`Agent with ID ${task.agentId} not found`);
  }

  await agent.executeTask(task);
}

export {
  loadAgents,
  getAgent,
  executeTask,
};
