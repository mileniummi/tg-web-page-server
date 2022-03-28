import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostsModule } from './posts/posts.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { parse } from 'pg-connection-string';
import { Post_ } from './posts/posts.model';
import { UsersModule } from './users/users.module';
import { User } from './users/users.model';
import { AuthModule } from './auth/auth.module';
import { TelegramModule } from './telegram/telegram.module';

const dbConnection: object = parse(process.env.DATABASE_URL);
@Module({
  imports: [
    PostsModule,
    SequelizeModule.forRoot({
      dialect: 'postgres',
      ...dbConnection,
      username: process.env.DATABASE_USER,
      models: [Post_, User],
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
      autoLoadModels: true,
    }),
    UsersModule,
    AuthModule,
    TelegramModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
