/**
 * THE COCKPIT - Complete Pipedream Workflow
 *
 * This is a production-ready workflow for The Cockpit WhatsApp AI Agent Platform.
 * Deploy this to Pipedream to connect WhatsApp → Claude API → WhatsApp
 *
 * DEPLOYMENT INSTRUCTIONS:
 * 1. Go to https://pipedream.com/new
 * 2. Select "HTTP / Webhook" as trigger
 * 3. Add the steps below in order
 * 4. Configure environment variables
 * 5. Deploy and get your webhook URL
 *
 * ENVIRONMENT VARIABLES REQUIRED:
 * - CLAUDE_API_KEY
 * - CLAUDE_MODEL (default: claude-sonnet-4-5-20250929)
 * - CLAUDE_MAX_TOKENS (default: 4096)
 * - WHATSAPP_PHONE_NUMBER_ID
 * - WHATSAPP_ACCESS_TOKEN
 * - WHATSAPP_API_VERSION (default: v17.0)
 * - AUTHORIZED_USERS (comma-separated phone numbers)
 * - GITHUB_USERNAME (default: bdusape)
 * - GITHUB_REPO (default: the-cockpit)
 * - GITHUB_BRANCH (default: main)
 */

// ==============================================================
// STEP 1: Webhook Trigger (HTTP / Webhook)
// ==============================================================
// This is automatically created when you select "HTTP / Webhook"
// Pipedream will provide the webhook URL after deployment

// ==============================================================
// STEP 2: Parse WhatsApp Webhook
// ==============================================================
export default defineComponent({
  name: "Parse WhatsApp Webhook",
  description: "Extracts message data from WhatsApp webhook payload",
  async run({ steps, $ }) {
    // Validate webhook payload
    if (!steps.trigger.event.body) {
      $.flow.exit("No webhook body received");
    }

    const body = steps.trigger.event.body;

    // Handle webhook verification (GET request from WhatsApp)
    if (steps.trigger.event.method === "GET") {
      const mode = steps.trigger.event.query["hub.mode"];
      const token = steps.trigger.event.query["hub.verify_token"];
      const challenge = steps.trigger.event.query["hub.challenge"];

      if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
        return $.respond({
          status: 200,
          body: parseInt(challenge),
        });
      } else {
        return $.respond({
          status: 403,
          body: "Forbidden",
        });
      }
    }

    // Parse incoming message
    try {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const messages = value?.messages;

      if (!messages || messages.length === 0) {
        console.log("No messages in payload - likely a status update");
        $.flow.exit("No messages to process");
      }

      const message = messages[0];
      const messageType = message.type;

      // Only process text messages for MVP
      if (messageType !== "text") {
        console.log(`Unsupported message type: ${messageType}`);
        $.flow.exit("Only text messages supported in MVP");
      }

      const parsed = {
        from: message.from,
        message_id: message.id,
        timestamp: message.timestamp,
        message_type: messageType,
        message_body: message.text?.body || "",
        phone_number_id: value.metadata?.phone_number_id,
        display_phone_number: value.metadata?.display_phone_number,
      };

      console.log("📨 Parsed Message:", JSON.stringify(parsed, null, 2));

      return parsed;
    } catch (error) {
      console.error("Error parsing webhook:", error);
      $.flow.exit(`Parse error: ${error.message}`);
    }
  },
});

// ==============================================================
// STEP 3: Authorization Check
// ==============================================================
export default defineComponent({
  name: "Authorization Check",
  description: "Validates user is authorized (security + cost protection)",
  async run({ steps, $ }) {
    const userPhone = steps.parse_whatsapp_webhook.from;

    // Get authorized users from environment variable
    const authorizedUsers = (process.env.AUTHORIZED_USERS || "")
      .split(",")
      .map((num) => num.trim())
      .filter((num) => num.length > 0);

    console.log("🔐 Authorization Check");
    console.log("User:", userPhone);
    console.log("Authorized Users Count:", authorizedUsers.length);

    // Check if user is authorized
    const isAuthorized =
      authorizedUsers.includes(userPhone) ||
      authorizedUsers.includes(`+${userPhone}`);

    if (!isAuthorized) {
      console.warn("⚠️ UNAUTHORIZED ACCESS ATTEMPT:", userPhone);

      // Log security event
      const securityEvent = {
        timestamp: new Date().toISOString(),
        type: "unauthorized_access",
        user_phone: userPhone,
        message: steps.parse_whatsapp_webhook.message_body,
      };

      console.error("🚨 SECURITY EVENT:", JSON.stringify(securityEvent, null, 2));

      // Send rejection message to user
      await $.send.http({
        url: `https://graph.facebook.com/${process.env.WHATSAPP_API_VERSION}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        data: {
          messaging_product: "whatsapp",
          to: userPhone,
          type: "text",
          text: {
            body: "⛔ Unauthorized. This service is private.\n\nIf you believe this is an error, please contact the administrator.",
          },
        },
      });

      // Exit workflow - don't call Claude API (cost protection)
      $.flow.exit("Unauthorized user - workflow terminated");
    }

    console.log("✅ User authorized");

    return {
      authorized: true,
      user_phone: userPhone,
    };
  },
});

// ==============================================================
// STEP 4: Parse Agent Trigger
// ==============================================================
export default defineComponent({
  name: "Parse Agent Trigger",
  description: "Extracts agent name and query from message",
  async run({ steps, $ }) {
    const messageBody = steps.parse_whatsapp_webhook.message_body;

    // Agent trigger pattern: @agent_name query
    const agentPattern = /^@(\w+)\s*(.*)/i;
    const match = messageBody.match(agentPattern);

    let agent = "publicist"; // Default agent
    let query = messageBody;

    if (match) {
      agent = match[1].toLowerCase();
      query = match[2].trim();
    }

    // Agent mapping (convert aliases to file names)
    const agentMap = {
      publicist: "publicist",
      growth: "growth-hacker",
      "growth-hacker": "growth-hacker",
      strategist: "strategist",
      content: "content-strategist",
      "content-strategist": "content-strategist",
      credit: "credit-advisor",
      "credit-advisor": "credit-advisor",
    };

    const agentFileName = agentMap[agent];

    if (!agentFileName) {
      console.warn(`Unknown agent: ${agent}`);
      return {
        agent: null,
        agent_file: null,
        query: query,
        valid: false,
        error: `Agent "${agent}" not found. Available agents: @publicist, @growth, @strategist, @content, @credit`,
      };
    }

    console.log("🤖 Agent Parsed:", agent);
    console.log("📝 Query:", query);

    return {
      agent: agent,
      agent_file: agentFileName,
      query: query || "How can I help you today?",
      valid: true,
    };
  },
});

// ==============================================================
// STEP 5: Fetch Agent Configuration
// ==============================================================
export default defineComponent({
  name: "Fetch Agent Configuration",
  description: "Loads agent system prompt from GitHub",
  async run({ steps, $ }) {
    // Handle invalid agent
    if (!steps.parse_agent_trigger.valid) {
      console.error("Invalid agent, skipping config fetch");
      return {
        success: false,
        error: steps.parse_agent_trigger.error,
      };
    }

    const agentFile = steps.parse_agent_trigger.agent_file;
    const githubUsername = process.env.GITHUB_USERNAME || "bdusape";
    const githubRepo = process.env.GITHUB_REPO || "the-cockpit";
    const githubBranch = process.env.GITHUB_BRANCH || "main";

    const url = `https://raw.githubusercontent.com/${githubUsername}/${githubRepo}/${githubBranch}/agents/${agentFile}.md`;

    console.log("📥 Fetching agent config from:", url);

    try {
      const response = await $.send.http({
        url: url,
        method: "GET",
      });

      if (response.status !== 200) {
        throw new Error(`GitHub returned ${response.status}`);
      }

      const agentConfig = response.body;

      console.log(`✅ Loaded ${agentFile}.md (${agentConfig.length} bytes)`);

      return {
        success: true,
        agent_config: agentConfig,
        agent_file: agentFile,
      };
    } catch (error) {
      console.error("❌ Failed to fetch agent config:", error);

      return {
        success: false,
        error: `Failed to load agent configuration: ${error.message}`,
      };
    }
  },
});

// ==============================================================
// STEP 6: Call Claude API
// ==============================================================
export default defineComponent({
  name: "Call Claude API",
  description: "Sends query to Claude with agent system prompt",
  async run({ steps, $ }) {
    // Handle errors from previous steps
    if (!steps.fetch_agent_configuration.success) {
      console.error("Cannot call Claude - agent config failed");
      return {
        success: false,
        error: steps.fetch_agent_configuration.error,
      };
    }

    if (!steps.parse_agent_trigger.valid) {
      console.error("Cannot call Claude - invalid agent");
      return {
        success: false,
        error: steps.parse_agent_trigger.error,
      };
    }

    const systemPrompt = steps.fetch_agent_configuration.agent_config;
    const userQuery = steps.parse_agent_trigger.query;

    console.log("🧠 Calling Claude API...");
    console.log("Model:", process.env.CLAUDE_MODEL || "claude-sonnet-4-5-20250929");
    console.log("Query:", userQuery.substring(0, 100) + "...");

    try {
      const response = await $.send.http({
        url: "https://api.anthropic.com/v1/messages",
        method: "POST",
        headers: {
          "x-api-key": process.env.CLAUDE_API_KEY,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        data: {
          model: process.env.CLAUDE_MODEL || "claude-sonnet-4-5-20250929",
          max_tokens: parseInt(process.env.CLAUDE_MAX_TOKENS || "4096"),
          system: systemPrompt,
          messages: [
            {
              role: "user",
              content: userQuery,
            },
          ],
        },
      });

      if (response.status !== 200) {
        throw new Error(`Claude API returned ${response.status}: ${JSON.stringify(response.body)}`);
      }

      const claudeResponse = response.body;

      console.log("✅ Claude response received");
      console.log("Tokens used:", claudeResponse.usage.input_tokens + claudeResponse.usage.output_tokens);

      return {
        success: true,
        response_text: claudeResponse.content[0].text,
        usage: claudeResponse.usage,
        model: claudeResponse.model,
      };
    } catch (error) {
      console.error("❌ Claude API error:", error);

      return {
        success: false,
        error: `AI service error: ${error.message}`,
      };
    }
  },
});

// ==============================================================
// STEP 7: Send WhatsApp Response
// ==============================================================
export default defineComponent({
  name: "Send WhatsApp Response",
  description: "Sends Claude's response back to user via WhatsApp",
  async run({ steps, $ }) {
    const userPhone = steps.parse_whatsapp_webhook.from;

    // Determine message to send
    let messageText;

    if (!steps.call_claude_api.success) {
      // Error occurred
      messageText = `⚠️ ${steps.call_claude_api.error}\n\nPlease try again or contact support if the issue persists.`;
    } else {
      // Success - send Claude's response
      messageText = steps.call_claude_api.response_text;
    }

    // WhatsApp has a 4096 character limit per message
    const MAX_LENGTH = 4000; // Leave some buffer
    if (messageText.length > MAX_LENGTH) {
      messageText = messageText.substring(0, MAX_LENGTH) + "\n\n...(message truncated)";
    }

    console.log("📤 Sending WhatsApp message...");
    console.log("To:", userPhone);
    console.log("Length:", messageText.length);

    try {
      const response = await $.send.http({
        url: `https://graph.facebook.com/${process.env.WHATSAPP_API_VERSION}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        data: {
          messaging_product: "whatsapp",
          to: userPhone,
          type: "text",
          text: {
            body: messageText,
          },
        },
      });

      if (response.status !== 200) {
        throw new Error(`WhatsApp API returned ${response.status}`);
      }

      console.log("✅ Message sent successfully");

      return {
        success: true,
        message_id: response.body.messages[0].id,
      };
    } catch (error) {
      console.error("❌ WhatsApp send failed:", error);

      // Retry logic could go here
      return {
        success: false,
        error: error.message,
      };
    }
  },
});

// ==============================================================
// STEP 8: Log Metrics
// ==============================================================
export default defineComponent({
  name: "Log Metrics",
  description: "Logs conversation metrics for monitoring and cost tracking",
  async run({ steps, $ }) {
    const metrics = {
      // Timestamp
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().split("T")[0],

      // User info
      user_phone: steps.parse_whatsapp_webhook.from,

      // Agent info
      agent: steps.parse_agent_trigger.agent,
      agent_valid: steps.parse_agent_trigger.valid,

      // Message info
      query_length: steps.parse_agent_trigger.query?.length || 0,

      // Claude API metrics (if successful)
      claude_success: steps.call_claude_api.success,
      tokens_input: steps.call_claude_api.usage?.input_tokens || 0,
      tokens_output: steps.call_claude_api.usage?.output_tokens || 0,
      tokens_total:
        (steps.call_claude_api.usage?.input_tokens || 0) +
        (steps.call_claude_api.usage?.output_tokens || 0),

      // Cost calculation (claude-sonnet-4-5 pricing: $3 per 1M input, $15 per 1M output)
      cost_input_usd: ((steps.call_claude_api.usage?.input_tokens || 0) * 3) / 1000000,
      cost_output_usd: ((steps.call_claude_api.usage?.output_tokens || 0) * 15) / 1000000,
      cost_total_usd:
        ((steps.call_claude_api.usage?.input_tokens || 0) * 3) / 1000000 +
        ((steps.call_claude_api.usage?.output_tokens || 0) * 15) / 1000000,

      // Response info
      response_length: steps.call_claude_api.response_text?.length || 0,
      whatsapp_success: steps.send_whatsapp_response.success,

      // Status
      status: steps.call_claude_api.success && steps.send_whatsapp_response.success ? "success" : "error",
    };

    // Log to console (viewable in Pipedream execution logs)
    console.log("📊 METRICS:", JSON.stringify(metrics, null, 2));

    // Summary log
    console.log(`
╔════════════════════════════════════════╗
║         CONVERSATION SUMMARY           ║
╚════════════════════════════════════════╝

Agent: ${metrics.agent}
Tokens: ${metrics.tokens_total}
Cost: $${metrics.cost_total_usd.toFixed(4)}
Status: ${metrics.status.toUpperCase()}
    `);

    return metrics;
  },
});
