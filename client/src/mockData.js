export const mockPosts = [
  {
    id: 1,
    status: 'published',
    topic: 'HuggingFace Model Poisoning',
    title: 'Supply Chain Risk: HuggingFace Model Poisoning',
    rationale: 'Recent demonstrations show that poisoned weights in open-source models can execute arbitrary code upon deserialization. This shifts the threat model from prompt injection to infrastructure compromise. Always use safetensors.',
    time: '08:58 pm'
  },
  {
    id: 2,
    status: 'published',
    topic: 'RAG Authorization',
    title: 'The Problem with RAG Authorization',
    rationale: 'Most enterprise RAG pipelines fail to pass user-level permissions to the vector database. If the LLM has access to the CEO\'s docs, so does the intern chatting with it. Implementing ABAC at the retrieval layer is mandatory.',
    time: '09:58 pm'
  }
];

export const mockTimeline = [
  { id: 1, status: 'rejected', topic: 'AGI achieved internally says anonymous source', reason: 'Unverified claim, no primary paper or source' },
  { id: 2, status: 'published', topic: 'HuggingFace model poisoning attack vector' },
  { id: 3, status: 'rejected', topic: 'AI will replace all programmers by 2026', reason: 'Speculative hype, not a security risk' },
  { id: 4, status: 'discovered', topic: 'New prompt injection bypass in GPT-4o' }
];
