import { IsString } from 'class-validator';

export class RecommendMemeDto {
  @IsString()
  sentence: string;
}
