import { Injectable } from '@nestjs/common';
import { PostsService } from '../../posts/posts.service';
import { InlineKeyboardButton } from 'node-telegram-bot-api';

@Injectable()
export class TelegramButtonObserver {
  constructor(private postsService: PostsService) {}
  async observe(query) {
    if (query.message.text === 'Выбери ID поста для удаления') {
      return {
        text: `Удалить пост c ID: ${query.data} ?`,
        options: {
          message_id: query.message.message_id,
          chat_id: query.message.chat.id,
          ...this.generateYesNoButton(),
        },
      };
    }
    if (query.message.text.startsWith('Удалить пост')) {
      if (query.data === 'Да') {
        const postIdToDelete = query.message.text.match(/\d+/)[0];
        await this.postsService.deletePostByID(parseInt(postIdToDelete));
        return {
          text: `Удалил пост c ID: ${postIdToDelete}`,
          options: {
            message_id: query.message.message_id,
            chat_id: query.message.chat.id,
          },
        };
      } else {
        return {
          text: `Удаление отменено`,
          options: {
            message_id: query.message.message_id,
            chat_id: query.message.chat.id,
          },
        };
      }
    }
  }
  private generateYesNoButton = () => {
    const inline_keyboard = [];
    const row: Array<InlineKeyboardButton> = [
      { text: 'Да', callback_data: 'Да' },
      { text: 'Нет', callback_data: 'Нет' },
    ];
    inline_keyboard.push(row);
    return { reply_markup: { inline_keyboard } };
  };
}
