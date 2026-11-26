import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiAuthRequired } from '../swagger/api-auth-required.decorator.js';
import type { Request } from 'express';
import { CreateFavoriteDto } from '../dto/create-favorite.dto.js';
import { ApiException } from '../exception/api.exception.js';
import { AuthGuard } from '../guard/auth.guard.js';
import { FavoriteService } from '../service/favorite.service.js';

@ApiTags('즐겨찾기')
@ApiAuthRequired()
@Controller('favorites')
@UseGuards(AuthGuard)
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  @ApiOperation({ summary: '영화를 즐겨찾기에 등록합니다 · 토큰 필요' })
  @ApiResponse({ status: 201, description: 'COMMON201 · 즐겨찾기 등록 성공' })
  @ApiResponse({ status: 400, description: 'COMMON400 · 요청 값이 올바르지 않습니다.' })
  @ApiResponse({ status: 404, description: 'MEMBER404_1 · 해당 회원을 찾을 수 없습니다.' })
  @ApiResponse({ status: 409, description: 'FAVORITE409_1 · 같은 영화를 이미 즐겨찾기했습니다.' })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Req() request: Request & { memberId?: number }, @Body() dto: CreateFavoriteDto) {
    const memberId = this.getRequestMemberId(request);
    const result = await this.favoriteService.create(memberId, dto);

    return {
      isSuccess: true,
      code: 'COMMON201',
      message: '즐겨찾기를 등록했습니다.',
      result,
    };
  }

  @ApiOperation({ summary: '내 즐겨찾기 목록을 조회합니다 · 토큰 필요' })
  @ApiResponse({ status: 200, description: 'COMMON200 · 즐겨찾기 목록 조회 성공' })
  @Get()
  @HttpCode(HttpStatus.OK)
  async getMyFavorites(@Req() request: Request & { memberId?: number }) {
    const memberId = this.getRequestMemberId(request);
    const result = await this.favoriteService.getMyFavorites(memberId);

    return {
      isSuccess: true,
      code: 'COMMON200',
      message: '내 즐겨찾기 목록을 조회했습니다.',
      result,
    };
  }

  @ApiOperation({ summary: '이 영화의 즐겨찾기 여부를 조회합니다 · 토큰 필요' })
  @ApiResponse({ status: 200, description: 'COMMON200 · 미등록 상태는 isFavorite: false' })
  @ApiResponse({ status: 400, description: 'COMMON400 · 요청 값이 올바르지 않습니다.' })
  @Get(':movieId')
  @HttpCode(HttpStatus.OK)
  async getStatus(
    @Req() request: Request & { memberId?: number },
    @Param('movieId', ParseIntPipe) movieId: number,
  ) {
    const memberId = this.getRequestMemberId(request);
    const result = await this.favoriteService.getStatus(memberId, movieId);

    return {
      isSuccess: true,
      code: 'COMMON200',
      message: '즐겨찾기 여부를 조회했습니다.',
      result,
    };
  }

  @ApiOperation({ summary: '영화를 내 즐겨찾기에서 해제합니다 · 토큰 필요' })
  @ApiResponse({ status: 200, description: 'COMMON200 · 즐겨찾기 해제 성공' })
  @ApiResponse({ status: 400, description: 'COMMON400 · 요청 값이 올바르지 않습니다.' })
  @ApiResponse({ status: 404, description: 'FAVORITE404_1 · 해제할 즐겨찾기가 없습니다.' })
  @Delete(':movieId')
  @HttpCode(HttpStatus.OK)
  async delete(
    @Req() request: Request & { memberId?: number },
    @Param('movieId', ParseIntPipe) movieId: number,
  ) {
    const memberId = this.getRequestMemberId(request);
    await this.favoriteService.delete(memberId, movieId);

    return {
      isSuccess: true,
      code: 'COMMON200',
      message: '즐겨찾기를 해제했습니다.',
      result: null,
    };
  }
  private getRequestMemberId(request: Request & { memberId?: number }): number {
    const memberId = request.memberId;
    if (memberId === undefined || !Number.isSafeInteger(memberId) || memberId < 1) {
      throw new ApiException(
        HttpStatus.UNAUTHORIZED,
        'AUTH401_3',
        '유효하지 않은 토큰입니다.',
      );
    }
    return memberId;
  }
}
