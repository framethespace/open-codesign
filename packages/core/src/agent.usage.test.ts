import type { AgentMessage } from '@mariozechner/pi-agent-core';
import { describe, expect, it } from 'vitest';
import { sumAssistantUsage } from './agent';

describe('sumAssistantUsage', () => {
  it('aggregates usage across assistant turns and ignores non-assistant messages', () => {
    const messages: AgentMessage[] = [
      { role: 'user', content: 'hi', timestamp: 1 } as AgentMessage,
      {
        role: 'assistant',
        api: 'anthropic-messages' as never,
        provider: 'anthropic' as never,
        model: 'claude-sonnet-4-6',
        content: [{ type: 'text', text: 'draft' }],
        usage: {
          input: 1200,
          output: 800,
          cacheRead: 0,
          cacheWrite: 0,
          totalTokens: 2000,
          cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0.01 },
        },
        stopReason: 'stop',
        timestamp: 2,
      } as AgentMessage,
      {
        role: 'toolResult',
        content: [{ type: 'text', text: 'view output' }],
        timestamp: 3,
      } as AgentMessage,
      {
        role: 'assistant',
        api: 'anthropic-messages' as never,
        provider: 'anthropic' as never,
        model: 'claude-sonnet-4-6',
        content: [{ type: 'text', text: 'final' }],
        usage: {
          input: 500,
          output: 200,
          cacheRead: 0,
          cacheWrite: 0,
          totalTokens: 700,
          cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0.0025 },
        },
        stopReason: 'stop',
        timestamp: 4,
      } as AgentMessage,
    ];

    expect(sumAssistantUsage(messages)).toEqual({
      inputTokens: 1700,
      outputTokens: 1000,
      costUsd: 0.0125,
    });
  });
});
