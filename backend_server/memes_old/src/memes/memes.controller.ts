import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  NotFoundException,
  Req,
} from '@nestjs/common';
import { CreateMemeDto } from './dtos/create-meme.dto';
import { MemesService } from './memes.service';

@Controller('/memes')
export class MemesController {
  constructor(public memesService: MemesService) {}

  @Get()
  listMemes() {
    return this.memesService.findAll();
  }

  @Get('/search')
  filteredMemes(
    @Query('key') key: string,
    @Query('personName') personName: string,
  ) {
    return this.memesService.filter(key, personName);
  }

  @Post()
  createMemes(@Body() body: CreateMemeDto) {
    return this.memesService.create(
      body.key,
      body.personName,
      body.path,
      body.subtitle,
    );
  }

  @Get('/:id')
  async getMemes(@Param('id') id: string) {
    const meme = await this.memesService.findOne(id);

    if (!meme) {
      throw new NotFoundException('meme not found');
    }
    return meme;
  }

  // @Post('/predict')
  // predict(@Req request: Request) {
  //   request('http://localhost:5000/predict')
  // }
}
