import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./entity/entity";
import { Repository } from "typeorm";
import { signupDto } from "./dto/signup.dto";
import { hash, compare } from 'bcrypt'
import { SigninDto } from "./dto/signin.dto";
import { sign } from "jsonwebtoken";
import { JwtService } from "@nestjs/jwt";
import * as nodemailer from "nodemailer"
import * as bcrypt from "bcrypt"

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly UserRepository: Repository<User>,
        private readonly jwtservice: JwtService,
    ) { }

    async signup(signupdto: signupDto): Promise<User> {
        const UserExisting = await this.findbyEmail(signupdto.email)
        if (UserExisting) throw new BadRequestException({ messae: 'Email already exist' })
        const saltRound = 10
        signupdto.password = await hash(signupdto.password, saltRound)
        let user = this.UserRepository.create(signupdto)
        user = await this.UserRepository.save(user)
        delete user.password
        return user
    }

    async findbyEmail(email: string) {
        const user = await this.UserRepository.findOneBy({ email });
        if (!user) return null
        delete user.password
        return user
    }

    async signin(sigindto: SigninDto) {
        const UserExist = await this.UserRepository.createQueryBuilder('users')
            .addSelect('users.password').where('users.email = :email', { email: sigindto.email })
            .getOne()

        if (!UserExist) {
            console.log("user not found with that email")
            throw new BadRequestException({ message: "User not found with that Email" })
        }
        const match_password = await compare(sigindto.password, UserExist.password)
        if (!match_password) {
            console.log("Password Mismatch")
            throw new BadRequestException({ message: "Bad Credentials." })
        }
        delete UserExist.password
        const accesstoken = await this.Accesstoken(UserExist)
        return { user: UserExist, accesstoken }
    }

    Accesstoken(user: User): string {
        return sign(
            { id: user.id, email: user.email },
            "pjnmklsd09u834sjodsnmkld",
            { expiresIn: "60m" }
        )
    }

    async deleteUser(email: string) {
        return await this.UserRepository.delete({ email })
    }

    async ForgotPassword(email: string) {
        const user = await this.findbyEmail(email)
        if (!user) {
            throw new BadRequestException("User not found")
        }
        const token = this.jwtservice.sign({ email: user.email }, { expiresIn: "1h" })
        const url = "http://localhost:3000"

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                email: "seorehan1122@gmail.com",
                password: "15e0d0f65eb158"
            }
        });
        const mailOptoin = {
            from: "seorehan1122@gmail.com",
            to: user.email,
            subject: 'Password Reset',
            text: `You requested a password reset. Click this link to reset your password: ${url}/reset-password?token=${token}`,
        }

        await transporter.sendMail(mailOptoin)
    }




    async updatePassword(email: string, hashedPassword: string): Promise<void> {
        const user = await this.findbyEmail(email);

        if (!user) {
            throw new NotFoundException('User not found');
        }

        user.password = hashedPassword;
        await this.UserRepository.save(user);
    }

    async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const decoded = this.jwtservice.verify(token);

      const user = await this.findbyEmail(decoded.email);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await this.updatePassword(user.id, hashedPassword);
    } catch (error) {
      throw new NotFoundException('Invalid token');
    }
  }
}