import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Meme {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  keyword: string;

  @Column()
  personName: string;

  @Column()
  path: string;

  @Column('text')
  subtitle: string;
}
