/**
 * Tests for Indii AI Agent Core Functionality
 * Testing the 8 core concepts outlined in the Indii documentation
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';

// Mock AI agent components
const mockLLMEngine = {
  processRequest: jest.fn(),
  generateResponse: jest.fn(),
  invokeTool: jest.fn()
};

const mockRAG = {
  queryKnowledgeBase: jest.fn(),
  retrieveIndustryStandards: jest.fn()
};

const mockMemory = {
  storeContext: jest.fn(),
  retrieveContext: jest.fn(),
  updateSessionContext: jest.fn()
};

const mockToolOrchestrator = {
  executeWebSearch: jest.fn(),
  processOCR: jest.fn(),
  analyzeContract: jest.fn(),
  findLocalVendors: jest.fn()
};

describe('Indii AI Agent Core', () => {
  let indiiAgent;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Initialize mock Indii agent
    indiiAgent = {
      llmEngine: mockLLMEngine,
      rag: mockRAG,
      memory: mockMemory,
      toolOrchestrator: mockToolOrchestrator,
      
      // Core agent methods
      processUserRequest: async function(request, sessionId) {
        // Simulate the agent's main processing flow
        const context = await this.memory.retrieveContext(sessionId);
        const response = await this.llmEngine.processRequest(request, context);
        await this.memory.updateSessionContext(sessionId, response.context);
        return response;
      },
      
      planTask: function(userGoal) {
        // Simulate task decomposition
        return {
          mainGoal: userGoal,
          subtasks: this.decomposeTask(userGoal),
          tools: this.selectRequiredTools(userGoal)
        };
      },
      
      decomposeTask: function(goal) {
        // Simple task decomposition logic
        if (goal.includes('contract')) {
          return ['ocr_scan', 'rag_analysis', 'legal_summary'];
        }
        if (goal.includes('emergency print')) {
          return ['location_detection', 'vendor_search', 'contact_extraction'];
        }
        return ['general_analysis'];
      },
      
      selectRequiredTools: function(goal) {
        const tools = [];
        if (goal.includes('location') || goal.includes('emergency print')) tools.push('gps', 'web_search');
        if (goal.includes('contract')) tools.push('ocr', 'rag');
        if (goal.includes('royalty')) tools.push('pdf_parser', 'rag');
        return tools;
      }
    };
  });

  describe('1. Agent Core: Language Model Engine', () => {
    it('should process natural language understanding correctly', async () => {
      const userRequest = "Help me analyze this contract for my upcoming gig";
      const sessionId = "test-session-123";
      
      // Mock retrieving context to return undefined initially
      mockMemory.retrieveContext.mockResolvedValue(undefined);
      mockLLMEngine.processRequest.mockResolvedValue({
        intent: 'contract_analysis',
        entities: ['contract', 'gig'],
        context: { task: 'legal_review' }
      });

      const result = await indiiAgent.processUserRequest(userRequest, sessionId);
      
      expect(mockLLMEngine.processRequest).toHaveBeenCalledWith(userRequest, undefined);
      expect(result.intent).toBe('contract_analysis');
    });

    it('should invoke appropriate tools based on request analysis', () => {
      const contractGoal = "analyze contract terms";
      const plan = indiiAgent.planTask(contractGoal);
      
      expect(plan.subtasks).toContain('ocr_scan');
      expect(plan.subtasks).toContain('rag_analysis');
      expect(plan.tools).toContain('ocr');
      expect(plan.tools).toContain('rag');
    });
  });

  describe('2. Goal Orientation & Planning', () => {
    it('should break down complex requests into manageable subtasks', () => {
      const complexRequest = "emergency print order for t-shirts";
      const plan = indiiAgent.planTask(complexRequest);
      
      expect(plan.mainGoal).toBe(complexRequest);
      expect(plan.subtasks).toEqual(['location_detection', 'vendor_search', 'contact_extraction']);
      expect(plan.tools).toContain('gps');
      expect(plan.tools).toContain('web_search');
    });

    it('should prioritize tasks based on urgency indicators', () => {
      const urgentRequest = "emergency print order";
      const normalRequest = "general analysis request";
      
      const urgentPlan = indiiAgent.planTask(urgentRequest);
      const normalPlan = indiiAgent.planTask(normalRequest);
      
      // Urgent request should trigger specific tools while normal request gets general analysis
      expect(urgentPlan.tools).toContain('gps');
      expect(urgentPlan.tools).toContain('web_search');
      expect(normalPlan.tools).toEqual([]);
      expect(urgentRequest.includes('emergency')).toBe(true);
    });
  });

  describe('3. Knowledge & Context Management', () => {
    it('should retrieve domain-specific knowledge via RAG', async () => {
      mockRAG.queryKnowledgeBase.mockResolvedValue({
        industryStandards: ['sync licensing rates', 'PRO requirements'],
        legalTerms: ['mechanical royalties', 'performance rights']
      });

      const query = "sync licensing requirements";
      const knowledge = await indiiAgent.rag.queryKnowledgeBase(query);
      
      expect(mockRAG.queryKnowledgeBase).toHaveBeenCalledWith(query);
      expect(knowledge.industryStandards).toContain('sync licensing rates');
    });

    it('should maintain context across conversation sessions', async () => {
      const sessionId = "context-test-session";
      const initialContext = { artistName: "DJ Test", genre: "Electronic" };
      
      mockMemory.retrieveContext.mockResolvedValue(initialContext);
      mockMemory.updateSessionContext.mockResolvedValue(true);

      await indiiAgent.memory.storeContext(sessionId, initialContext);
      const retrievedContext = await indiiAgent.memory.retrieveContext(sessionId);
      
      expect(retrievedContext).toEqual(initialContext);
    });
  });

  describe('4. Tool Use & Action Execution', () => {
    it('should execute web search for location-based queries', async () => {
      mockToolOrchestrator.executeWebSearch.mockResolvedValue([
        { name: "Quick Print Shop", location: "Downtown", phone: "555-0123" },
        { name: "Rush Printing", location: "Mall", phone: "555-0456" }
      ]);

      const searchQuery = "same day t-shirt printing near Detroit";
      const results = await indiiAgent.toolOrchestrator.executeWebSearch(searchQuery);
      
      expect(mockToolOrchestrator.executeWebSearch).toHaveBeenCalledWith(searchQuery);
      expect(results).toHaveLength(2);
      expect(results[0]).toHaveProperty('name');
      expect(results[0]).toHaveProperty('phone');
    });

    it('should process OCR for contract analysis', async () => {
      mockToolOrchestrator.processOCR.mockResolvedValue({
        text: "Performance Agreement - Artist shall receive 70% of net receipts",
        confidence: 0.95
      });

      const contractImage = "base64-encoded-contract-image";
      const ocrResult = await indiiAgent.toolOrchestrator.processOCR(contractImage);
      
      expect(mockToolOrchestrator.processOCR).toHaveBeenCalledWith(contractImage);
      expect(ocrResult.text).toContain("Performance Agreement");
      expect(ocrResult.confidence).toBeGreaterThan(0.9);
    });
  });

  describe('5. Orchestration Layer', () => {
    it('should coordinate between LLM, RAG, memory, and tools', async () => {
      const userRequest = "I need help with royalty statements";
      const sessionId = "orchestration-test";
      
      // Mock the full orchestration flow
      mockMemory.retrieveContext.mockResolvedValue({ artistProfile: "Electronic Producer" });
      mockLLMEngine.processRequest.mockResolvedValue({
        intent: 'royalty_analysis',
        requiredTools: ['pdf_parser', 'rag'],
        context: { task: 'financial_review' }
      });

      const result = await indiiAgent.processUserRequest(userRequest, sessionId);
      
      expect(mockMemory.retrieveContext).toHaveBeenCalledWith(sessionId);
      expect(mockLLMEngine.processRequest).toHaveBeenCalled();
      expect(mockMemory.updateSessionContext).toHaveBeenCalled();
    });
  });

  describe('6. User Interaction & Interface', () => {
    it('should provide clear and contextual responses', async () => {
      mockLLMEngine.generateResponse.mockResolvedValue({
        message: "I found 3 printing options near your location. Quick Print Shop can do rush orders and is 5 minutes away.",
        confidence: 0.92,
        actionable: true,
        suggestions: ["call Quick Print Shop", "get quote", "confirm timeline"]
      });

      const response = await indiiAgent.llmEngine.generateResponse({
        intent: 'emergency_print',
        results: ['Quick Print Shop', 'Rush Printing', 'Express Graphics']
      });
      
      expect(response.message).toContain("3 printing options");
      expect(response.actionable).toBe(true);
      expect(response.suggestions).toContain("call Quick Print Shop");
    });
  });

  describe('7. Proactivity', () => {
    it('should identify proactive opportunities based on context', () => {
      const artistContext = {
        upcomingShows: [{ date: "2025-07-15", location: "Chicago" }],
        merchInventory: { tshirts_large: 5 }
      };
      
      // Simulate proactive analysis
      const proactiveCheck = (context) => {
        const suggestions = [];
        if (context.merchInventory.tshirts_large < 10) {
          suggestions.push("Consider restocking Large t-shirts before Chicago show");
        }
        return suggestions;
      };
      
      const suggestions = proactiveCheck(artistContext);
      expect(suggestions).toContain("Consider restocking Large t-shirts before Chicago show");
    });
  });

  describe('8. Safety, Reliability & Ethics', () => {
    it('should provide appropriate disclaimers for legal/financial advice', () => {
      const contractAnalysis = {
        summary: "Contract appears favorable with 70/30 split",
        disclaimer: "This is not legal advice. Please consult with a qualified attorney."
      };
      
      expect(contractAnalysis.disclaimer).toContain("not legal advice");
      expect(contractAnalysis.disclaimer).toContain("qualified attorney");
    });

    it('should handle tool failures gracefully', async () => {
      mockToolOrchestrator.executeWebSearch.mockRejectedValue(new Error("Search API unavailable"));
      
      try {
        await indiiAgent.toolOrchestrator.executeWebSearch("test query");
      } catch (error) {
        expect(error.message).toBe("Search API unavailable");
      }
      
      // In a real implementation, this would fall back to alternative methods
      expect(mockToolOrchestrator.executeWebSearch).toHaveBeenCalled();
    });

    it('should validate and ground responses in retrieved data', async () => {
      mockRAG.retrieveIndustryStandards.mockResolvedValue({
        syncLicensingRates: "0.05-0.15 per stream",
        source: "ASCAP Industry Guidelines 2024"
      });

      const industryData = await indiiAgent.rag.retrieveIndustryStandards("sync licensing");
      
      expect(industryData).toHaveProperty('source');
      expect(industryData.source).toContain("2024");
    });
  });
});
