import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min, ValidateIf } from 'class-validator';

export class UpdateRatingDto {
  @ValidateIf((_object, value) => value !== undefined)
  @IsInt()
  @Min(1)
  @Max(5)
  @ApiPropertyOptional({ type: 'integer', minimum: 1, maximum: 5, example: 4 })
  score?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  @ApiPropertyOptional({ type: String, maxLength: 500, nullable: true, description: 'null을 보내면 후기를 삭제합니다.', example: '다시 봐도 좋았어요.' })
  comment?: string | null;
}
