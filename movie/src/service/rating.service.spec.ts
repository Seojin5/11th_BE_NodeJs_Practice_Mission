import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { HttpStatus } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Member } from '../entity/member.entity.js';
import { Rating } from '../entity/rating.entity.js';
import { RatingService } from './rating.service.js';

describe('RatingService', () => {
  let service: RatingService;
  const memberRepository = {
    findOneBy: jest.fn<() => Promise<Partial<Member> | null>>(),
  };
  const ratings = {
    findOne: jest.fn<() => Promise<Partial<Rating> | null>>(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };
  const manager = { getRepository: () => ratings };
  const ratingRepository = {
    ...ratings,
    manager: {
      transaction: async <T>(work: (transactionManager: typeof manager) => Promise<T>) =>
        work(manager),
    },
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        RatingService,
        { provide: getRepositoryToken(Member), useValue: memberRepository },
        { provide: getRepositoryToken(Rating), useValue: ratingRepository },
      ],
    }).compile();

    service = module.get(RatingService);
  });

  it('같은 영화에 평점을 중복 등록하면 409 RATING409_1을 반환하고 저장하지 않는다', async () => {
    memberRepository.findOneBy.mockResolvedValue({ memberId: 1 });
    ratings.findOne.mockResolvedValue({ ratingId: 10, movieId: 550 });

    await expect(
      service.create(1, { movieId: 550, score: 4 }),
    ).rejects.toMatchObject({
      status: HttpStatus.CONFLICT,
      code: 'RATING409_1',
    });
    expect(ratings.save).not.toHaveBeenCalled();
  });

  it('다른 회원의 평점을 수정하면 403 RATING403_1을 반환하고 갱신하지 않는다', async () => {
    const owner = Object.assign(new Member(), { memberId: 2 });
    ratings.findOne.mockResolvedValue({
      ratingId: 10,
      member: owner,
      score: 5,
    });

    await expect(service.update(1, 10, { score: 3 })).rejects.toMatchObject({
      status: HttpStatus.FORBIDDEN,
      code: 'RATING403_1',
    });
    expect(ratings.update).not.toHaveBeenCalled();
    expect(ratings.save).not.toHaveBeenCalled();
  });
});
