import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMemeDto } from './dtos/create-meme.dto';
import { FilterMemeDto } from './dtos/filter-meme.dto';
import { Meme } from './entities/Meme.entity';

@Injectable()
export class MemesService {
  constructor(@InjectRepository(Meme) private repo: Repository<Meme>) {
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

  async filterMeme({ sent, personName }: FilterMemeDto) {
    return await this.repo.find({
      where: { sent, personName },
    });
  }
}
