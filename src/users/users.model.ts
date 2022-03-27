import { Column, DataType, Model, Table } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { UUIDV4 } from 'sequelize';

interface UserCreationAttributes {
  username: string;
  password: string;
}

@Table({ tableName: 'users' })
export class User extends Model<User, UserCreationAttributes> {
  @ApiProperty({ example: 1, description: 'Уникальный ид пользователя' })
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ApiProperty({ example: 'username', description: 'Логин пользователя' })
  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  username: string;

  @ApiProperty({ example: 'Jane', description: 'Имя пользователя' })
  @Column({ type: DataType.STRING })
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Фамилия пользователя' })
  @Column({ type: DataType.STRING })
  lastName: string;

  @ApiProperty({ example: 's123', description: 'Пароль пользователя' })
  @Column({ type: DataType.STRING, allowNull: false })
  password: string;

  @ApiProperty({
    example: 'str',
    description:
      'Ид под которым пользователь сможет добавлять посты на страницу через телеграмм бота',
  })
  @Column({ type: DataType.UUID, defaultValue: UUIDV4, unique: true })
  tgUUID: number;

  @ApiProperty({
    example: 'str',
    description:
      'Ид чата в которым пользователь сможет добавлять посты на страницу через телеграмм бота',
  })
  @Column({ type: DataType.INTEGER, unique: true, allowNull: true })
  tgChatID: number;
}
