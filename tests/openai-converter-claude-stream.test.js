import { OpenAIConverter } from '../src/converters/strategies/OpenAIConverter.js';

describe('OpenAIConverter Claude stream conversion', () => {
    let converter;

    beforeEach(() => {
        converter = new OpenAIConverter();
    });

    test('should emit message_start and content_block_start when first chunk has content but no role', () => {
        const openaiChunk = {
            id: 'chatcmpl-test-1',
            model: 'qwen3-max',
            choices: [
                {
                    index: 0,
                    delta: {
                        content: 'Hello'
                    },
                    finish_reason: null
                }
            ]
        };

        const events = converter.toClaudeStreamChunk(openaiChunk, 'qwen3-max');

        expect(Array.isArray(events)).toBe(true);
        expect(events.map(e => e.type)).toEqual([
            'message_start',
            'content_block_start',
            'content_block_delta'
        ]);
        expect(events[2].delta.type).toBe('text_delta');
        expect(events[2].delta.text).toBe('Hello');
    });

    test('should emit complete stop sequence when finish_reason arrives', () => {
        const firstChunk = {
            id: 'chatcmpl-test-2',
            model: 'qwen3-max',
            choices: [
                {
                    index: 0,
                    delta: {
                        content: 'Hi'
                    },
                    finish_reason: null
                }
            ]
        };

        const finishChunk = {
            id: 'chatcmpl-test-2',
            model: 'qwen3-max',
            usage: {
                prompt_tokens: 10,
                completion_tokens: 5
            },
            choices: [
                {
                    index: 0,
                    delta: {},
                    finish_reason: 'stop'
                }
            ]
        };

        converter.toClaudeStreamChunk(firstChunk, 'qwen3-max');
        const finishEvents = converter.toClaudeStreamChunk(finishChunk, 'qwen3-max');

        expect(finishEvents.map(e => e.type)).toEqual([
            'content_block_stop',
            'message_delta',
            'message_stop'
        ]);
        expect(finishEvents[1].delta.stop_reason).toBe('end_turn');
    });
});
