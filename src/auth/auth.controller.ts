import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthService } from './auth.service';
import { ReturnTokenDto } from './dto/return-token.dto';

@ApiTags('Авторизация')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Войти по учетной записи' })
  @ApiResponse({ status: 200, type: ReturnTokenDto })
  @ApiResponse({ status: 401, description: 'Неправильный логин или пароль' })
  @Post('/login')
  login(@Body() dto: CreateUserDto) {
    return this.authService.login(dto);
  }

  @ApiOperation({ summary: 'Создать учетную запись' })
  @ApiResponse({ status: 200, type: ReturnTokenDto })
  @ApiResponse({
    status: 400,
    description: 'Пользователь с таким логином уже существует',
  })
  @Post('/registration')
  registration(@Body() dto: CreateUserDto) {
    return this.authService.registration(dto);
  }

  @ApiOperation({ summary: 'Войти по учетной записи телеграм' })
  @ApiResponse({ status: 200, description: 'Возврашает токен пользователя' })
  @ApiResponse({
    status: 401,
    description: 'Вероятно ваши данные не из телеграмма',
  })
  @Post('/login/telegram')
  loginTelegram(@Body() dto) {
    return this.authService.loginTelegram(dto);
  }
}
