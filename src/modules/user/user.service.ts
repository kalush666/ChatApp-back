import { Body, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/database/schemas/users.schema';
import * as bcrypt from 'bcrypt';
import { BackendConstants } from 'src/constants/backend.constants';
import { CommonDto, CommonRo } from '../../../../common';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  public mapToUserResponse(user: UserDocument): CommonRo.UserRo.UserResponse {
    return {
      userName: user.userName,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }

  public async createUser(
    dto: CommonDto.UserDto.RegisterDto,
  ): Promise<CommonRo.UserRo.UserResponse> {
    const hashedPassword = await bcrypt.hash(
      dto.password,
      BackendConstants.AuthConstants.BCRYPT_SALT_ROUNDS,
    );

    const createdUser = new this.userModel({
      ...dto,
      password: hashedPassword,
      contacts: [],
      chats: {},
    });

    const savedUser = await createdUser.save();
    return this.mapToUserResponse(savedUser);
  }

  public async getUserByUserName(
    userName: string,
  ): Promise<CommonRo.UserRo.UserResponse | null> {
    const user = await this.userModel.findOne({ userName }).exec();
    return user ? this.mapToUserResponse(user) : null;
  }

  public async findUserByUserName(
    userName: string,
  ): Promise<UserDocument | null> {
    return this.userModel.findOne({ userName }).exec();
  }

  public async updateUserProfile(
    body: Partial<{
      userName: string;
      firstName: string;
      lastName: string;
      password: string;
    }>,
  ): Promise<CommonRo.UserRo.UserResponse> {
    const user = await this.userModel
      .findOne({ userName: body.userName })
      .exec();
    if (!user) {
      throw new Error('User not found');
    }

    if (body.firstName !== undefined && body.firstName.trim() !== '')
      user.firstName = body.firstName;
    if (body.lastName !== undefined && body.lastName.trim() !== '')
      user.lastName = body.lastName;
    if (body.password !== undefined && body.password.trim() !== '') {
      user.password = await bcrypt.hash(
        body.password,
        BackendConstants.AuthConstants.BCRYPT_SALT_ROUNDS,
      );
    }

    const updatedUser = await user.save();
    return this.mapToUserResponse(updatedUser);
  }

  public async paginatedChats(
    userName: string,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<{ chats: string[]; total: number }> {
    const user = await this.userModel.findOne({ userName }).exec();
    if (!user) {
      throw new Error('User not found');
    }
    const chatNames = Object.values(user.chats);
    const total = chatNames.length;
    const chats = chatNames.slice((page - 1) * pageSize, page * pageSize);
    return { chats, total };
  }

  public async paginatedUsers(
    userName: string,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<{ users: CommonRo.UserRo.UserResponse[]; total: number }> {
    const currentUser = await this.userModel.findOne({ userName }).exec();
    const contacts = currentUser?.contacts || [];

    const exclude = [userName, ...contacts];

    const query = { userName: { $nin: exclude } };
    const total = await this.userModel.countDocuments(query);
    const users = await this.userModel
      .find(query)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .exec();

    return {
      users: users.map((user) => this.mapToUserResponse(user)),
      total,
    };
  }
}
