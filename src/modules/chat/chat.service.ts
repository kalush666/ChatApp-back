import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chat } from 'src/database/schemas/chats.schema';
import { CreateChatDto } from '../../../../common/dto/chat.dto';
import { ChatRo } from '../../../../common/Ro/chat.ro';
import { User, UserDocument } from 'src/database/schemas/users.schema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Chat.name) private readonly chatModel: Model<Chat>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async createChat(
    dto: CreateChatDto,
  ): Promise<{ chatId: string; chatName: string }> {
    const createdChat = new this.chatModel({
      chatName: dto.chatName,
      messages: [],
      participants: dto.participants ?? [],
    });
    const savedChat = await createdChat.save();

    return {
      chatId: savedChat._id.toString(),
      chatName: savedChat.chatName,
    };
  }

  async addUserToChat(
    userName: string,
    chatId: string,
  ): Promise<Partial<ChatRo>> {
    const chat = await this.chatModel.findById(chatId);
    if (!chat) {
      throw new Error('Chat not found');
    }

    if (!chat.participants.includes(userName)) {
      chat.participants.push(userName);
      await chat.save();
    }

    return {
      chatName: chat.chatName,
    };
  }

  async updateUserChats(
    userName: string,
    chatId: string,
    chatName: string,
  ): Promise<void> {
    const user = await this.userModel.findOne({ userName }).exec();
    if (!user) throw new Error('User not found');
    if (!user.chats || typeof user.chats !== 'object') user.chats = {};
    user.chats[chatId] = chatName;
    user.markModified('chats');
    await user.save();
  }

  async paginatedChats(
    userName: string,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<{ chats: { chatId: string; chatName: string }[]; total: number }> {
    const user = await this.userModel.findOne({ userName }).exec();
    if (!user) {
      throw new Error('User not found');
    }
    const chatEntries = Object.entries(user.chats);
    const total = chatEntries.length;
    const chats = chatEntries
      .slice((page - 1) * pageSize, page * pageSize)
      .map(([chatId, chatName]) => ({ chatId, chatName }));
    return { chats, total };
  }
}
