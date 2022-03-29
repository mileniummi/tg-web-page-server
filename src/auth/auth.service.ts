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
import { createHash, createHmac } from 'crypto';

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
    return { tgToken: newUser.tgUUID, ...(await this.generateToken(newUser)) };
  }

  async loginTelegram(dto) {
    console.log(dto);
    const secret = createHash('sha256')
      .update(process.env.TELEGRAM_BOT_TOKEN)
      .digest();

    function checkSignature({ hash, ...data }) {
      const checkString = Object.keys(data)
        .sort()
        .map((k) => `${k}=${data[k]}`)
        .join('\n');
      const hmac = createHmac('sha256', secret)
        .update(checkString)
        .digest('hex');
      return hmac === hash;
    }
    if (!checkSignature(dto)) {
      throw new HttpException(
        'Вероятно ваши данные не из телеграмма',
        HttpStatus.BAD_REQUEST,
      );
    }
    const user = await this.usersService.getUserByTgChatID(dto.id);
    if (user) {
      return await this.generateToken(user);
    }
    const userProps = {
      username: dto.username,
      firstName: dto.first_name,
      lastName: dto.last_name,
      password: dto.hash,
      tgChatID: dto.id,
    };
    const newUser = await this.usersService.createUser(userProps);
    return await this.generateToken(newUser);
  }

  private async generateToken(user: User) {
    const payload = {
      username: user.username,
      id: user.id,
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
