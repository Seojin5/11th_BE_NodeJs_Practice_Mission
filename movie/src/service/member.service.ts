import { BadRequestException, ConflictException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Member } from "../entity/member.entity.js";
import { CheckResponseDto } from "../dto/check-response.dto.js";
import { CreateMemberDto } from "../dto/create-member.dto.js";
import { MemberInfoResponseDto } from "../dto/member-info-response.dto.js";
import { ApiException } from "../exception/api.exception.js";
import * as bcrypt from "bcrypt";

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
  ) {}

  async checkNickname(nickname: string): Promise<CheckResponseDto> {
    const exists = await this.memberRepository.exists({
      where: { nickname },
    });
    return { available: !exists };
  }

  async checkEmail(email: string): Promise<CheckResponseDto> {
    const exists = await this.memberRepository.exists({ where: { email } });
    return { available: !exists };
  }

  async getMyInfo(memberId: number): Promise<MemberInfoResponseDto> {
    const member = await this.memberRepository.findOneBy({ memberId });

    if (!member) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        "MEMBER404_1",
        "해당 회원을 찾을 수 없습니다.",
      );
    }

    return MemberInfoResponseDto.from(member);
  }

  async signUp(dto: CreateMemberDto) {
    if (Buffer.byteLength(dto.password, 'utf8') > 72) {
      throw new BadRequestException('비밀번호는 UTF-8 기준 72바이트 이하여야 합니다.');
    }
    const existingEmail = await this.memberRepository.findOneBy({ email: dto.email });
    if (existingEmail) {
      throw new ConflictException({ code: 'MEMBER4091', message: '이미 사용 중인 이메일입니다.' });
    }

    const existingNickname = await this.memberRepository.findOneBy({ nickname: dto.nickname });
    if (existingNickname) {
      throw new ConflictException({ code: 'MEMBER4092', message: '이미 사용 중인 닉네임입니다.' });
    }

    const savedMember = await this.memberRepository.save(
      this.memberRepository.create({
        email: dto.email,
        password: await bcrypt.hash(dto.password, 10),
        nickname: dto.nickname,
      }),
    );

    return {
      memberId: savedMember.memberId,
      email: savedMember.email,
      nickname: savedMember.nickname,
    };
  }
}