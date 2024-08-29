import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class signupDto{
    
    @IsNotEmpty({message:'Username cannot be null'})
    @IsString({message:'Username must be string'})
    username:string

    @IsNotEmpty({message:'Email cannot be null'})
    @IsString({message:'Email must be string'})
    email:string

    @IsNotEmpty({message:'password cannot be null'})
    @MinLength(5, {message: 'Password must be 5 Character'})    
    password:string

}