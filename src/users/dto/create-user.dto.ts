import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'username', description: 'Логин пользователя' })
  readonly username: string;

  @ApiProperty({ example: 's123', description: 'Пароль пользователя' })
  readonly password: string;
}
