import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './users.model';
import { CreateTelegramUserDto } from './dto/create-telegram-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User) private usersRepository: typeof User) {}
  async createUser(dto: CreateUserDto | CreateTelegramUserDto) {
    return await this.usersRepository.create(dto);
  }

  async getUserInfo(id: number) {
    const user = await this.usersRepository.findOne({
      where: { id },
      attributes: [
        'username',
        'firstName',
        'lastName',
        'photoUrl',
        'createdAt',
      ],
    });
    return user ? user : {};
  }

  async getUsersByUsername(username: string) {
    return await this.usersRepository.findOne({
      where: { username },
      include: { all: true },
    });
  }

  async getUserByTgUUID(tgUUID: string) {
    return await this.usersRepository.findOne({
      where: { tgUUID },
      include: { all: true },
    });
  }
  async getUserByTgChatID(tgChatID: number) {
    return await this.usersRepository.findOne({
      where: { tgChatID },
      attributes: ['id', 'username'],
    });
  }

  async getUserIDByTgChatID(tgChatID: number) {
    return await this.usersRepository.findOne({
      where: { tgChatID },
      attributes: ['id'],
    });
  }

  async addUserTgChatID(user: User, tgChatID: number) {
    return await this.usersRepository.update(
      { tgChatID },
      { where: { id: user.id } },
    );
  }
  async removeUserChatID(tgChatID: number) {
    return await this.usersRepository.update(
      { tgChatID: null },
      { where: { tgChatID } },
    );
  }
}
