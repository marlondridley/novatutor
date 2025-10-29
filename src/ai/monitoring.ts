/**
 * AI Usage Monitoring and Cost Tracking
 */

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cacheHitTokens?: number; // DeepSeek context cache
  cacheMissTokens?: number;
}

export interface UsageRecord {
  userId: string;
  flow: string;
  model: string;
  tokensUsed: TokenUsage;
  cost: number;
  timestamp: Date;
  requestId?: string;
  success: boolean;
  errorCode?: string;
}

/**
 * Calculate cost based on model and token usage
 */
export function calculateCost(model: string, usage: TokenUsage): number {
  // DeepSeek pricing (per million tokens)
  const DEEPSEEK_PRICING = {
    input: 0.14, // $0.14 per 1M tokens (cache miss)
    output: 0.28, // $0.28 per 1M tokens
    cacheHit: 0.014, // $0.014 per 1M tokens (90% discount)
  };

  // OpenAI pricing (per million tokens)
  const OPENAI_PRICING = {
    'gpt-4': { input: 30.0, output: 60.0 },
    'gpt-4-turbo': { input: 10.0, output: 30.0 },
    'gpt-3.5-turbo': { input: 0.5, output: 1.5 },
  };

  if (model.includes('deepseek')) {
    const inputCost =
      ((usage.cacheMissTokens || usage.promptTokens) / 1_000_000) * DEEPSEEK_PRICING.input;
    const cacheHitCost =
      ((usage.cacheHitTokens || 0) / 1_000_000) * DEEPSEEK_PRICING.cacheHit;
    const outputCost = (usage.completionTokens / 1_000_000) * DEEPSEEK_PRICING.output;

    return inputCost + cacheHitCost + outputCost;
  }

  if (model.includes('gpt')) {
    const pricing = OPENAI_PRICING[model as keyof typeof OPENAI_PRICING] || OPENAI_PRICING['gpt-3.5-turbo'];
    const inputCost = (usage.promptTokens / 1_000_000) * pricing.input;
    const outputCost = (usage.completionTokens / 1_000_000) * pricing.output;

    return inputCost + outputCost;
  }

  // Default fallback
  return (usage.totalTokens / 1_000_000) * 0.5;
}

/**
 * Track API usage (in-memory for now, can be replaced with database)
 */
class UsageTracker {
  private records: UsageRecord[] = [];
  private readonly MAX_RECORDS = 10000;

  /**
   * Record a usage event
   */
  async record(record: UsageRecord): Promise<void> {
    this.records.push(record);

    // Keep only recent records to prevent memory issues
    if (this.records.length > this.MAX_RECORDS) {
      this.records = this.records.slice(-this.MAX_RECORDS);
    }

    // Log expensive requests
    if (record.cost > 0.01) {
      console.log(`💰 High-cost request: $${record.cost.toFixed(4)} | Flow: ${record.flow} | User: ${record.userId}`);
    }

    // TODO: In production, save to database
    // await db.usage.create({ data: record });
  }

  /**
   * Get usage for a specific user
   */
  getUserUsage(userId: string, since?: Date): UsageRecord[] {
    return this.records.filter(
      (r) => r.userId === userId && (!since || r.timestamp >= since)
    );
  }

  /**
   * Get total cost for a user in a time period
   */
  getUserCost(userId: string, since?: Date): number {
    const records = this.getUserUsage(userId, since);
    return records.reduce((sum, r) => sum + r.cost, 0);
  }

  /**
   * Get monthly usage for a user
   */
  getMonthlyUsage(userId: string): number {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    return this.getUserCost(userId, monthStart);
  }

  /**
   * Check if user exceeds budget
   */
  async checkBudget(userId: string, monthlyLimit: number): Promise<{
    exceeded: boolean;
    usage: number;
    limit: number;
    percentage: number;
  }> {
    const usage = this.getMonthlyUsage(userId);
    const percentage = (usage / monthlyLimit) * 100;

    if (percentage >= 100) {
      console.warn(`⚠️ User ${userId} exceeded monthly budget: $${usage.toFixed(2)} / $${monthlyLimit}`);
    } else if (percentage >= 80) {
      console.warn(`⚠️ User ${userId} approaching budget limit: ${percentage.toFixed(0)}% used`);
    }

    return {
      exceeded: usage >= monthlyLimit,
      usage,
      limit: monthlyLimit,
      percentage,
    };
  }

  /**
   * Get usage statistics
   */
  getStatistics(): {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    totalCost: number;
    averageCost: number;
    topFlows: Array<{ flow: string; count: number; cost: number }>;
  } {
    const totalRequests = this.records.length;
    const successfulRequests = this.records.filter((r) => r.success).length;
    const failedRequests = totalRequests - successfulRequests;
    const totalCost = this.records.reduce((sum, r) => sum + r.cost, 0);
    const averageCost = totalRequests > 0 ? totalCost / totalRequests : 0;

    // Calculate flow statistics
    const flowStats = new Map<string, { count: number; cost: number }>();
    for (const record of this.records) {
      const existing = flowStats.get(record.flow) || { count: 0, cost: 0 };
      flowStats.set(record.flow, {
        count: existing.count + 1,
        cost: existing.cost + record.cost,
      });
    }

    const topFlows = Array.from(flowStats.entries())
      .map(([flow, stats]) => ({ flow, ...stats }))
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 10);

    return {
      totalRequests,
      successfulRequests,
      failedRequests,
      totalCost,
      averageCost,
      topFlows,
    };
  }
}

// Singleton instance
export const usageTracker = new UsageTracker();

/**
 * Middleware to track token usage
 */
export async function trackTokenUsage(
  userId: string,
  flow: string,
  model: string,
  usage: TokenUsage,
  success: boolean = true,
  errorCode?: string
): Promise<void> {
  const cost = calculateCost(model, usage);

  await usageTracker.record({
    userId,
    flow,
    model,
    tokensUsed: usage,
    cost,
    timestamp: new Date(),
    success,
    errorCode,
  });
}

/**
 * Extract token usage from OpenAI/DeepSeek response
 */
export function extractTokenUsage(response: any): TokenUsage {
  const usage = response.usage;

  if (!usage) {
    return {
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
    };
  }

  return {
    promptTokens: usage.prompt_tokens || 0,
    completionTokens: usage.completion_tokens || 0,
    totalTokens: usage.total_tokens || 0,
    cacheHitTokens: usage.prompt_cache_hit_tokens,
    cacheMissTokens: usage.prompt_cache_miss_tokens,
  };
}

/**
 * User budget limits (can be customized per user tier)
 */
export const BUDGET_LIMITS = {
  FREE: 5.0, // $5/month
  STUDENT: 20.0, // $20/month
  PREMIUM: 100.0, // $100/month
  UNLIMITED: Infinity,
};

/**
 * Alert thresholds
 */
export const ALERT_THRESHOLDS = {
  WARNING: 0.8, // 80% of budget
  CRITICAL: 0.95, // 95% of budget
};

