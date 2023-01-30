import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MemesModule } from './memes/memes.module';

async function bootstrap() {
  const app = await NestFactory.create(MemesModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}
bootstrap();
