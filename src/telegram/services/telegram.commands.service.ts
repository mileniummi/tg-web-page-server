import { Injectable } from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { PostsService } from '../../posts/posts.service';
import { InlineKeyboardButton } from 'node-telegram-bot-api';

@Injectable()
export class TelegramCommandsService {
  constructor(
    private userService: UsersService,
    private postsService: PostsService,
  ) {}

  async handleStart(command, tgChatID) {
    const userUUID = this.extractUserUUID(command);
    if (userUUID !== null) {
      const user = await this.userService.getUserByTgUUID(userUUID);
      if (user !== null) {
        if (await this.userService.getUserIDByTgChatID(tgChatID)) {
          await this.userService.removeUserChatID(tgChatID);
        }
        await this.userService.addUserTgChatID(user, tgChatID);
        return 'Привет, добавляй свои посты в чат этого бота чтобы они появились на странице www.website.com';
      } else {
        return 'Что то пошло не так... Попробуй перейти по ссылке для бота в личном кабинете еще раз';
      }
    }
    return 'Эта команда предназначена для начала работы с ботом';
  }
  async handlePosts(tgChatID) {
    const user = await this.userService.getUserIDByTgChatID(tgChatID);
    const posts = await this.postsService.getAllPosts(user);
    const postsDescriptionArray = posts.map((post) => {
      return `\tID: ${post.id}, описание: ${post.description}\n`;
    });
    let postDescription = '';
    postsDescriptionArray.forEach((description) => {
      postDescription += description;
    });
    if (postDescription === '') {
      return 'У тебя пока нет ни одного поста';
    }
    return `Список всех твоих постов:\n${postDescription}`;
  }
  async handleDelete(tgChatID) {
    const user = await this.userService.getUserIDByTgChatID(tgChatID);
    const posts = await this.postsService.getAllPosts(user);
    const postsIDs = posts.map((post) => {
      return post.id;
    });
    if (postsIDs.length === 0) {
      return { message: 'У тебя пока нет ни одного поста', options: {} };
    }
    const options = await this.generateButtonsToDeletePost(postsIDs);
    return { message: 'Выбери ID поста для удаления', options };
  }

  private async generateButtonsToDeletePost(postsIDs: Array<number>) {
    const inline_keyboard = [];
    let counter = 0;
    let row: Array<InlineKeyboardButton> = [];
    postsIDs.forEach((id) => {
      row.push({ text: '' + id, callback_data: '' + id });
      if (counter < 3) {
        counter++;
      } else {
        inline_keyboard.push(row);
        row = [];
        counter = 0;
      }
    });
    inline_keyboard.push(row);
    return { reply_markup: { inline_keyboard } };
  }

  private extractUserUUID = (text: string) => {
    if (text.split(' ').length > 1) {
      return text.split(' ')[1];
    }
    return null;
  };
}
