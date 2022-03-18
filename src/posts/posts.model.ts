import { Column, DataType, Model, Table } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';

interface PostCreationAttributes {
  userID: number;
  description: string;
  photoLink: string;
}

@Table({ tableName: 'posts' })
export class Post_ extends Model<Post_, PostCreationAttributes> {
  @ApiProperty({ example: 1, description: 'Уникальный идентификатор поста' })
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ApiProperty({
    example: 1,
    description: 'Идентификатор создателя поста',
  })
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  userID: number;
  @ApiProperty({ example: 1, description: 'Текст поста' })
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  description: string;

  @ApiProperty({ example: 'image.jpg', description: 'Ссылка на фото поста' })
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  photoLink: string;
}
