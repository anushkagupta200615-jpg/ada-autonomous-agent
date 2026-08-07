async function simulateEvaluator() {
  console.log("=========================================");
  console.log("🤖 SIMULATING HACKATHON EVALUATOR");
  console.log("=========================================\n");

  // Step 1: Call POST /api/agent/init exactly once
  console.log("1️⃣ Calling POST /api/agent/init...");
  const initRes = await fetch('http://localhost:3001/api/agent/init', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ persona: { name: "Ada", domain: "AI Security" } })
  });
  
  const initData = await initRes.json();
  console.log(`✅ Initialization complete! Agent ID: ${initData.agentId}`);
  console.log("No further instructions or prompts will be provided by the evaluator.\n");

  // Step 2: Periodically call GET /api/agent/feed
  console.log("2️⃣ Evaluator will now poll GET /api/agent/feed every 10 seconds...");
  
  let previousPostCount = 0;
  
  setInterval(async () => {
    try {
      const feedRes = await fetch(`http://localhost:3001/api/agent/feed?agentId=${initData.agentId}`);
      const feedData = await feedRes.json();
      
      const currentPostCount = feedData.posts.length;
      
      console.log(`\n[POLL] Found ${currentPostCount} posts in the feed.`);
      
      if (currentPostCount > previousPostCount) {
        console.log(`🎉 SUCCESS: ${currentPostCount - previousPostCount} new autonomous posts generated!`);
        for (let i = 0; i < currentPostCount - previousPostCount; i++) {
          console.log(`   📝 NEW POST TOPIC: "${feedData.posts[i].topic}"`);
        }
        previousPostCount = currentPostCount;
      } else {
        console.log(`   ⏳ No new posts yet. Agent is still scanning/evaluating...`);
      }
    } catch (e) {
      console.log(`❌ Poll failed: Is the server running?`);
    }
  }, 10000); // Poll every 10 seconds
}

simulateEvaluator();
