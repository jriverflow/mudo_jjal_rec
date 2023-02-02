import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Meme } from './entities/Meme.entity';
import { MemesController } from './memes.controller';
import { MemesService } from './memes.service';

@Module({
  imports: [TypeOrmModule.forFeature([Meme])],
  controllers: [MemesController],
  providers: [MemesService],
})
export class MemesModule {}
