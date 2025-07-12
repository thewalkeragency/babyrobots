# 🧠 Context Engineering Guide

## 🔍 What is Context Engineering?

Context Engineering goes beyond prompt engineering by managing structured memory, reasoning paths, agent states, and scoped context windows. It involves:

- Semantic memory chunking
- Role-based access to memory
- Tool-driven augmentation (e.g. RAG, knowledge graphs)
- Modular memory buckets (`rush` vs `crash`)

## 📌 Why It Matters

- Boosts LLM reliability and task consistency
- Enables persistent, explainable decision trails
- Avoids hallucinations via scoped RAG
- Makes orchestration among agents traceable and inspectable

## 📦 Core Components

| Component       | Purpose                                |
|----------------|----------------------------------------|
| RAG Layer       | Retrieve documents + inject into prompts |
| Knowledge Graph | Define relationships + memory indexing |
| Agent Protocols | Multi-agent task routing (MCP / A2A)    |
| Memory Buckets  | Rush = volatile, Crash = persistent     |

## ✅ Do

- Use chunked embeddings with metadata
- Seed agents with relevant summaries
- Maintain write guards on memory
- Tag all memory writes with scope + origin

## ❌ Don't

- Rely only on session context
- Store raw prompts without abstraction
- Let all agents write to same memory block

## 💡 Scaffolding Example

```python
from langchain.text_splitter import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
docs = splitter.split_documents(load_documents("project.md"))
```

## 🔧 Implementation Rules for Indii Music

### Memory Architecture Integration
- All agents MUST use the Rush + Crash memory system as defined in `memory_infra.md`
- Context must be scoped by project, user session, or agent type
- Memory writes require appropriate permissions based on agent role

### Agent Context Rules
- **Memex (Architect):** Full memory access, responsible for context seeding
- **Warp 2.0 (Engineer):** Task-scoped memory access for implementation context
- **Google Jules (Automation):** Background task memory for monitoring and optimization
- **Gemini CLI (Prototyper):** Experimental memory buckets for rapid iteration

### RAG Integration Requirements
- Use the documented tech stack from `memory_infra.md`
- Implement semantic chunking with 500-character chunks and 50-character overlap
- Tag all memory entries with agent_id, timestamp, scope, and access_level

### Context Handoff Protocol
- When passing context between agents, include:
  - Previous memory state summary
  - Current task scope and limitations
  - Expected output format and validation criteria
  - Access permissions for memory reads/writes

This guide works in conjunction with the memory infrastructure documented in `memory_infra.md` to provide a complete context engineering framework for the Indii Music platform.
