import { Injectable } from '@nestjs/common';
import { MemesRepository } from './memes.repository';

@Injectable()
export class MemesService {
  constructor(public memesRepo: MemesRepository) {}

  findOne(id: string) {
    return this.memesRepo.findOne(id);
  }

  findAll() {
    return this.memesRepo.findAll();
  }

  filter(key: string, personName: string) {
    return this.memesRepo.filter(key, personName);
  }

  // 나중에 이거 클래스를 만들어서 클래스를 받게 수정해야할 것 같음
  create(key: string, personName: string, path: string, subtitle: string) {
    return this.memesRepo.create(key, personName, path, subtitle);
  }
}
