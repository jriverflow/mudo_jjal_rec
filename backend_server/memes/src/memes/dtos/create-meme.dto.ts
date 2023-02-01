import { IsString } from 'class-validator';

export class CreateMemeDTO {
  @IsString()
  key: string;

  @IsString()
  personName: string;

  @IsString()
  path: string;

  @IsString()
  subtitle: string;
}
