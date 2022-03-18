import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/users.model';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}
  async login(dto: CreateUserDto) {
    const user = await this.validateUser(dto);
    return { tgToken: user.tgUUID, ...(await this.generateToken(user)) };
  }

  async registration(dto: CreateUserDto) {
    const user = await this.usersService.getUsersByUsername(dto.username);
    if (user) {
      throw new HttpException(
        'Пользователь с таким логином уже существует',
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashedPassword = await bcrypt.hash(dto.password, 3);
    const newUser = await this.usersService.createUser({
      ...dto,
      password: hashedPassword,
    });
    return { tgToken: user.tgUUID, ...(await this.generateToken(newUser)) };
  }

  private async generateToken(user: User) {
    const payload = {
      username: user.username,
      id: user.id,
      tgUUID: user.tgUUID,
    };
    return {
      token: this.jwtService.sign(payload),
    };
  }

  private async validateUser(dto: CreateUserDto) {
    const user = await this.usersService.getUsersByUsername(dto.username);
    if (user) {
      const passwordsEquals = await bcrypt.compare(dto.password, user.password);
      if (passwordsEquals) {
        return user;
      }
    }
    throw new UnauthorizedException({
      message: 'Неправильный логин или пароль',
    });
  }
}
