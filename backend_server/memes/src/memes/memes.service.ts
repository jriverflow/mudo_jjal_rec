import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMemeDTO } from './dtos/create-meme.dto';
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

  async createMeme(meme: CreateMemeDTO) {
    await this.repo.save(meme);
  }

  async filterMeme(key: string, personName: string) {
    return await this.repo.find({
      where: { key, personName },
    });
    // .createQueryBuilder()
    // .select('meme')
    // .where('key = :key', { key })
    // .andWhere('personName = :personName', { personName })
    // .getMany();
  }
}
