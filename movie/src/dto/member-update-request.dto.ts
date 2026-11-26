import { ApiProperty } from '@nestjs/swagger';
import { Transform } from "class-transformer";
import { IsNotEmpty, IsString, Length } from "class-validator";

export class MemberUpdateRequestDto {
  @Transform(({ value }) => typeof value === "string" ? value.trim() : value)
  @IsString()
  @IsNotEmpty({ message: "닉네임을 입력해주세요." })
  @Length(2, 12, { message: "닉네임은 2자 이상 12자 이하여야 합니다." })
  @ApiProperty({ minLength: 2, maxLength: 12, example: '영화산책' })
  nickname: string;
}
