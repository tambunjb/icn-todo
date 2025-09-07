import { AiController } from './ai.controller';
import { AiService } from './ai.service';

// We unit-test the controller by calling its method directly.
// This bypasses guards (isolation) and focuses on controller logic/shape.

describe('AiController', () => {
  const mockAi: jest.Mocked<Pick<AiService, 'suggest'>> = {
    suggest: jest.fn(),
  };

  let controller: AiController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new AiController(mockAi as unknown as AiService);
  });

  it('returns { suggestions, user } and passes input to service', async () => {
    const req = { user: { sub: 'user-123' } };
    const dto = { input: 'give tips' } as any;

    mockAi.suggest.mockResolvedValueOnce(['s1', 's2', 's3']);

    const res = await controller.suggest(req, dto);

    expect(mockAi.suggest).toHaveBeenCalledWith('give tips');
    expect(res).toEqual({ suggestions: ['s1', 's2', 's3'], user: 'user-123' });
  });
});