import { IsString } from 'class-validator';

export class FilterMemeDto {
  @IsString()
  sent: string;

  @IsString()
  personName: string;
}
