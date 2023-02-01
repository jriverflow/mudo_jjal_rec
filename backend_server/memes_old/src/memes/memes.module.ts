import { Module } from '@nestjs/common';
import { MemesController } from './memes.controller';
import { MemesRepository } from './memes.repository';
import { MemesService } from './memes.service';

@Module({
  controllers: [MemesController],
  providers: [MemesService, MemesRepository],
})
export class MemesModule {}
