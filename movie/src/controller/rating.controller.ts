import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiAuthRequired } from '../swagger/api-auth-required.decorator.js';
import { CreateRatingDto } from '../dto/create-rating.dto.js';
import { UpdateRatingDto } from '../dto/update-rating.dto.js';
import { RatingService } from '../service/rating.service.js';

import type { Request } from 'express';
import { ApiException } from '../exception/api.exception.js';
import { AuthGuard } from '../guard/auth.guard.js';

@ApiTags('평점')
@Controller()
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @ApiOperation({ summary: '회원의 평점 목록을 조회합니다 · 토큰 불필요' })
  @ApiResponse({ status: 200, description: '회원의 평점 목록' })
  @ApiResponse({ status: 400, description: 'COMMON400 · 요청 값이 올바르지 않습니다.' })
  @ApiResponse({ status: 404, description: 'MEMBER404_1 · 해당 회원을 찾을 수 없습니다.' })
  @Get('members/:memberId/ratings')
  getMemberRatings(@Param('memberId', ParseIntPipe) memberId: number) {
    return this.ratingService.getRatingsByMember(memberId);
  }

  @ApiOperation({ summary: '영화에 평점을 등록합니다 · 토큰 필요' })
  @ApiAuthRequired()
  @ApiResponse({ status: 201, description: 'COMMON201 · 평점 등록 성공' })
  @ApiResponse({ status: 400, description: 'COMMON400 · 요청 값이 올바르지 않습니다.' })
  @ApiResponse({ status: 404, description: 'MEMBER404_1 · 해당 회원을 찾을 수 없습니다.' })
  @ApiResponse({ status: 409, description: 'RATING409_1 · 같은 영화에 이미 평점을 남겼습니다.' })
  @Post('ratings')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Req() request: Request & { memberId?: number },
    @Body() dto: CreateRatingDto,
  ) {
    const result = await this.ratingService.create(
      this.getRequestMemberId(request),
      dto,
    );
    return {
      isSuccess: true,
      code: 'COMMON201',
      message: '평점을 등록했습니다.',
      result,
    };
  }

  @ApiOperation({ summary: '내 평점의 별점 또는 후기를 수정합니다 · 토큰 필요' })
  @ApiAuthRequired()
  @ApiResponse({ status: 200, description: 'COMMON200 · 평점 수정 성공' })
  @ApiResponse({ status: 400, description: 'COMMON400 · 요청 값이 올바르지 않습니다.' })
  @ApiResponse({ status: 403, description: 'RATING403_1 · 작성자만 수정하거나 삭제할 수 있습니다.' })
  @ApiResponse({ status: 404, description: 'RATING404_1 · 해당 평점을 찾을 수 없습니다.' })
  @Patch('ratings/:ratingId')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async update(
    @Req() request: Request & { memberId?: number },
    @Param('ratingId') ratingId: string,
    @Body() dto: UpdateRatingDto,
  ) {
    const result = await this.ratingService.update(
      this.getRequestMemberId(request),
      this.parseRatingId(ratingId),
      dto,
    );
    return {
      isSuccess: true,
      code: 'COMMON200',
      message: '평점을 수정했습니다.',
      result,
    };
  }

  @ApiOperation({ summary: '내 평점을 삭제합니다 · 토큰 필요' })
  @ApiAuthRequired()
  @ApiResponse({ status: 200, description: 'COMMON200 · 평점 삭제 성공' })
  @ApiResponse({ status: 400, description: 'COMMON400 · 요청 값이 올바르지 않습니다.' })
  @ApiResponse({ status: 403, description: 'RATING403_1 · 작성자만 수정하거나 삭제할 수 있습니다.' })
  @ApiResponse({ status: 404, description: 'RATING404_1 · 해당 평점을 찾을 수 없습니다.' })
  @Delete('ratings/:ratingId')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async delete(
    @Req() request: Request & { memberId?: number },
    @Param('ratingId') ratingId: string,
  ) {
    await this.ratingService.delete(
      this.getRequestMemberId(request),
      this.parseRatingId(ratingId),
    );
    return {
      isSuccess: true,
      code: 'COMMON200',
      message: '평점을 삭제했습니다.',
      result: null,
    };
  }

  private parseRatingId(value: string): number {
    const ratingId = Number(value);
    if (
      !/^\d+$/.test(value) ||
      !Number.isSafeInteger(ratingId) ||
      ratingId < 1
    ) {
      throw new BadRequestException(
        '평점 ID는 안전한 범위의 양의 정수여야 합니다.',
      );
    }
    return ratingId;
  }

  private getRequestMemberId(request: Request & { memberId?: number }): number {
    const memberId = request.memberId;
    if (
      memberId === undefined ||
      !Number.isSafeInteger(memberId) ||
      memberId < 1
    ) {
      throw new ApiException(
        HttpStatus.UNAUTHORIZED,
        'AUTH401_3',
        '유효하지 않은 토큰입니다.',
      );
    }
    return memberId;
  }
}