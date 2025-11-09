# The Cockpit - Custom Agents Guide

**How to create your own AI agents tailored to your specific needs**

---

## Quick Start

**Time to create a custom agent:** 15-30 minutes

1. Copy the agent template
2. Fill in all sections
3. Add to workflow configuration
4. Commit to GitHub
5. Test with `@youragent`

---

## When to Create a Custom Agent

### Good Use Cases

✅ **Specialized domain expert**
- Example: Real estate analyzer, legal advisor, fitness coach
- Requires deep domain knowledge
- Needs consistent personality

✅ **Workflow-specific assistant**
- Example: Email drafter, meeting prep, investor pitch creator
- Repetitive task you do often
- Benefits from templates/structure

✅ **Personal context expert**
- Example: Your business analyst, product advisor
- Needs knowledge of your specific business/products
- Personalized to your situation

### Not Recommended

❌ **Too similar to existing agent**
- Example: "Publicist 2.0" when publicist already exists
- Better to update existing agent

❌ **Too narrow scope**
- Example: "Tweet generator" when content strategist handles this
- Use existing agent with specific prompts

❌ **Too broad/general**
- Example: "Do anything agent"
- Better to have focused agents

---

## Step 1: Copy the Template

```bash
cd agents/
cp _template.md your-agent-name.md
```

**Naming conventions:**
- Use lowercase
- Use hyphens for spaces: `real-estate-analyzer.md`
- Be specific: `fitness-coach.md` not `helper.md`

---

## Step 2: Fill Out the Template

Open your new file and complete each section:

### Required Sections

#### 1. Agent Name & Title

```markdown
# [Agent Name] Agent - System Instructions
```

**Example:**
```markdown
# Real Estate Analyzer Agent - System Instructions
```

---

#### 2. Role

Define what this agent does in 1-2 sentences.

**Template:**
```markdown
## Role
You are [name]'s [role/title]. Your expertise is in [specific domain/tasks].
```

**Good example:**
```markdown
## Role
You are Brian's real estate investment analyzer. Your expertise is in evaluating
rental properties, calculating ROI, and identifying deal-breakers in listings.
```

**Bad example:**
```markdown
## Role
You help with stuff. (❌ Too vague)
```

---

#### 3. Personality

List 3-5 personality traits that define how the agent communicates.

**Template:**
```markdown
## Personality
- [Trait 1] (e.g., Analytical, data-driven)
- [Trait 2] (e.g., Direct, no fluff)
- [Trait 3] (e.g., Encouraging but realistic)
- [Trait 4] (e.g., Focus on action items)
```

**Good example:**
```markdown
## Personality
- Analytical and data-driven (always cite numbers)
- Direct and concise (no unnecessary fluff)
- Risk-aware (point out potential issues)
- Action-oriented (end with next steps)
```

---

#### 4. Core Responsibilities

List 3-5 main tasks this agent handles.

**Template:**
```markdown
## Core Responsibilities

1. **[Task category]**
   - [Specific task 1]
   - [Specific task 2]

2. **[Task category]**
   - [Specific task 1]
   - [Specific task 2]
```

**Good example:**
```markdown
## Core Responsibilities

1. **Analyze property listings**
   - Calculate monthly cash flow
   - Estimate renovation costs
   - Identify red flags in listings

2. **Compare investment options**
   - Side-by-side property comparisons
   - ROI calculations
   - Risk assessment
```

---

#### 5. Knowledge Base

Provide domain-specific knowledge, formulas, context.

**Template:**
```markdown
## Knowledge Base

**Domain Expertise:**
- [Key concept 1]
- [Key concept 2]
- [Key concept 3]

**Current Context:**
- [Relevant info about your situation]
- [Goals, metrics, constraints]

**Tools/Formulas:**
- [Important calculation or method]
```

**Good example:**
```markdown
## Knowledge Base

**Real Estate Metrics:**
- Cap Rate = (NOI / Property Price) × 100
- Cash-on-Cash Return = (Annual Cash Flow / Total Cash Invested) × 100
- 1% Rule: Monthly rent should be ≥1% of purchase price

**Current Context:**
- Target market: South Jersey (near Philadelphia)
- Budget: $150K-300K per property
- Goal: $500/month positive cash flow per unit
- Strategy: Buy-and-hold rentals

**Deal Killers:**
- Major structural issues (foundation, roof)
- High crime area (check local stats)
- Negative cash flow even with 20% down
```

---

#### 6. Output Format

Specify how the agent should structure responses.

**Template:**
```markdown
## Output Format

When asked to [task], you should:

1. **[Step 1 name]**
   - [What to do]

2. **[Step 2 name]**
   - [What to do]

3. **[Step 3 name]**
   - [What to do]
```

**Good example:**
```markdown
## Output Format

When asked to analyze a property, you should:

1. **Quick Assessment**
   - Pass/Fail verdict upfront
   - One-line reasoning

2. **Key Metrics**
   - Monthly cash flow
   - Cap rate
   - Cash-on-cash return

3. **Red Flags** (if any)
   - List potential issues
   - Severity rating (1-10)

4. **Recommendation**
   - Clear action: "Schedule viewing" or "Pass"
   - Reasoning in 2-3 sentences
```

---

#### 7. Constraints

Define what the agent should NEVER do and what it should ALWAYS do.

**Template:**
```markdown
## Constraints

**Never:**
- [Constraint 1]
- [Constraint 2]
- [Constraint 3]

**Always:**
- [Requirement 1]
- [Requirement 2]
- [Requirement 3]

**Prefer:**
- [Preference 1 over alternative]
- [Preference 2 over alternative]
```

**Good example:**
```markdown
## Constraints

**Never:**
- Recommend deals with negative cash flow
- Ignore major structural issues
- Provide legal or tax advice
- Guarantee returns or appreciation

**Always:**
- Show your calculations
- Point out risks and red flags
- Recommend getting inspections
- End with clear action item

**Prefer:**
- Conservative estimates over optimistic
- Cash flow over appreciation
- Move-in ready over fixer-uppers (unless user requests)
```

---

## Step 3: Add Advanced Sections (Optional)

### Example Interactions

Show the agent how to respond to common queries.

```markdown
## Example Interactions

### Example 1: Property Analysis

**User:** "123 Main St, asking $200K, rent $1,500/mo"

**You:**
"❌ PASS on this one

**Quick Math:**
- Monthly cash flow: -$150 (after mortgage, taxes, insurance)
- Cap rate: 4.2% (below 6% target)
- 1% rule: Fails ($1,500 < $2,000)

**Why it's a pass:**
Negative cash flow even with 20% down. You'd be paying $150/mo out of pocket.

**Action:** Keep looking for properties with rent ≥$2,000 in this price range."
```

### Content Templates

Provide reusable formats for common outputs.

```markdown
## Content Templates

### Template 1: Property Analysis Report

**Property:** [Address]
**Asking Price:** $[price]
**Estimated Rent:** $[rent]

**Metrics:**
- Monthly Cash Flow: $[amount]
- Cap Rate: [X]%
- Cash-on-Cash Return: [Y]%

**Verdict:** [✅ CONSIDER / ⚠️ MAYBE / ❌ PASS]

**Reasoning:** [2-3 sentences]

**Next Step:** [Specific action]
```

---

## Step 4: Add to Workflow

Edit `workflows/pipedream/steps/04-load-agent-config.js`:

```javascript
const agentMap = {
  'publicist': 'publicist.md',
  'growth': 'growth-hacker.md',
  'strategist': 'strategist.md',
  'content': 'content-strategist.md',
  'credit': 'credit-advisor.md',
  // Add your custom agent:
  'realestate': 'real-estate-analyzer.md',  // ← Add this line
};
```

**Trigger format:** `@realestate`

---

## Step 5: Update Configuration

Edit `config/agent-triggers.json`:

```json
{
  "agents": {
    // ... existing agents ...
    "realestate": {
      "trigger": "@realestate",
      "filename": "real-estate-analyzer.md",
      "emoji": "🏠",
      "name": "Real Estate Analyzer",
      "description": "Property investment analysis",
      "useCases": [
        "Property evaluations",
        "ROI calculations",
        "Investment comparisons"
      ],
      "active": true
    }
  }
}
```

---

## Step 6: Commit and Deploy

```bash
# Add files
git add agents/real-estate-analyzer.md
git add workflows/pipedream/steps/04-load-agent-config.js
git add config/agent-triggers.json

# Commit
git commit -m "Add real estate analyzer agent"

# Push
git push origin main
```

**Important:** Update the workflow in Pipedream by copying the new agent map code.

---

## Step 7: Test Your Agent

Send test messages:

```
@realestate
→ Should activate agent

@realestate 123 Main St, $200K, rent $1,500
→ Should analyze the property

@realestate compare property A vs property B
→ Should provide comparison
```

---

## Best Practices

### ✅ Do This

1. **Be specific about domain knowledge**
   - Include formulas, metrics, frameworks
   - Add relevant context about your situation

2. **Define clear output structure**
   - Use templates
   - Consistent formatting
   - Clear action items

3. **Set boundaries**
   - What agent should/shouldn't do
   - When to defer to experts

4. **Test thoroughly**
   - Try 5-10 different queries
   - Verify responses are consistent
   - Check against your expectations

5. **Iterate and improve**
   - Update based on actual usage
   - Add examples of good/bad responses
   - Refine personality over time

### ❌ Avoid This

1. **Vague instructions**
   - "Be helpful" (too generic)
   - "Do marketing stuff" (unclear scope)

2. **Contradictory constraints**
   - "Be concise" + "Provide detailed analysis"
   - Pick one priority

3. **Too much knowledge**
   - Agents don't need your life story
   - Focus on relevant context only

4. **Unclear output format**
   - No structure = inconsistent responses
   - Always provide templates

---

## Advanced: Multi-Step Workflows

For complex tasks, define step-by-step workflows:

```markdown
## Workflow: Property Investment Decision

**Step 1: Initial Screen**
- User provides property details
- Agent calculates basic metrics
- Pass/fail based on criteria

**Step 2: Deep Dive** (if pass)
- Ask for additional details
- Research area (Phase 2: web search)
- Calculate detailed projections

**Step 3: Comparison** (optional)
- Compare with other properties
- Rank options
- Recommend top choice

**Step 4: Action Plan**
- Viewing schedule
- Due diligence checklist
- Financing options
```

---

## Advanced: Context Management

### Personal Context Section

Keep agent updated with your current situation:

```markdown
## Current Context (Update Weekly)

**This Week's Focus:**
- Evaluating 3 properties in Camden area
- Budget: $200K max
- Goal: Close on first property by Dec 2025

**Recent Learnings:**
- Properties in X neighborhood appreciate faster
- Learned to factor in HOA fees (often hidden)
- New lending option available: 10% down at 5.5%

**Updated Criteria:**
- Minimum 6% cap rate (increased from 5%)
- Max 30-min drive from my location
- Prefer 2-3 unit multifamily
```

---

## Example: Complete Custom Agent

See `agents/_template.md` for a full example with all sections filled out.

**Real-world examples:**
- `agents/publicist.md` - Content creation & PR
- `agents/strategist.md` - Business decisions
- `agents/growth-hacker.md` - Marketing tactics

---

## Sharing Your Agents

### Open Source Your Agent

1. Fork The Cockpit repo
2. Add your agent to `agents/`
3. Submit a pull request
4. Share with the community!

### Keep It Private

If your agent contains sensitive info:
- Keep repo private
- Or use a separate private repo for agents
- Update `GITHUB_USERNAME` and `GITHUB_REPO` env vars

---

## Agent Ideas

### For Founders
- **Investor Pitch Coach** - Help prepare for investor meetings
- **Product Prioritizer** - Evaluate feature requests
- **Pricing Strategist** - Optimize pricing models
- **Hiring Interviewer** - Prepare interview questions

### For Content Creators
- **Hook Generator** - Create engaging opening lines
- **Video Editor** - Suggest cuts and transitions
- **Thumbnail Tester** - Critique thumbnail designs
- **Sponsorship Negotiator** - Draft sponsorship terms

### For Professionals
- **Email Composer** - Draft professional emails
- **Meeting Prep** - Agenda and talking points
- **Slide Reviewer** - Feedback on presentations
- **Research Summarizer** - Condense papers/articles

---

## Troubleshooting Custom Agents

### Agent doesn't activate

**Check:**
1. Filename matches in agent map
2. Trigger is lowercase in workflow code
3. GitHub URL is correct (test in browser)
4. Workflow updated in Pipedream (not just Git)

### Agent gives generic responses

**Fix:**
1. Add more specific instructions
2. Include examples of good responses
3. Define output templates
4. Add domain knowledge/context

### Agent is too verbose

**Fix:**
```markdown
## Constraints

**Always:**
- Keep responses under 300 words
- Use bullet points over paragraphs
- Lead with the conclusion
- Cut unnecessary details
```

### Agent doesn't follow instructions

**Fix:**
1. Make instructions more explicit
2. Add "Never" constraints
3. Provide counter-examples
4. Test with edge cases

---

## Maintenance

### Weekly Updates

- Update "Current Context" section
- Add new examples based on usage
- Refine personality traits

### Monthly Reviews

- Review all responses, note patterns
- Optimize output templates
- Add frequently asked questions

### Quarterly Overhauls

- Major context updates
- Restructure if scope changed
- Consider splitting into multiple agents

---

## FAQs

### Can I have multiple versions of an agent?

Yes! Example:
- `publicist-twitter.md` - Twitter-focused
- `publicist-linkedin.md` - LinkedIn-focused
- `publicist-email.md` - Email announcements

Add separate triggers: `@twitter`, `@linkedin`, `@email`

### How long should agent files be?

**Ideal:** 300-800 lines
**Max:** ~1,000 lines (larger = slower + more tokens)

If your agent file is huge, split into multiple agents.

### Can agents reference other agents?

Not in Phase 1. Phase 3 will support agent collaboration:
```
@strategist @publicist work together on launch plan
```

### Can I use the same agent trigger for different use cases?

No. Each trigger maps to one agent file. Instead:
- Make agent flexible with clear instructions
- Or create separate agents with different triggers

---

## Resources

**Templates:**
- `agents/_template.md` - Blank template
- `agents/publicist.md` - Full example

**Tools:**
- ChatGPT - Help draft agent instructions
- Claude - Test agent responses before deploying

**Inspiration:**
- OpenAI Custom GPTs marketplace
- Character.AI personalities
- Notion AI templates

---

## Next Steps

1. **Start simple:** Create one custom agent
2. **Test thoroughly:** Try 10+ queries
3. **Iterate:** Update based on usage
4. **Share:** Open a PR if it's useful to others!

---

**Questions?** Open an issue on GitHub or check the [FAQ](FAQ.md).

---

**Last Updated:** 2025-11-09
**Version:** 1.0.0
