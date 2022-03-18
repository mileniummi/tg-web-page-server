import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({ example: 1, description: 'Текст поста' })
  readonly description: string;

  @ApiProperty({ example: 'image.png', description: 'Сылка на фто поста' })
  readonly photoLink: string;
}
