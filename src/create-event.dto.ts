import { IsDateString, IsString, Length } from 'class-validator';

export class CreateEventDto {
  @Length(5, 255, { message: 'name must have a length between [5,25]' })
  name: string;

  @IsString()
  @Length(5, 255)
  description: string;

  @IsDateString()
  when: string;

  @Length(5, 255, { groups: ['create'] })
  @Length(10, 20, { groups: ['update'] })
  address: string;
}
