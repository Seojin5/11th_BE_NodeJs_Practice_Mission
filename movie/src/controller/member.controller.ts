import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiAuthRequired } from '../swagger/api-auth-required.decorator.js';
import { MemberService } from "../service/member.service.js";
import { CreateMemberDto } from "../dto/create-member.dto.js";
import { MemberUpdateRequestDto } from "../dto/member-update-request.dto.js";
import type { Request } from "express";
import { ApiException } from "../exception/api.exception.js";
import { AuthGuard } from "../guard/auth.guard.js";

@ApiTags('회원')
@Controller("members")
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @ApiOperation({ summary: '내 회원 정보를 조회합니다 · 토큰 필요' })
  @ApiAuthRequired()
  @ApiResponse({ status: 200, description: 'COMMON200 · 회원 정보 조회 성공' })
  @ApiResponse({ status: 404, description: 'MEMBER404_1 · 해당 회원을 찾을 수 없습니다.' })
  @Get("me")
  @UseGuards(AuthGuard)
  async getMyInfo(@Req() request: Request & { memberId?: number }) {
    const result = await this.memberService.getMyInfo(this.getRequestMemberId(request));
    return {
      isSuccess: true,
      code: "COMMON200",
      message: "회원 정보를 조회했습니다.",
      result,
    };
  }

  @ApiOperation({ summary: '내 닉네임을 수정합니다 · 토큰 필요' })
  @ApiAuthRequired()
  @ApiResponse({ status: 200, description: 'COMMON200 · 회원 정보 수정 성공' })
  @ApiResponse({ status: 400, description: 'COMMON400 · 요청 값이 올바르지 않습니다.' })
  @ApiResponse({ status: 404, description: 'MEMBER404_1 · 해당 회원을 찾을 수 없습니다.' })
  @ApiResponse({ status: 409, description: 'MEMBER409_1 · 이미 사용 중인 닉네임입니다.' })
  @Patch("me")
  @UseGuards(AuthGuard)
  async updateMyInfo(
    @Req() request: Request & { memberId?: number },
    @Body() dto: MemberUpdateRequestDto,
  ) {
    const result = await this.memberService.updateMyInfo(
      this.getRequestMemberId(request),
      dto,
    );
    return {
      isSuccess: true,
      code: "COMMON200",
      message: "회원 정보를 수정했습니다.",
      result,
    };
  }

  private getRequestMemberId(request: Request & { memberId?: number }): number {
    const memberId = request.memberId;
    if (memberId === undefined || !Number.isSafeInteger(memberId) || memberId < 1) {
      throw new ApiException(
        HttpStatus.UNAUTHORIZED,
        "AUTH401_3",
        "유효하지 않은 토큰입니다.",
      );
    }
    return memberId;
  }

  @ApiOperation({ summary: '닉네임 사용 가능 여부를 확인합니다 · 토큰 불필요' })
  @ApiResponse({ status: 200, description: '닉네임 사용 가능 여부' })
  @Get("nickname/:nickname")
  checkNickname(@Param("nickname") nickname: string) {
    return this.memberService.checkNickname(nickname);
  }

  @ApiOperation({ summary: '이메일 사용 가능 여부를 확인합니다 · 토큰 불필요' })
  @ApiResponse({ status: 200, description: '이메일 사용 가능 여부' })
  @Get("email/:email")
  checkEmail(@Param("email") email: string) {
    return this.memberService.checkEmail(email);
  }

  @ApiOperation({ summary: '새 회원을 등록합니다 · 토큰 불필요' })
  @ApiResponse({ status: 201, description: 'COMMON201 · 회원가입 성공' })
  @ApiResponse({ status: 400, description: 'COMMON400 · 요청 값이 올바르지 않습니다.' })
  @ApiResponse({ status: 409, description: 'MEMBER4091 · 중복 이메일 / MEMBER4092 · 중복 닉네임' })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async signUp(@Body() dto: CreateMemberDto) {
    const result = await this.memberService.signUp(dto);
    return {
      isSuccess: true,
      code: "COMMON201",
      message: "회원가입에 성공했습니다.",
      result,
    };
  }
}