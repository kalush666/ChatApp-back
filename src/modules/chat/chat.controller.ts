import { Body, Controller, Post, Get, Query, Param } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CommonDto, CommonRo } from '../../../../common';

@Controller('chats')
export class ChatsController {
  constructor(private chatService: ChatService) {}

  @Post()
  public async createChat(
    @Body() dto: CommonDto.ChatDto.CreateChatDto,
  ): Promise<CommonRo.ChatRo.ChatRo> {
    return await this.chatService.createChat(dto);
  }

  @Post('add-user-to-chat')
  public async addUserToChat(
    @Body() dto: CommonDto.ChatDto.AddUserToChatDto,
  ): Promise<Partial<CommonRo.ChatRo.ChatRo>> {
    return this.chatService.addUserToChat(dto.userName, dto.chatId);
  }

  @Post('update-user-chats')
  public async updateUserChats(
    @Body() dto: CommonDto.ChatDto.UpdateUserChats,
  ): Promise<void> {
    return this.chatService.updateUserChats(
      dto.userName,
      dto.chatId,
      dto.chatName,
    );
  }

  @Get('paginated')
  public async paginatedChats(
    @Query('userName') userName: string,
    @Query('page') page: string,
    @Query('pageSize') pageSize: string,
  ): Promise<{
    chats: { chatId: string; chatName: string; type: string }[];
    total: number;
  }> {
    return this.chatService.paginatedChats(
      userName,
      Number(page),
      Number(pageSize),
    );
  }

  @Get('paginated/:chatId')
  public async getChatById(@Param('chatId') chatId: string): Promise<any> {
    return this.chatService.getChatById(chatId);
  }

  @Get('get-chat-participents/:chatId')
  public async getChatUsers(
    @Param('chatId') chatId: string,
  ): Promise<{ participants: string[] }> {
    const participants = await this.chatService.getChatParticipants(chatId);
    return { participants };
  }

  @Post('leave-chat')
  public async leaveChat(
    @Body() dto: CommonDto.ChatDto.LeaveChatDto,
  ): Promise<boolean> {
    return this.chatService.leaveChat(dto.userName, dto.chatId);
  }

  @Post('dm-exists')
  public async dmExists(
    @Body() dto: CommonDto.ChatDto.DmExitsDto,
  ): Promise<boolean> {
    return this.chatService.dmExists(dto);
  }

  @Post('delete-dm')
  public async deleteDm(
    @Body() dto: CommonDto.ChatDto.DmExitsDto,
  ): Promise<{ message: string }> {
    return this.chatService.deleteDm(dto);
  }
}
