import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './modules/user/user.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { ChatModule } from './modules/chat/chat.module';
import { MessagesModule } from './modules/message/message.module';
import { ContactModule } from './modules/contact/constact.module';
import { DataCookieModule } from './modules/userCookie/dataCookie.module';
import { DataCookie } from './database/schemas/dataCookie.schema';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    UserModule,
    MessagesModule,
    AuthModule,
    ChatModule,
    ContactModule,
    DataCookieModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
