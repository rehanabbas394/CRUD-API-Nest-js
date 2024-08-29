import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { UserModule } from '../user/user.module';

@Module({
    imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }), 
        JwtModule.register({
          secret: 'pjnmklsd09u834sjodsnmkld', 
          signOptions: { expiresIn: '60m' },
        }),
        UserModule,
    ],
  providers: [JwtStrategy], 
  exports: [PassportModule, JwtModule], 
})
export class AuthModule {}
