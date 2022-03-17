import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Post_ } from './posts.model';
import { CreatePostDto } from './dto/create-post.dto';
import { User } from '../users/users.model';

@Injectable()
export class PostsService {
  constructor(@InjectModel(Post_) private postsRepository: typeof Post_) {}

  async createPost(dto: CreatePostDto, user: User) {
    console.log(user);
    const post = dto;
    post['userID'] = user.id;
    return await this.postsRepository.create(post);
  }
  async getAllPosts(user: User) {
    console.log(user);
    return await this.postsRepository.findAll({
      where: { userID: user.id },
      include: { all: true },
    });
  }
}
