import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiAuthRequired } from '../swagger/api-auth-required.decorator.js';
import type { Request } from 'express';
import { CreateMovieRecordDto } from '../dto/create-movie-record.dto.js';
import { ApiException } from '../exception/api.exception.js';
import { AuthGuard } from '../guard/auth.guard.js';
import { MovieRecordService } from '../service/movie-record.service.js';

@ApiTags('영화 기록')
@ApiAuthRequired()
@Controller('movie-records')
@UseGuards(AuthGuard)
export class MovieRecordController {
  constructor(private readonly movieRecordService: MovieRecordService) {}

  @ApiOperation({ summary: '평점과 선택한 즐겨찾기를 한 번에 저장합니다 · 토큰 필요' })
  @ApiResponse({ status: 201, description: 'COMMON201 · 영화 기록 저장 성공' })
  @ApiResponse({ status: 400, description: 'COMMON400 · 요청 값이 올바르지 않습니다.' })
  @ApiResponse({ status: 404, description: 'MEMBER404_1 · 해당 회원을 찾을 수 없습니다.' })
  @ApiResponse({ status: 409, description: 'RATING409_1 · 중복 평점 / FAVORITE409_1 · 중복 즐겨찾기' })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Req() request: Request & { memberId?: number },
    @Body() dto: CreateMovieRecordDto,
  ) {
    const memberId = request.memberId;
    if (memberId === undefined || !Number.isSafeInteger(memberId) || memberId < 1) {
      throw new ApiException(
        HttpStatus.UNAUTHORIZED,
        'AUTH401_3',
        '유효하지 않은 토큰입니다.',
      );
    }

    return {
      isSuccess: true,
      code: 'COMMON201',
      message: '영화 기록을 저장했습니다.',
      result: await this.movieRecordService.create(memberId, dto),
    };
  }
}
