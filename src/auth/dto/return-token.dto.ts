import { ApiProperty } from '@nestjs/swagger';

export class ReturnTokenDto {
  @ApiProperty({
    example: 'str',
    description: 'токен для авторизации в телеграм боте',
  })
  readonly tgToken: string;
  @ApiProperty({
    example: 'str',
    description: 'Токен авторизованного пользователя',
  })
  readonly token: string;
}
