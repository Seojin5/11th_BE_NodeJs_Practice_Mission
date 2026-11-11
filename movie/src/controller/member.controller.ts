import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Req, UseGuards } from "@nestjs/common";
import { MemberService } from "../service/member.service.js";
import { CreateMemberDto } from "../dto/create-member.dto.js";
import type { Request } from "express";
import { ApiException } from "../exception/api.exception.js";
import { AuthGuard } from "../guard/auth.guard.js";

@Controller("members")
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Get("me")
  @UseGuards(AuthGuard)
  async getMyInfo(@Req() request: Request & { memberId?: number }) {
    const memberId = request.memberId;
    if (memberId === undefined || !Number.isSafeInteger(memberId) || memberId < 1) {
      throw new ApiException(
        HttpStatus.UNAUTHORIZED,
        "AUTH401_3",
        "유효하지 않은 토큰입니다.",
      );
    }

    const result = await this.memberService.getMyInfo(memberId);
    return {
      isSuccess: true,
      code: "COMMON200",
      message: "회원 정보를 조회했습니다.",
      result,
    };
  }

  @Get("nickname/:nickname")
  checkNickname(@Param("nickname") nickname: string) {
    return this.memberService.checkNickname(nickname);
  }

  @Get("email/:email")
  checkEmail(@Param("email") email: string) {
    return this.memberService.checkEmail(email);
  }

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