import { IsString, MinLength, minLength } from "class-validator"

export class ResetPassword{
    @IsString()
    token:string

    @IsString()
    @MinLength(5)
    newPassword:string
    
}