import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { User } from './user/entity/entity';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [TypeOrmModule.forRoot({
    type:'postgres',
    host:"localhost",
    port:5432,
    username:"postgres",
    password:"123",
    database:"user_db", 
    entities:[User],
    synchronize:true
  }),
  UserModule, 
  AuthModule
],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
