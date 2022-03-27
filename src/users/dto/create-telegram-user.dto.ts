import { ApiProperty } from '@nestjs/swagger';

export class CreateTelegramUserDto {
  // {
  //   "id": 713404198,
  //   "first_name": "Михаил",
  //   "last_name": "Кокош",
  //   "username": "mileniummi",
  //   "auth_date": 1648419832,
  //   "hash": "d35bc98f2ba54d970ca72beb68081868e3b440bbb916a3f34a6b6ffa7520f3ac"
  // }
  @ApiProperty({ example: '1234', description: 'id в телеграме' })
  readonly id: number;

  @ApiProperty({ example: 'username', description: 'Логин пользователя' })
  readonly username: string;

  @ApiProperty({ example: 'Jane', description: 'Имя пользователя' })
  readonly first_name: string;

  @ApiProperty({ example: 'Doe', description: 'Фамилия пользователя' })
  readonly last_name: string;

  @ApiProperty({ example: '1648419832', description: 'Unix дата авторизации' })
  readonly auth_date: number;

  @ApiProperty({
    example: 'str',
    description: 'Хэш для проверки что данные из телеграмма',
  })
  readonly hash: string;
}
