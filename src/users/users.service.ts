import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './users.model';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User) private usersRepository: typeof User) {}
  async createUser(dto: CreateUserDto) {
    return await this.usersRepository.create(dto);
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
  async getUserIDByTgChatID(tgChatID: string) {
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
}
