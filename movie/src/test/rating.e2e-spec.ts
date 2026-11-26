import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { ValidationPipe, type INestApplication } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import request from 'supertest';
import { DataSource, type Repository } from 'typeorm';
import { RatingController } from '../controller/rating.controller.js';
import { Member } from '../entity/member.entity.js';
import { Rating } from '../entity/rating.entity.js';
import { HttpExceptionFilter } from '../filter/http-exception.filter.js';
import { RatingService } from '../service/rating.service.js';

describe('평점 API (통합 테스트)', () => {
  let app: INestApplication;
  let ratings: Repository<Rating>;
  let memberId: number;
  let accessToken: string;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqljs',
          autoSave: false,
          entities: [Member, Rating],
          synchronize: false,
          retryAttempts: 1,
        }),
        TypeOrmModule.forFeature([Member, Rating]),
        JwtModule.register({
          global: true,
          secret: 'rating-e2e-test-only-secret',
          signOptions: { expiresIn: 3600 },
        }),
      ],
      controllers: [RatingController],
      providers: [RatingService],
    }).compile();

    app = module.createNestApplication();
    const db = module.get(DataSource);
    // SQLite는 자동 증가 기본 키 타입을 INTEGER로 선언해야 합니다.
    for (const entity of [Member, Rating]) {
      for (const column of db.getMetadata(entity).primaryColumns) {
        if (column.isGenerated && column.generationStrategy === 'increment') {
          column.type = 'integer';
        }
      }
    }
    await db.synchronize();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();

    const member = await db.getRepository(Member).save({
      nickname: '평점테스트',
      email: 'rating-e2e@example.com',
      password: 'unused-in-rating-test',
    });
    ratings = db.getRepository(Rating);
    memberId = member.memberId;
    accessToken = await module.get(JwtService).signAsync({
      sub: String(memberId),
      email: member.email,
    });
  });

  afterAll(async () => {
    await app?.close();
  });

  it('토큰 없이 POST /ratings를 호출하면 401 AUTH401_2를 반환하고 저장하지 않는다', async () => {
    const response = await request(app.getHttpServer())
      .post('/ratings')
      .send({ movieId: 550, score: 4 })
      .expect(401);

    expect(response.body).toMatchObject({
      isSuccess: false,
      code: 'AUTH401_2',
    });
    expect(await ratings.countBy({ movieId: 550 })).toBe(0);
  });

  it('Bearer 토큰으로 POST /ratings를 호출하면 201 COMMON201을 반환하고 본인 평점을 저장한다', async () => {
    const response = await request(app.getHttpServer())
      .post('/ratings')
      .set('Authorization', 'Bearer ' + accessToken)
      .send({ movieId: 155, score: 5, comment: '다시 보고 싶은 영화' })
      .expect(201);

    expect(response.body).toMatchObject({
      isSuccess: true,
      code: 'COMMON201',
      result: { movieId: '155', score: 5, comment: '다시 보고 싶은 영화' },
    });
    const saved = await ratings.findOne({
      where: { movieId: 155, member: { memberId } },
      relations: { member: true },
    });
    expect(saved).toMatchObject({ score: 5, member: { memberId } });
    expect(saved?.ratingId).toBe(response.body.result.ratingId);
  });
});
