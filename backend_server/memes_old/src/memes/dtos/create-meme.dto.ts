import { IsString } from 'class-validator';

export class CreateMemeDto {
  // id가 여기 없는 이유는 나중에 db에서 생성할 것이기 때문

  // key는 여러개가 있을 수 있으니까
  @IsString()
  key: string;

  @IsString()
  personName: string;

  @IsString()
  path: string;

  @IsString()
  subtitle: string;
}
