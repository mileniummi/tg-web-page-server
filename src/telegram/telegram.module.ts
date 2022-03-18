import { Module } from '@nestjs/common';
import { TelegramService } from './services/telegram.service';
import { UsersModule } from '../users/users.module';
import { PostsModule } from '../posts/posts.module';
import { HttpModule } from '@nestjs/axios';
import { TelegramCommandsService } from './services/telegram.commands.service';
import { TelegramButtonObserver } from './services/telegram.button-observer';

@Module({
  imports: [UsersModule, PostsModule, HttpModule],
  providers: [TelegramService, TelegramCommandsService, TelegramButtonObserver],
  exports: [TelegramService],
})
export class TelegramModule {}
