import { Injectable } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';
import { UsersService } from '../users/users.service';
import { PostsService } from '../posts/posts.service';

@Injectable()
export class TelegramService {
  private readonly botInstance: TelegramBot;

  constructor(
    private userService: UsersService,
    private postsService: PostsService,
  ) {
    this.botInstance = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
      polling: true,
    });
    this.initUserMessageObserver();
  }

  private initUserMessageObserver() {
    this.botInstance.on('message', async (message) => {
      console.log(message);
      if (message.text !== undefined) {
        if (message.text.startsWith('/')) {
          await this.handleCommand(message.text, message.chat.id);
        }
      }
    });
  }

  private async handleCommand(command: string, tgChatID) {
    if (command.startsWith('/start')) {
      const userUUID = this.extractUserUUID(command);
      if (userUUID !== null) {
        const user = await this.userService.getUserByTgUUID(userUUID);
        if (user !== null) {
          await this.userService.addUserTgChatID(user, tgChatID);
          return this.botInstance.sendMessage(
            tgChatID,
            'Привет, добавляй свои посты в чат этого бота чтобы они появились на странице www.website.com',
          );
        } else {
          return await this.botInstance.sendMessage(
            tgChatID,
            'Что то пошло не так... Попробуй перейти по ссылке для бота в личном кабинете еще раз',
          );
        }
      } else {
        return await this.botInstance.sendMessage(
          tgChatID,
          'Эта команда предназначена для инициализации работы с ботом',
        );
      }
    } else {
      switch (command) {
        case '/posts':
          const user = await this.userService.getUserIDByTgChatID(tgChatID);
          const posts = await this.postsService.getAllPosts(user);
          const postsDescriptionArray = posts.map((post) => {
            return `\tid: ${post.id}, описание: ${post.description}\n`;
          });
          let postDescription = '';
          postsDescriptionArray.forEach((description) => {
            postDescription += description;
          });
          if (postDescription === '') {
            return await this.botInstance.sendMessage(
              tgChatID,
              'У Вас пока нет ни одного поста',
            );
          }
          return await this.botInstance.sendMessage(
            tgChatID,
            `Список всех ваших постов:\n${postDescription}`,
          );
        case '/delete':
          return false;
      }
    }
  }

  private extractUserUUID = (text: string) => {
    if (text.split(' ').length > 1) {
      return text.split(' ')[1];
    }
    return null;
  };
}
