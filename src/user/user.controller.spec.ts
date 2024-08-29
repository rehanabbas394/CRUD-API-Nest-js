import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { signupDto } from './dto/signup.dto';
import { User } from './entity/entity';
import { SigninDto } from './dto/signin.dto';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  const mockUserService = {
    signup: jest.fn(),
    findbyEmail: jest.fn(),
    signin: jest.fn(),
    deleteUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signup', () => {
    it('should successfully signup a user', async () => {
      const signupdto: signupDto = { username: 'ali234', email: 'ali123@gmail.com', password: 'ali123' };
      const mockUser = { id: '1', ...signupdto };
      
      jest.spyOn(service, 'signup').mockResolvedValue(mockUser);

      const result = await controller.signup(signupdto);
      expect(result).toEqual(mockUser);
      expect(service.signup).toHaveBeenCalledWith(signupdto);
    });
  });

  describe('Findbyemail', () => {
    it('should return a user by email', async () => {
      const email = 'ali123@gmail.com';
      const mockUser = { id: '1', email };
      
      jest.spyOn(service, 'findbyEmail').mockResolvedValue(mockUser as User);

      const result = await controller.Findbyemail(email);
      expect(result).toEqual(mockUser);
      expect(service.findbyEmail).toHaveBeenCalledWith(email);
    });
  });

  describe('signin', () => {
    it('should successfully signin a user and return an access token', async () => {
      const signinDto: SigninDto = { email: 'ali123@gmail.com', password: 'ali123' };
      const mockResponse = { user: { id: '1', email: 'ali123@gmail.com', username: 'ali234', password: 'ali123' }, accesstoken: 'accessToken' };
      
      jest.spyOn(service, 'signin').mockResolvedValue(mockResponse);
  
      const result = await controller.signin(signinDto);
      expect(result).toEqual(mockResponse);
      expect(service.signin).toHaveBeenCalledWith(signinDto);
    });
  });

  describe('del_user', () => {
    it('should successfully delete a user by email', async () => {
        const email = 'ali123@gmail.com';
        const mockResult = { affected: 1, raw: 0 };
        jest.spyOn(service, 'deleteUser').mockResolvedValue(mockResult);
    
        const result = await controller.del_user(email);
        expect(result).toEqual(mockResult);
        expect(service.deleteUser).toHaveBeenCalledWith(email);
    });
  });
});
