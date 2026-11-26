import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginRequestDto } from '../dto/login-request.dto.js';
import { LoginRateLimitGuard } from '../guard/login-rate-limit.guard.js';
import { AuthService } from '../service/auth.service.js';

@ApiTags('인증')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: '로그인하고 액세스 토큰을 발급받습니다 · 토큰 불필요' })
  @ApiResponse({ status: 200, description: 'COMMON200 · 로그인 성공' })
  @ApiResponse({ status: 400, description: 'COMMON400 · 요청 값이 올바르지 않습니다.' })
  @ApiResponse({ status: 401, description: 'AUTH401_1 · 이메일 또는 비밀번호가 올바르지 않습니다.' })
  @ApiResponse({ status: 429, description: 'COMMON429 · 로그인 요청 제한을 초과했습니다.' })
  @Post('login')
  @UseGuards(LoginRateLimitGuard)
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginRequestDto) {
    return {
      isSuccess: true,
      code: 'COMMON200',
      message: '로그인에 성공했습니다.',
      result: await this.authService.login(dto),
    };
  }
}