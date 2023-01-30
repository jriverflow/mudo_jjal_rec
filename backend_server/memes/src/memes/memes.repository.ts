import { Injectable } from '@nestjs/common';
import { readFile, writeFile } from 'fs/promises';

@Injectable()
export class MemesRepository {
  async findOne(id: string) {
    const contents = await readFile('memes.json', 'utf8');
    const memes = JSON.parse(contents);

    return memes[id];
  }

  async findAll() {
    const contents = await readFile('memes.json', 'utf8');
    const memes = JSON.parse(contents);

    return memes;
  }

  async filter(key: string, personName: string) {
    const contents = await readFile('memes.json', 'utf8');
    const memes = JSON.parse(contents);
    let keyFlag = false;
    let personFlag = false;
    const filtered = {};

    Object.entries(memes).forEach(([idx, values]) => {
      Object.entries(values).forEach(([idx2, value]) => {
        if (idx2 == 'key' && value == key) {
          keyFlag = true;
        }
        if (idx2 == 'personName' && value == personName) {
          personFlag = true;
        }
      });

      if (keyFlag === true && personFlag === true) {
        filtered[idx] = values;
      }
      keyFlag = false;
      personFlag = false;
    });

    return filtered;
  }

  async create(
    key: string,
    personName: string,
    path: string,
    subtitle: string,
  ) {
    const contents = await readFile('memes.json', 'utf8');
    const memes = JSON.parse(contents);

    // db에서 임의로 아이디 배정하는 흉내를 냄
    const id = Math.floor(Math.random() * 999);
    memes[id] = { id, key, personName, path, subtitle };

    await writeFile('memes.json', JSON.stringify(memes));
  }
}
