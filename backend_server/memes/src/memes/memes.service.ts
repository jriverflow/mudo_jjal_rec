import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMemeDto } from './dtos/create-meme.dto';
import { FilterMemeDto } from './dtos/filter-meme.dto';
import { RecommendMemeDto } from './dtos/recommend-meme.dto';
import { Meme } from './entities/Meme.entity';
import { catchError, firstValueFrom, lastValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

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

  async filterMeme({ keyword }: FilterMemeDto) {
    const sentence = { sentence: keyword };
    const res = this.httpService
      .post('http://localhost:8000/recommend', sentence)
      .pipe(
        catchError((err: AxiosError) => {
          console.log(err.response.data);
          throw 'An error accurred';
        }),
      );
    const { data } = await lastValueFrom(res);
    const taskId = data.task_id;

    let recommendations = [];
    let results = [];

    while (true) {
      const current = this.httpService
        .get(`http://localhost:8000/recommend/result/${taskId}`)
        .pipe(
          catchError((err: AxiosError) => {
            console.log(err.response.data);
            throw 'An error accurred';
          }),
        );

      const { data } = await lastValueFrom(current);
      console.log('I am in a while loop');

      if (data.status == 'Success') {
        recommendations = data.recommendations;
        break;
      }

      await sleep(2000);
    }

    const promises = recommendations.map(async (element) => {
      const path = element.file_name;
      const emo_concord = element.emotion_concord;

      const found = await this.repo.find({
        where: { path },
      });

      const result = {};
      found.forEach((data) => {
        result['id'] = data.id;
        result['path'] = data.path;
        result['subtitle'] = data.subtitle;
        result['personName'] = String(data.personName).split('/');
      });
      result['emotion_concord'] = emo_concord;

      results.push(result);
    });
    await Promise.all(promises);

    return Object.assign({ memes: results });
  }

  async recommendMeme(sentence: RecommendMemeDto) {
    const res = this.httpService
      .post('http://localhost:8000/recommend', sentence)
      .pipe(
        catchError((err: AxiosError) => {
          console.log(err.response.data);
          throw 'An error accurred';
        }),
      );
    const header = await firstValueFrom(res);
    const { data } = await lastValueFrom(res);

    return Object.assign({ status_code: header.status }, data);
  }

  async getRecMeme(taskId: string) {
    const res = this.httpService
      .get(`http://localhost:8000/recommend/result/${taskId}`)
      .pipe(
        catchError((err: AxiosError) => {
          console.log(err.response.data);
          throw 'An error accurred';
        }),
      );
    const header = await firstValueFrom(res);
    const { data } = await lastValueFrom(res);

    return Object.assign({ status_code: header.status }, data);
  }
}
