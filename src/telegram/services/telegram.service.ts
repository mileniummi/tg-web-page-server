import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import * as TelegramBot from 'node-telegram-bot-api';
import { UsersService } from '../../users/users.service';
import { PostsService } from '../../posts/posts.service';
import { TelegramCommandsService } from './telegram.commands.service';
import { TelegramButtonObserver } from './telegram.button-observer';
import * as EasyYandexS3 from 'easy-yandex-s3';

@Injectable()
export class TelegramService {
  private readonly botInstance: TelegramBot;
  private readonly yandexStorage;

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
    this.yandexStorage = new EasyYandexS3({
      auth: {
        accessKeyId: process.env.YANDEX_STORAGE_KEY_ID,
        secretAccessKey: process.env.YANDEX_STORAGE_KEY,
      },
      Bucket: process.env.YANDEX_STORAGE_BUCKET_NAME, // например, "my-storage",
      debug: false, // Дебаг в консоли, потом можете удалить в релизе
    });
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
    //collecting data
    const description = message.caption === undefined ? '' : message.caption;
    const photosArr = message.photo;
    const photo = await this.botInstance.getFile(
      photosArr.slice(-1)[0].file_id,
    );
    const response = await this.httpService.axiosRef({
      url: `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${photo.file_path}`,
      method: 'GET',
      responseType: 'arraybuffer',
    });
    //upload photo to Yandex Cloud
    const upload = await this.yandexStorage.Upload(
      { buffer: response.data },
      `/${tgChatID}/`,
    );
    if (upload === false) {
      console.log('Something went wrong when uploading photo to Yandex Cloud');
      return;
    }
    const user = await this.userService.getUserIDByTgChatID(tgChatID);
    // создание самого поста
    const post = await this.postsService.createPost(
      { description, photoLink: upload.Location },
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
}
