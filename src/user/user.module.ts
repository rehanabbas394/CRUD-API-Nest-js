import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entity/entity";
import { JwtStrategy } from "src/auth/jwt.strategy";

@Module({
    imports:[TypeOrmModule.forFeature([User])],
    providers:[UserService,JwtStrategy],
    controllers:[UserController],
    exports:[UserService]
}) 

export class UserModule{}