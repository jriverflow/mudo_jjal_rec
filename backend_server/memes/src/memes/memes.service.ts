import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMemeDto } from './dtos/create-meme.dto';
import { FilterMemeDto } from './dtos/filter-meme.dto';
import { RecommendMemeDto } from './dtos/recommend-meme.dto';
import { Meme } from './entities/Meme.entity';

@Injectable()
export class MemesService {
  constructor(
    @InjectRepository(Meme) private repo: Repository<Meme>,
    private readonly httpService: HttpService,
  ) {
    this.repo = repo;
  }

  async findOne(id: number) {
    if (!id) {
      return null;
    }
    return await this.repo.findOneBy({ id });
  }

  findAll() {
    return this.repo.find();
  }

  async createMeme(meme: CreateMemeDto) {
    await this.repo.save(meme);
  }

  async filterMeme({ keyword, personName }: FilterMemeDto) {
    return await this.repo.find({
      where: { keyword, personName },
    });
  }

  async recommendMeme(sentence: RecommendMemeDto) {
    return this.httpService.post('http://localhost:8000/recommend', sentence);
  }

  async getRecMeme(taskId: string) {
    return this.httpService.get(
      `http://localhost:8000/recommend/result/${taskId}`,
    );
  }
}
