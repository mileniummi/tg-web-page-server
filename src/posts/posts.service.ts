import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Post_ } from './posts.model';
import { CreatePostDto } from './dto/create-post.dto';
import { User } from '../users/users.model';
import { UsersService } from '../users/users.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post_) private postsRepository: typeof Post_,
    private userService: UsersService,
  ) {}

  async createPost(dto: CreatePostDto, user: User) {
    const post = dto;
    post['userID'] = user.id;
    return await this.postsRepository.create(post);
  }
  async getAllPosts(user: User) {
    return await this.postsRepository.findAll({
      where: { userID: user.id },
      include: { all: true },
    });
  }
  async getAllPostsByTgId(id) {
    const user = await this.userService.getUserIDByTgChatID(id);
    return await this.postsRepository.findAll({
      where: { userID: user.id },
      attributes: ['description', 'photoLink'],
    });
  }

  async deletePostByID(postID: number) {
    return await this.postsRepository.destroy({ where: { id: postID } });
  }
}
