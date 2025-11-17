// Step 5b: Execute Agent Collaboration
// Chains two agents together for complex tasks
// Insert this as an ALTERNATIVE to step 5 (call-claude) when collaboration is detected

export default defineComponent({
  async run({ steps, $ }) {
    // Only run if this is a collaboration request
    if (!steps.parse_collaboration?.isCollaboration) {
      return { skipped: true };
    }

    // If there was an error parsing collaboration, skip Claude API call
    if (steps.parse_collaboration.error) {
      return {
        isCollaboration: true,
        reply: steps.parse_collaboration.errorMessage,
        tokensUsed: 0
      };
    }

    const { agent1, agent2, task } = steps.parse_collaboration;

    // Load both agent configurations
    const username = process.env.GITHUB_USERNAME || 'briandusape';
    const repo = process.env.GITHUB_REPO || 'the-cockpit';
    const branch = process.env.GITHUB_BRANCH || 'main';

    const agentMap = {
      'publicist': 'publicist.md',
      'growth': 'growth-hacker.md',
      'strategist': 'strategist.md',
      'content': 'content-strategist.md',
      'credit': 'credit-advisor.md'
    };

    console.log(`🤝 Collaboration: ${agent1} → ${agent2}`);

    // Step 1: Load first agent
    const agent1Url = `https://raw.githubusercontent.com/${username}/${repo}/${branch}/agents/${agentMap[agent1]}`;
    const agent1Response = await fetch(agent1Url);
    const agent1Instructions = await agent1Response.text();

    // Step 2: First agent processes the task
    console.log(`📨 ${agent1} is analyzing the task...`);

    const agent1Prompt = {
      model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      system: agent1Instructions,
      messages: [
        {
          role: 'user',
          content: `You are collaborating with the @${agent2} agent. Your task: ${task}\n\nProvide your analysis, recommendations, or output. The @${agent2} agent will build on your work, so be thorough and specific.`
        }
      ]
    };

    const agent1ApiResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify(agent1Prompt)
    });

    const agent1Data = await agent1ApiResponse.json();
    const agent1Output = agent1Data.content[0].text;
    const agent1Tokens = agent1Data.usage.input_tokens + agent1Data.usage.output_tokens;

    console.log(`✅ ${agent1} completed (${agent1Tokens} tokens)`);

    // Step 3: Load second agent
    const agent2Url = `https://raw.githubusercontent.com/${username}/${repo}/${branch}/agents/${agentMap[agent2]}`;
    const agent2Response = await fetch(agent2Url);
    const agent2Instructions = await agent2Response.text();

    // Step 4: Second agent builds on first agent's output
    console.log(`📨 ${agent2} is building on ${agent1}'s work...`);

    const agent2Prompt = {
      model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      system: agent2Instructions,
      messages: [
        {
          role: 'user',
          content: `You are collaborating with the @${agent1} agent on this task: "${task}"\n\nHere's what @${agent1} provided:\n\n---\n${agent1Output}\n---\n\nNow, based on @${agent1}'s analysis, provide your specialized contribution. Build on their work and deliver the final output.`
        }
      ]
    };

    const agent2ApiResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify(agent2Prompt)
    });

    const agent2Data = await agent2ApiResponse.json();
    const agent2Output = agent2Data.content[0].text;
    const agent2Tokens = agent2Data.usage.input_tokens + agent2Data.usage.output_tokens;

    console.log(`✅ ${agent2} completed (${agent2Tokens} tokens)`);

    // Step 5: Combine outputs
    const combinedReply = `🤝 **Collaboration: @${agent1} + @${agent2}**\n\n` +
      `**@${agent1}'s Analysis:**\n${agent1Output}\n\n` +
      `---\n\n` +
      `**@${agent2}'s Contribution:**\n${agent2Output}`;

    const totalTokens = agent1Tokens + agent2Tokens;

    console.log(`✅ Collaboration complete (${totalTokens} tokens total)`);

    return {
      isCollaboration: true,
      reply: combinedReply,
      tokensUsed: totalTokens,
      tokensIn: agent1Data.usage.input_tokens + agent2Data.usage.input_tokens,
      tokensOut: agent1Data.usage.output_tokens + agent2Data.usage.output_tokens,
      model: agent1Data.model,
      agent1,
      agent2,
      agent1Output,
      agent2Output
    };
  }
});
