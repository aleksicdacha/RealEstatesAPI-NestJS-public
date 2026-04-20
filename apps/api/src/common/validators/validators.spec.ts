import { validate } from 'class-validator';
import { IsImmutable } from './is-immutable.validator';
import { IsValidSearchField } from './search-field.validator';

class TestImmutableDto {
  @IsImmutable({ message: 'Field is immutable' })
  immutableField?: string;
}

class TestSearchFieldDto {
  @IsValidSearchField(['code', 'name', 'address'])
  searchField: string;
}

describe('IsImmutable', () => {
  it('passes when value is undefined', async () => {
    const dto = new TestImmutableDto();
    dto.immutableField = undefined;
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('passes when value is not set', async () => {
    const dto = new TestImmutableDto();
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('fails when value is a string', async () => {
    const dto = new TestImmutableDto();
    dto.immutableField = 'some value';
    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('isImmutable');
  });

  it('passes when value is null', async () => {
    const dto = new TestImmutableDto();
    dto.immutableField = null;
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });
});

describe('IsValidSearchField', () => {
  it('passes for allowed field', async () => {
    const dto = new TestSearchFieldDto();
    dto.searchField = 'code';
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('passes for another allowed field', async () => {
    const dto = new TestSearchFieldDto();
    dto.searchField = 'address';
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('fails for disallowed field', async () => {
    const dto = new TestSearchFieldDto();
    dto.searchField = 'password';
    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('isValidSearchField');
  });

  it('fails for SQL injection attempt', async () => {
    const dto = new TestSearchFieldDto();
    dto.searchField = 'code; DROP TABLE users;--';
    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
  });

  it('error message lists allowed fields', async () => {
    const dto = new TestSearchFieldDto();
    dto.searchField = 'invalid';
    const errors = await validate(dto);
    expect(errors[0].constraints.isValidSearchField).toContain('code');
    expect(errors[0].constraints.isValidSearchField).toContain('name');
  });
});
