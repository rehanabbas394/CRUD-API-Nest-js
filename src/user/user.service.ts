import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./entity/entity";
import { Repository } from "typeorm";
import { signupDto } from "./dto/signup.dto";
import { hash, compare } from 'bcrypt'
import { SigninDto } from "./dto/signin.dto";
import { sign } from "jsonwebtoken";

@Injectable()
export class UserService{
constructor(
    @InjectRepository(User)
    private readonly UserRepository: Repository<User>){}

    async signup(signupdto:signupDto):Promise<User>{
        const UserExisting =await this.findbyEmail(signupdto.email)
        if (UserExisting) throw new BadRequestException({messae:'Email already exist'})
        const saltRound = 10
        signupdto.password =await hash(signupdto.password,saltRound) 
        let user = this.UserRepository.create(signupdto)
        user = await this.UserRepository.save(user)
        delete user.password
        return user
    }

    async findbyEmail(email:string){
            const user = await this.UserRepository.findOneBy({ email } );
            if (!user) return null
            delete user.password
            return user
    }

    async signin(sigindto:SigninDto){
        const UserExist = await this.UserRepository.createQueryBuilder('users')
        .addSelect('users.password').where('users.email = :email',{email:sigindto.email})
        .getOne()

        if(!UserExist){
            console.log("user not found with that email")
            throw new BadRequestException({message:"User not found with that Email"})
        }
        const match_password = await compare(sigindto.password, UserExist.password)
        if(!match_password) {
            console.log("Password Mismatch")
            throw new BadRequestException({message:"Bad Credentials."})
        }
        delete UserExist.password
        const accesstoken =await this.Accesstoken(UserExist)
        return {user:UserExist, accesstoken}
    }

     Accesstoken(user:User):string{
        return sign(
            {id:user.id, email:user.email},
            "pjnmklsd09u834sjodsnmkld",
            {expiresIn:"60m"} 
        )
    }

    async deleteUser(email:string){
        return await this.UserRepository.delete({email})
    }
}