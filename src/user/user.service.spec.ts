import { Test, TestingModule } from "@nestjs/testing";
import { UserService } from "./user.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User } from "./entity/entity";
import { Repository } from "typeorm";
import { signupDto } from "./dto/signup.dto";
import * as bcrypt from 'bcrypt';
import { SigninDto } from "./dto/signin.dto";
import { BadRequestException } from "@nestjs/common";

describe('UserService', () => {
    let service: UserService;
    let userRepository: Repository<User>;

    const mockUserRepository = {
        create: jest.fn(),
        save: jest.fn(),
        findOneBy: jest.fn(),
        createQueryBuilder: jest.fn(() => ({
            addSelect: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            getOne: jest.fn(),
        })),
        delete: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                {
                    provide: getRepositoryToken(User),
                    useValue: mockUserRepository
                }
            ],
        }).compile();

        service = module.get<UserService>(UserService);
        userRepository = module.get<Repository<User>>(getRepositoryToken(User));  
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('signup', () => {
        it('should create a new user', async () => {
            const signupdto: signupDto = { username: "ali234", email: 'ali123@gmail.com', password: 'ali123' };

            jest.spyOn(service, 'findbyEmail').mockResolvedValue(null);
            jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword');
            mockUserRepository.create.mockReturnValue(signupdto);
            mockUserRepository.save.mockResolvedValue({ ...signupdto, id: 1 });

            const result = await service.signup(signupdto);
            expect(result).toEqual({ username: "ali234", email: 'ali123@gmail.com', id: 1 });
            expect(service.findbyEmail).toHaveBeenCalledWith('ali123@gmail.com');
            expect(bcrypt.hash).toHaveBeenCalledWith('ali123', 10);
            expect(mockUserRepository.create).toHaveBeenCalledWith(signupdto);
            expect(mockUserRepository.save).toHaveBeenCalled();
        });

        it('should throw error if email already exists', async () => {
            const signupdto: signupDto = { username: "ali234", email: 'ali234@gmail.com', password: 'ali123' };
            jest.spyOn(service, 'findbyEmail').mockResolvedValue({ id: "1", username: "ali123", email: "ali234@gmail.com", password: "ali123" });
            await expect(service.signup(signupdto)).rejects.toThrow(BadRequestException);
            expect(service.findbyEmail).toHaveBeenCalledWith('ali234@gmail.com');
        });
    });

    describe('deleteUser', () => {
        it('should delete a user by email', async () => {
          mockUserRepository.delete.mockResolvedValue({affected:1})

          const results = await service.deleteUser("rehan@gmail.com")
          expect(results).toEqual({affected:1})
          expect(mockUserRepository.delete).toHaveBeenCalledWith({email:'rehan@gmail.com'})

        });
    });

    describe('findbyEmail', () => {
        it('should return a user when the email exists', async () => {
            const email = 'rehan@gmail.com';
            const UserResponse = { id: '1', username: 'rehan', email: 'rehan@gmail.com', password: '$2b$10$yn9QOv1O7TMr5xSZ1BPLAe/ez0RzYcbngeX.YmK6O7jQ5420QvF/m' };
            jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(UserResponse as any);  
    
            const result = await service.findbyEmail(email);
            expect(result).toEqual(UserResponse);
            expect(userRepository.findOneBy).toHaveBeenCalledWith({ email });
        });
    
        it('should return null when the email does not exist', async () => {
            const email = 'rehan@gmail.com';
            jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(null);
    
            const result = await service.findbyEmail(email);
            expect(result).toBeNull();
            expect(userRepository.findOneBy).toHaveBeenCalledWith({ email });
        });
    });
    
    describe('signin', () => {
        it('should return user and access token', async () => {
            const signinDto: SigninDto = { email: 'ali123@gmail.com', password: 'ali555123' };
            const UserResponse = { id: '1', email: 'ali123@gmail.com', password: '$2b$10$hashedPassword' }; 
    
            const queryBuilder = {
                addSelect: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                getOne: jest.fn().mockResolvedValue(UserResponse),
            };
    
            jest.spyOn(userRepository, 'createQueryBuilder').mockReturnValue(queryBuilder as any);
            jest.spyOn(service, 'Accesstoken').mockReturnValue('89273dfjncd8293uiosdjnjkasn');
            jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
    
            const result = await service.signin(signinDto);
            expect(result).toEqual({ user: UserResponse, accesstoken: '89273dfjncd8293uiosdjnjkasn' });
    
            expect(bcrypt.compare).toHaveBeenCalledWith("ali555123", '$2b$10$hashedPassword');
            expect(service.Accesstoken).toHaveBeenCalledWith(UserResponse);
        });
    
        it('should throw an error if user does not exist', async () => {
            const signinDto: SigninDto = { email: 'helloworld123@gmail.com', password: 'helloworld' };
    
            const queryBuilder = {
                addSelect: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                getOne: jest.fn().mockResolvedValue(null), 
            };
    
            jest.spyOn(userRepository, 'createQueryBuilder').mockReturnValue(queryBuilder as any); 

            await expect(service.signin(signinDto)).rejects.toThrow(BadRequestException);
            expect(userRepository.createQueryBuilder).toHaveBeenCalledWith('users');
            expect(queryBuilder.where).toHaveBeenCalledWith('users.email = :email', { email: signinDto.email });
            expect(queryBuilder.getOne).toHaveBeenCalled();
        });
    
        it('should throw an error if password does not match', async () => {
            const signinDto: SigninDto = { email: 'ali123@gmail.com', password: 'ali123' };
            const UserResponse = { id: '1', email: 'ali123@gmail.com', password: '093kjlscxnmxc089jks' };
    
            const queryBuilder = {
                addSelect: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                getOne: jest.fn().mockResolvedValue(UserResponse), 
            };
    
            jest.spyOn(userRepository, 'createQueryBuilder').mockReturnValue(queryBuilder as any);
            jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);
    
            await expect(service.signin(signinDto)).rejects.toThrow(BadRequestException);
            expect(bcrypt.compare).toHaveBeenCalledWith('ali123', UserResponse.password);
            expect(queryBuilder.getOne).toHaveBeenCalled();
        });
    });
});
