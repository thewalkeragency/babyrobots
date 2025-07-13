// Semantic Chunker - Tree Ring Processing Layer
// Document chunking service for context engineering
// Based on docs/context_engineering.md - 500 character chunks, 50 character overlap

export class SemanticChunker {
  constructor(options = {}) {
    this.chunkSize = options.chunkSize || 500;
    this.overlap = options.overlap || 50;
    this.preserveStructure = options.preserveStructure !== false;
    this.minChunkSize = options.minChunkSize || 100;
  }

  // Main chunking method - Tree Ring processing
  async chunkText(text, metadata = {}) {
    if (!text || typeof text !== 'string') {
      return [];
    }

    // Clean and normalize text
    const normalizedText = this._normalizeText(text);
    
    // Generate chunks with overlap
    const chunks = this._generateChunks(normalizedText, metadata);
    
    // Post-process chunks for quality
    const processedChunks = this._postProcessChunks(chunks);
    
    return processedChunks;
  }

  // Normalize text for consistent chunking
  _normalizeText(text) {
    return text
      .replace(/\r\n/g, '\n')  // Normalize line endings
      .replace(/\s+/g, ' ')    // Normalize whitespace
      .trim();
  }

  // Generate chunks with semantic boundaries
  _generateChunks(text, metadata) {
    const chunks = [];
    let start = 0;
    let chunkIndex = 0;

    while (start < text.length) {
      let end = Math.min(start + this.chunkSize, text.length);
      
      // Try to find a good breaking point (sentence or paragraph end)
      if (end < text.length && this.preserveStructure) {
        end = this._findSemanticBreak(text, start, end);
      }
      
      const chunkText = text.slice(start, end).trim();
      
      // Skip chunks that are too small (unless it's the last chunk)
      if (chunkText.length >= this.minChunkSize || end >= text.length) {
        chunks.push({
          content: chunkText,
          metadata: {
            ...metadata,
            chunk_index: chunkIndex,
            start_pos: start,
            end_pos: end,
            chunk_size: chunkText.length,
            created_at: new Date().toISOString(),
            chunk_type: this._determineChunkType(chunkText)
          }
        });
        chunkIndex++;
      }
      
      // Move start position with overlap, ensuring progress
      const nextStart = end - this.overlap;
      start = Math.max(nextStart, start + Math.max(this.chunkSize / 4, 20));
    }

    return chunks;
  }

  // Find semantic breaking point (sentence/paragraph boundaries)
  _findSemanticBreak(text, start, suggestedEnd) {
    const searchWindow = 100; // Look within 100 chars for break point
    const minEnd = Math.max(suggestedEnd - searchWindow, start + this.minChunkSize);
    const maxEnd = Math.min(suggestedEnd + searchWindow, text.length);
    
    // Priority order for break points
    const breakPatterns = [
      /\n\n/g,     // Paragraph breaks (highest priority)
      /\.\s+/g,    // Sentence endings
      /[!?]\s+/g,  // Exclamation/question endings
      /;\s+/g,     // Semicolon breaks
      /,\s+/g,     // Comma breaks (lowest priority)
    ];

    for (const pattern of breakPatterns) {
      const segment = text.slice(minEnd, maxEnd);
      pattern.lastIndex = 0; // Reset regex
      
      let match;
      let bestBreak = -1;
      
      while ((match = pattern.exec(segment)) !== null) {
        const breakPos = minEnd + match.index + match[0].length;
        if (breakPos <= maxEnd) {
          bestBreak = breakPos;
        }
      }
      
      if (bestBreak > minEnd) {
        return bestBreak;
      }
    }
    
    // No good break found, use original suggestion
    return suggestedEnd;
  }

  // Determine chunk type for metadata
  _determineChunkType(text) {
    if (text.match(/^\s*#+ /)) return 'heading';
    if (text.match(/```/)) return 'code';
    if (text.match(/^\s*[-*+] /m)) return 'list';
    if (text.match(/^\s*\d+\. /m)) return 'ordered_list';
    if (text.match(/\n\n/)) return 'paragraph';
    return 'text';
  }

  // Post-process chunks for quality improvement
  _postProcessChunks(chunks) {
    return chunks.map((chunk, index) => {
      // Add contextual metadata
      chunk.metadata.total_chunks = chunks.length;
      chunk.metadata.is_first = index === 0;
      chunk.metadata.is_last = index === chunks.length - 1;
      
      // Add content quality metrics
      chunk.metadata.word_count = chunk.content.split(/\s+/).length;
      chunk.metadata.sentence_count = (chunk.content.match(/[.!?]+/g) || []).length;
      chunk.metadata.complexity_score = this._calculateComplexity(chunk.content);
      
      // Add relationships to adjacent chunks
      if (index > 0) {
        chunk.metadata.prev_chunk_overlap = this._calculateOverlap(
          chunks[index - 1].content,
          chunk.content
        );
      }
      
      if (index < chunks.length - 1) {
        chunk.metadata.next_chunk_preview = chunks[index + 1].content.slice(0, 50);
      }
      
      return chunk;
    });
  }

  // Calculate text complexity score (simple heuristic)
  _calculateComplexity(text) {
    const avgWordLength = text.replace(/\s+/g, '').length / (text.split(/\s+/).length || 1);
    const sentenceLength = text.length / ((text.match(/[.!?]+/g) || []).length || 1);
    const uniqueWordsRatio = new Set(text.toLowerCase().split(/\s+/)).size / (text.split(/\s+/).length || 1);
    
    return Math.round((avgWordLength + sentenceLength / 20 + uniqueWordsRatio * 10) * 10) / 10;
  }

  // Calculate overlap between two text chunks
  _calculateOverlap(text1, text2) {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    
    return {
      word_overlap_count: intersection.size,
      overlap_ratio: intersection.size / Math.max(words1.size, words2.size, 1)
    };
  }

  // Chunk structured data (objects, arrays)
  async chunkStructuredData(data, metadata = {}) {
    if (typeof data === 'string') {
      return this.chunkText(data, metadata);
    }
    
    if (Array.isArray(data)) {
      return this._chunkArray(data, metadata);
    }
    
    if (typeof data === 'object' && data !== null) {
      return this._chunkObject(data, metadata);
    }
    
    // Fallback to string representation
    return this.chunkText(JSON.stringify(data, null, 2), {
      ...metadata,
      original_type: typeof data
    });
  }

  // Chunk array data
  _chunkArray(array, metadata) {
    const chunks = [];
    const itemsPerChunk = Math.ceil(this.chunkSize / 100); // Rough estimate
    
    for (let i = 0; i < array.length; i += itemsPerChunk) {
      const chunk = array.slice(i, i + itemsPerChunk);
      chunks.push({
        content: chunk,
        metadata: {
          ...metadata,
          chunk_index: Math.floor(i / itemsPerChunk),
          chunk_type: 'array',
          start_index: i,
          end_index: Math.min(i + itemsPerChunk - 1, array.length - 1),
          item_count: chunk.length,
          created_at: new Date().toISOString()
        }
      });
    }
    
    return chunks;
  }

  // Chunk object data
  _chunkObject(obj, metadata) {
    const entries = Object.entries(obj);
    const chunks = [];
    const entriesPerChunk = Math.ceil(this.chunkSize / 200); // Rough estimate
    
    for (let i = 0; i < entries.length; i += entriesPerChunk) {
      const chunkEntries = entries.slice(i, i + entriesPerChunk);
      const chunkObj = Object.fromEntries(chunkEntries);
      
      chunks.push({
        content: chunkObj,
        metadata: {
          ...metadata,
          chunk_index: Math.floor(i / entriesPerChunk),
          chunk_type: 'object',
          property_count: chunkEntries.length,
          property_names: chunkEntries.map(([key]) => key),
          created_at: new Date().toISOString()
        }
      });
    }
    
    return chunks;
  }

  // Merge chunks back into coherent text
  async mergeChunks(chunks, options = {}) {
    const { includeMetadata = false, separator = '\n\n' } = options;
    
    if (!Array.isArray(chunks) || chunks.length === 0) {
      return '';
    }
    
    // Sort chunks by index to maintain order
    const sortedChunks = chunks.sort((a, b) => 
      (a.metadata?.chunk_index || 0) - (b.metadata?.chunk_index || 0)
    );
    
    let mergedText = sortedChunks
      .map(chunk => chunk.content)
      .join(separator);
    
    if (includeMetadata) {
      const metadataInfo = {
        total_chunks: chunks.length,
        merged_at: new Date().toISOString(),
        original_metadata: sortedChunks.map(chunk => chunk.metadata)
      };
      
      return {
        text: mergedText,
        metadata: metadataInfo
      };
    }
    
    return mergedText;
  }

  // Get chunking statistics
  getStats(chunks) {
    if (!Array.isArray(chunks) || chunks.length === 0) {
      return null;
    }
    
    const sizes = chunks.map(chunk => chunk.content.length);
    const wordCounts = chunks.map(chunk => 
      chunk.metadata?.word_count || chunk.content.split(/\s+/).length
    );
    
    return {
      chunk_count: chunks.length,
      avg_chunk_size: Math.round(sizes.reduce((a, b) => a + b, 0) / sizes.length),
      min_chunk_size: Math.min(...sizes),
      max_chunk_size: Math.max(...sizes),
      avg_word_count: Math.round(wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length),
      total_characters: sizes.reduce((a, b) => a + b, 0),
      chunk_types: [...new Set(chunks.map(chunk => chunk.metadata?.chunk_type))],
      created_at: new Date().toISOString()
    };
  }
}
