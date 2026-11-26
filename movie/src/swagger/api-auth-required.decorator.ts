import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';

export function ApiAuthRequired() {
  return applyDecorators(
    ApiBearerAuth('bearerAuth'),
    ApiUnauthorizedResponse({
      description:
        'AUTH401_2 · 토큰 누락 / AUTH401_3 · 유효하지 않은 토큰 / AUTH401_4 · 만료된 토큰',
    }),
  );
}
