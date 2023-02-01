import { IsString } from 'class-validator';

export class CreateMemeDto {
  @IsString()
  sent: string;

  @IsString()
  personName: string;

  @IsString()
  path: string;

  @IsString()
  subtitle: string;
}
