import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { CreateMemeDTO } from './dtos/create-meme.dto';
import { Meme } from './entities/Meme.entity';
import { MemesService } from './memes.service';

@Controller('memes')
export class MemesController {
  constructor(private memesService: MemesService) {}

  @Get()
  findAll(): Promise<Meme[]> {
    return this.memesService.findAll();
  }

  @Get('/:id')
  async findOne(@Param() id: string): Promise<Meme> {
    const meme = await this.memesService.findOne(parseInt(id));

    if (!meme) {
      throw new NotFoundException('짤을 찾을 수 없습니다.');
    }

    return meme;
  }

  @Post()
  async createMeme(@Body() body: CreateMemeDTO) {
    const meme = await this.memesService.createMeme(body);

    console.log(meme);
    return meme;
  }

  @Get('/search')
  async filterMeme(
    @Query() key: string,
    @Query() personName: string,
  ): Promise<Meme[]> {
    return await this.memesService.filterMeme(key, personName);
  }
}
