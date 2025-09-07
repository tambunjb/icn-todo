import { IsString, MinLength } from 'class-validator';

export class SuggestDto {
  @IsString()
  @MinLength(1)
  input!: string;
}