import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import * as TelegramBot from 'node-telegram-bot-api';
import { UsersService } from '../../users/users.service';
import { PostsService } from '../../posts/posts.service';
import * as fs from 'fs';
import { TelegramCommandsService } from './telegram.commands.service';
import { TelegramButtonObserver } from './telegram.button-observer';

@Injectable()
export class TelegramService {
  private readonly botInstance: TelegramBot;

  constructor(
    private userService: UsersService,
    private postsService: PostsService,
    private httpService: HttpService,
    private tgCommandsService: TelegramCommandsService,
    private tgButtonObserver: TelegramButtonObserver,
  ) {
    this.botInstance = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
      polling: true,
    });
    this.botInstance.setMyCommands([
      { command: '/posts', description: 'Получение всех постов' },
      { command: '/delete', description: 'Удалить пост' },
    ]);
    this.initUserMessageObserver();
    this.initButtonObserver();
  }

  private initUserMessageObserver() {
    this.botInstance.on('message', async (message) => {
      const tgChatID = message.chat.id;
      if (message.text !== undefined) {
        if (message.text.startsWith('/')) {
          await this.handleCommand(message.text, tgChatID);
        } else {
          return await this.botInstance.sendMessage(
            tgChatID,
            'Прости, я тебя не понимаю...Чтобы создать пост добавь фотографию в этот чат' +
              " с описанием. Чтобы со мной взаимодействовать набери '/' и выбери команду",
          );
        }
      }
      // это пост
      else {
        if (message.photo !== undefined) {
          if (await this.checkUserAuthorization(tgChatID)) {
            await this.createPost(message, tgChatID);
          }
        } else {
          return await this.botInstance.sendMessage(
            tgChatID,
            'Прости, я тебя не понимаю...Чтобы создать пост добавь фотографию в этот чат' +
              " с описанием. Чтобы со мной взаимодействовать набери '/' и выбери команду",
          );
        }
      }
    });
  }
  private async handleCommand(command: string, tgChatID) {
    if (command.startsWith('/start')) {
      await this.botInstance.sendMessage(
        tgChatID,
        await this.tgCommandsService.handleStart(command, tgChatID),
      );
    } else {
      if (await this.checkUserAuthorization(tgChatID)) {
        switch (command) {
          case '/posts':
            await this.botInstance.sendMessage(
              tgChatID,
              await this.tgCommandsService.handlePosts(tgChatID),
            );
            break;
          case '/delete':
            const res = await this.tgCommandsService.handleDelete(tgChatID);
            return await this.botInstance.sendMessage(
              tgChatID,
              res.message,
              res.options,
            );
          default:
            return await this.botInstance.sendMessage(
              tgChatID,
              'Это неизвестная для меня комманда',
            );
        }
      } else {
        return await this.botInstance.sendMessage(
          tgChatID,
          'Что то пошло не так... Попробуй перейти по ссылке для бота в личном кабинете еще раз',
        );
      }
    }
  }

  private initButtonObserver() {
    this.botInstance.on('callback_query', async (query) => {
      const returningMessage = await this.tgButtonObserver.observe(query);
      await this.botInstance.editMessageText(
        returningMessage.text,
        returningMessage.options,
      );
    });
  }

  private async createPost(message, tgChatID) {
    const description = message.caption === undefined ? '' : message.caption;
    const photosArr = message.photo;
    const photo = await this.botInstance.getFile(
      photosArr.slice(-1)[0].file_id,
    );
    fs.mkdir(
      `./public/images/posts/${message.chat.id}/photos`,
      { recursive: true },
      (err) => {
        if (err) {
          console.log(err);
        }
      },
    );
    const photoLink = `./public/images/posts/${tgChatID}/${photo.file_path}`;
    // download file
    await this.downloadFile(
      `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${photo.file_path}`,
      photoLink,
    );
    const user = await this.userService.getUserIDByTgChatID(tgChatID);
    // создание самого поста
    const post = await this.postsService.createPost(
      { description, photoLink },
      user,
    );
    return this.botInstance.sendMessage(
      tgChatID,
      `Создал пост с ID: ${post.id}`,
    );
  }

  private async checkUserAuthorization(tgChatID) {
    const user = await this.userService.getUserIDByTgChatID(tgChatID);
    return user !== null;
  }

  private async downloadFile(dataUrl, filename) {
    const writer = fs.createWriteStream(filename);

    const response = await this.httpService.axiosRef({
      url: dataUrl,
      method: 'GET',
      responseType: 'stream',
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  }
}
