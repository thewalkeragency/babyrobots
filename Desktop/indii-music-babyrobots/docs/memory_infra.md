# 🎵 Indii.Music Backend + Memory Architecture Plan

> Building infrastructure for intelligent, multi-agent workflows with persistent, RAG-enhanced, memory-aware backends.

---

## 🧠 GOAL

Create a scalable, memory-centric AI backend that enables powerful agent orchestration, search, recall, and intelligent reasoning for Indii.Music's CEO-level and assistant agents.

---

## 🧩 CORE COMPONENTS

### ✅ 1. RAG-ENABLED MEMORY SYSTEM

- **Tech Stack**: LangGraph, LangChain, RAGAS, Redis or KuzuDB (or vector DB like Weaviate/Qdrant).
- **Use**: Stores long-term user interaction, music metadata, past prompt results, decisions made.
- **RAG Scope**: From micro (single sentence) to macro (entire document libraries).

#### 📌 TO DO

- ✅ Ingest chunked documents using semantic splitting.
- ✅ Support OpenAI `text-embedding-3-small` or `large` models.
- ✅ Create indexing strategies for paragraphs, blog posts, PDFs, and books.
- ✅ Design fallback prompt logic if retrieval fails.

#### ❗ DON'T

- ❌ Store full prompt history without chunking or summarizing.
- ❌ Rely solely on ephemeral LLM context windows.

#### 💡 EXAMPLE

```python
from langchain.document_loaders import TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter

loader = TextLoader("tolstoy.txt")
documents = loader.load()
splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
docs = splitter.split_documents(documents)
```

---

### ✅ 2. KNOWLEDGE GRAPH INTEGRATION

- **Tech**: Kuzudb, Neo4j, LangGraph + GraphFoundationModel
- **Use**: Tracks relationships across music industry roles, actions, releases, tools, agents.

#### 📌 TO DO

- ✅ Use graph structure to enrich RAG prompt grounding.
- ✅ Link related entities: artist, release, playlist, task.

#### ❗ DON'T

- ❌ Hardcode relationships or static metadata

#### 💡 EXAMPLE

```cypher
CREATE (a:Artist {name: "Indii"})-[:RELEASED]->(t:Track {title: "New Wave"})
```

---

### ✅ 3. MULTI-AGENT MEMORY ACCESS + DELEGATION

- **Concepts**: CEO agent with role-specific delegate agents
- **Protocol**: A2A + MCP
- **Use**: Allow agents to delegate tasks and access memory without corrupting global state.

#### 📌 TO DO

- ✅ Assign memory access roles
- ✅ Tag scoped memories per task/project
- ✅ Add memory write guards

#### ❗ DON'T

- ❌ Let all agents write to the same memory region blindly

#### 💡 EXAMPLE

```json
{
  "agent": "ProducerBot",
  "memory_scope": "project:xyz",
  "access": "read-only"
}
```

---

### ✅ 4. WEB + TOOL INTERFACING

- **Use**: Some agents must browse music blogs, generate lyrics, analyze competition.
- **Tooling**: Browser tool (CrewAI, LangGraph ToolNode), Puppeteer MCP integration

#### 📌 TO DO

- ✅ Integrate with web agents and real-time scraping tools
- ✅ Auto-summarize article contents to chunk and index

#### ❗ DON'T

- ❌ Store full webpage content without extracting purpose-specific data

#### 💡 EXAMPLE

```python
from langgraph.tools import ToolNode
fetch_reviews = ToolNode.from_browser(url="pitchfork.com/indii")
```

---

### ✅ 5. RUSH + CRASH MEMORY SYSTEM

- **Concept**: Split memory into `rush` (short-term) and `crash` (offloaded, persistent)
- **Use**: Speed + stability during live sessions

#### 📌 TO DO

- ✅ Set TTL on rush memory buckets
- ✅ Sync important rush memory to crash
- ✅ Use session IDs as keys

#### 💡 EXAMPLE

```json
{
  "session_id": "u1234",
  "memory_rush": ["Hey Claude, build me a tour plan."],
  "memory_crash": ["Tour locations decided: NYC, LA, Tokyo"]
}
```

---

## 📦 RECOMMENDED STACK

| Component        | Option A          | Option B        |
| ---------------- | ----------------- | --------------- |
| Vector DB        | Weaviate          | Qdrant          |
| Graph DB         | KuzuDB            | Neo4j           |
| Memory Framework | LangGraph         | LangChain       |
| Protocol         | MCP + A2A         | ACP             |
| Tool Interface   | Puppeteer/Browser | LangGraph Tools |

---

## 🧠 CONTEXT ENGINEERING TIPS

- Seed new agents with partial replay of relevant memory
- Update memory only after agent consensus (quorum)
- Store abstracted conclusions, not raw API calls
- When working with RAG, always apply preprocessing (chunking, metadata tagging)
- Validate chunking granularity depending on use: tweets ≠ novels

---

> 📁 Save this file under: `docs/memory_infra.md`
