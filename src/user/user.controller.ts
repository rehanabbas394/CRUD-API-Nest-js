import { Body, Controller, Param, Post, Get, UseGuards, Delete } from "@nestjs/common";
import { UserService } from "./user.service";
import { signupDto } from "./dto/signup.dto";
import { User } from "./entity/entity";
import { SigninDto } from "./dto/signin.dto";
import { JwtAuthGuard } from "../auth/jwt.guard";

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post('signup')
  async signup(@Body() signupdto: signupDto): Promise<User> {
    return await this.userService.signup(signupdto)

  }

  @UseGuards(JwtAuthGuard)
  @Get('/:email')
  async Findbyemail(@Param('email') email: string): Promise<User> {
    return await this.userService.findbyEmail(email);
  }

  @Post('signin')
  async signin(@Body() signindto: SigninDto) {
    return await this.userService.signin(signindto);
  }
  @UseGuards(JwtAuthGuard)
  @Delete("/:email")
  async del_user(@Param('email') email: string) {
    return await this.userService.deleteUser(email)
  }

}