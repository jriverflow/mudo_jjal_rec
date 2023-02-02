import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Meme } from './memes/entities/Meme.entity';
import { MemesModule } from './memes/memes.module';
import { MemesController } from './memes/memes.controller';
import { MemesService } from './memes/memes.service';
const dbConfig = require('../ormconfig.js');

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: ['.env'] }),
    MemesModule,
    Meme,
    TypeOrmModule.forFeature([Meme]),
    TypeOrmModule.forRoot(dbConfig),
  ],
  controllers: [AppController, MemesController],
  providers: [AppService, MemesService],
})
export class AppModule {}
