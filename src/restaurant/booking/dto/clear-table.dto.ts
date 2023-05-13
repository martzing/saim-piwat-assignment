import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';

export class ClearTableDto {
  @IsNotEmpty()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  table_ids: number[];
}
