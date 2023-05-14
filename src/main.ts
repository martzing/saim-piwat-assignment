import { NestFactory } from '@nestjs/core';
import { RestaurantModule } from './restaurant/restaurant.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(RestaurantModule);
  app.use(helmet());
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  const configService = app.get<ConfigService>(ConfigService);
  await app.listen(configService.get<number>('PORT'), '0.0.0.0');
}
bootstrap();
