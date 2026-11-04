import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';

describe('MemberController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/members/nickname/:nickname (GET)', () => {
    return request(app.getHttpServer())
      .get('/members/nickname/mission-probe')
      .expect(200)
      .expect((response) => {
        expect(typeof response.body.available).toBe('boolean');
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
