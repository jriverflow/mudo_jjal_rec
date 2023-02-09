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
    const res = this.httpService
      .post('http://localhost:8000/recommend', keyword)
      .pipe(
        catchError((err: AxiosError) => {
          console.log(err.response.data);
          throw 'An error accurred';
        }),
      );
    const { data } = await lastValueFrom(res);
    const taskId = data.task_id;

    let recommendations = [];

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

      if (data.status == 'Success') {
        recommendations = data.recommendations;
        break;
      }

      await sleep(5000);
    }

    recommendations.forEach((element) => {
      const path = element.file_name;
      console.log(
        this.repo.find({
          where: { path },
        }),
      );
    });
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
