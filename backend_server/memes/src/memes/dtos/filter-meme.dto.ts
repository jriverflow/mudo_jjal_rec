import { IsString } from 'class-validator';

export class FilterMemeDto {
  @IsString()
  keyword: string;

  @IsString()
  personName: string;
}
