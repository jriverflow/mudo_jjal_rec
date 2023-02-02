import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { CreateMemeDto } from './dtos/create-meme.dto';
import { FilterMemeDto } from './dtos/filter-meme.dto';
import { Meme } from './entities/Meme.entity';
import { MemesService } from './memes.service';

@Controller('memes')
export class MemesController {
  constructor(private memesService: MemesService) {}

  @Get()
  findAll(): Promise<Meme[]> {
    return this.memesService.findAll();
  }

  @Get('/search')
  async filterMeme(@Query() query: FilterMemeDto) {
    console.log(query);

    return await this.memesService.filterMeme(query);
  }

  @Get('/:id')
  async findOne(@Param('id') id: string): Promise<Meme> {
    const meme = await this.memesService.findOne(parseInt(id));

    if (!meme) {
      throw new NotFoundException('짤을 찾을 수 없습니다.');
    }

    return meme;
  }

  @Post()
  async createMeme(@Body() body: CreateMemeDto) {
    const meme = await this.memesService.createMeme(body);

    return meme;
  }
}
