import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { SuggestDto } from './suggest.dto';

/**
 * Helper: validate a plain object against SuggestDto.
 * We don't spin up Nest or use ValidationPipe—pure class-validator -> isolation.
 */
async function validateSuggest(input: unknown) {
  const dto = plainToInstance(SuggestDto, input);
  return validate(dto);
}

describe('SuggestDto', () => {
  it('accepts a minimal valid payload (input length = 1)', async () => {
    const errors = await validateSuggest({ input: 'a' });
    expect(errors).toHaveLength(0);
  });

  it('accepts a typical valid payload', async () => {
    const errors = await validateSuggest({ input: 'get ideas for planning my day' });
    expect(errors).toHaveLength(0);
  });

  it('rejects when input is missing', async () => {
    // @ts-expect-error testing runtime invalid payload
    const errors = await validateSuggest({});
    expect(errors).toHaveLength(1);
    const e = errors[0];
    expect(e.property).toBe('input');
    // Should fail IsString and MinLength (property is undefined)
    const constraints = e.constraints ?? {};
    expect(Object.keys(constraints)).toEqual(
      expect.arrayContaining(['isString', 'minLength']),
    );
  });

  it('rejects when input is an empty string', async () => {
    const errors = await validateSuggest({ input: '' });
    expect(errors).toHaveLength(1);
    const constraints = errors[0].constraints ?? {};
    expect(constraints).toHaveProperty('minLength'); // MinLength(1) must fail
  });

  it('rejects non-string types (number)', async () => {
    // @ts-expect-error testing runtime invalid payload
    const errors = await validateSuggest({ input: 123 });
    expect(errors).toHaveLength(1);
    const constraints = errors[0].constraints ?? {};
    expect(constraints).toHaveProperty('isString');
  });

  it('rejects non-string types (object)', async () => {
    const errors = await validateSuggest({ input: { text: 'hi' } as any });
    expect(errors).toHaveLength(1);
    const constraints = errors[0].constraints ?? {};
    expect(constraints).toHaveProperty('isString');
  });

  it('treats whitespace as valid (length check does not trim)', async () => {
    // MinLength(1) counts raw chars; if you want to forbid spaces-only, add a Trim + custom check.
    const errors = await validateSuggest({ input: ' ' });
    expect(errors).toHaveLength(0);
  });
});