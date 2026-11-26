import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsString, IsOptional, Max, MaxLength, Min } from 'class-validator';

export class CreateRatingDto {
  @IsInt({ message: '영화 ID는 정수여야 합니다.' })
  @Min(1, { message: '영화 ID는 양수여야 합니다.' })
  @ApiProperty({ description: 'TMDB 영화 ID', type: 'integer', minimum: 1, example: 550 })
  movieId: number;

  @IsInt({ message: '별점은 정수여야 합니다.' })
  @Min(1, { message: '별점은 1점 이상이어야 합니다.' })
  @Max(5, { message: '별점은 5점 이하여야 합니다.' })
  @ApiProperty({ type: 'integer', minimum: 1, maximum: 5, example: 4 })
  score: number;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: '후기는 500자 이하로 입력해주세요.' })
  @ApiPropertyOptional({ type: String, maxLength: 500, nullable: true, example: '재밌게 봤어요.' })
  comment?: string;
}