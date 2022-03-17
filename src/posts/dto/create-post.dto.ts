import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({ example: 1, description: 'Текст поста' })
  readonly description: string;
}
