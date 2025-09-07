import { InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiService } from './ai.service';

// --- Define the module mock in-place to avoid hoisting issues ---
jest.mock('openai', () => {
  const createMock = jest.fn();
  const OpenAIMock = jest.fn().mockImplementation(() => ({
    responses: { create: createMock },
  }));
  // expose internals so tests can access them
  return {
    __esModule: true,
    default: OpenAIMock,
    __mocks: { createMock, OpenAIMock },
  };
});

// Pull the exposed mocks *after* jest.mock is processed.
const { __mocks } = jest.requireMock('openai') as any;
const createMock: jest.Mock = __mocks.createMock;
const openAiCtorMock: jest.Mock = __mocks.OpenAIMock;

// --- Mock ConfigService safely ---
const cfgGet = jest.fn();
const mockCfg = { get: cfgGet as unknown as ConfigService['get'] } as ConfigService;

describe('AiService', () => {
  let service: AiService;

  beforeEach(() => {
    jest.clearAllMocks();
    cfgGet.mockImplementation((key: string) => {
      if (key === 'OPENAI_API_KEY') return 'sk-test';
      if (key === 'OPENAI_MODEL') return 'unit-test-model';
      return undefined;
    });
    service = new AiService(mockCfg);
  });

  it('constructs OpenAI client with API key and uses configured model', async () => {
    const suggestions = ['A', 'B', 'C'];
    createMock.mockResolvedValueOnce({
      output_text: JSON.stringify({ suggestions }),
    });

    const out = await service.suggest('hello');

    expect(openAiCtorMock).toHaveBeenCalledWith({ apiKey: 'sk-test' });
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({ model: 'unit-test-model' }),
    );
    expect(out).toEqual(suggestions);
  });

  it('trims input and returns exactly 3 suggestions', async () => {
    createMock.mockResolvedValueOnce({
      output_text: JSON.stringify({ suggestions: ['one', 'two', 'three'] }),
    });

    const out = await service.suggest('   something to suggest   ');
    expect(out).toEqual(['one', 'two', 'three']);

    const args = createMock.mock.calls[0][0];
    expect(Array.isArray(args.input)).toBe(true);
    expect(args.input[0]).toHaveProperty('role', 'system');
    expect(args.input[1]).toEqual({ role: 'user', content: 'something to suggest' });
  });

  it('throws when JSON shape is wrong (not exactly 3)', async () => {
    createMock.mockResolvedValueOnce({
      output_text: JSON.stringify({ suggestions: ['only', 'two'] }),
    });

    await expect(service.suggest('x')).rejects.toBeInstanceOf(InternalServerErrorException);
  });

  it('throws when JSON is invalid', async () => {
    createMock.mockResolvedValueOnce({ output_text: 'not-json' });
    await expect(service.suggest('x')).rejects.toBeInstanceOf(InternalServerErrorException);
  });

  it('throws when suggestions contain non-strings', async () => {
    createMock.mockResolvedValueOnce({
      output_text: JSON.stringify({ suggestions: ['ok', 2, 'ok'] }),
    });
    await expect(service.suggest('x')).rejects.toBeInstanceOf(InternalServerErrorException);
  });

  it('wraps provider error in InternalServerErrorException', async () => {
    createMock.mockRejectedValueOnce(new Error('provider down'));
    await expect(service.suggest('x')).rejects.toBeInstanceOf(InternalServerErrorException);
  });

  it('uses default model when OPENAI_MODEL not set', async () => {
    cfgGet.mockImplementation((key: string) => {
      if (key === 'OPENAI_API_KEY') return 'sk-test';
      if (key === 'OPENAI_MODEL') return undefined; // force default
      return undefined;
    });
    const s = new AiService(mockCfg);

    createMock.mockResolvedValueOnce({
      output_text: JSON.stringify({ suggestions: ['a', 'b', 'c'] }),
    });

    await s.suggest('input');
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({ model: 'gpt-4o-mini' }),
    );
  });
});