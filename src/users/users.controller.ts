import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Пользователи')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @ApiOperation({ summary: 'Получение информации о пользователе' })
  @ApiResponse({
    status: 200,
    description:
      'обьект с полями имя, фамилия, ссылка на фото, дата создания или пустой обьект если такого пользователя нет',
  })
  @Get('/:id')
  async getUserInfo(@Param('id') id: number) {
    return await this.usersService.getUserInfo(id);
  }
}
