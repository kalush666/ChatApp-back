import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { UserCookieService } from './userCookie.service';
import { UserCookie } from 'src/database/schemas/userCookie.schema';

@Controller('user-cookie')
export class UserCookieController {
  constructor(private readonly userCookieService: UserCookieService) {}

  @Post('save')
  async saveUserCookie(
    @Body()
    body: {
      userName: string;
      firstName: string;
      lastName: string;
      cookie: string;
    },
  ): Promise<UserCookie> {
    return this.userCookieService.saveUserCookie(body);
  }

  @Get('get')
  async getUserCookie(
    @Query('cookie') cookie: string,
  ): Promise<UserCookie | null> {
    return this.userCookieService.getUserCookie(cookie);
  }
}
