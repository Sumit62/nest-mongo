import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto, LoginUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';
import { AuthService } from 'src/auth/auth.service';
import { APIFeatures } from 'src/utils/mongo.utils';

@Injectable()
export class UsersService {
  constructor(
    private readonly authService: AuthService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}
  async signUp(createUserDto: CreateUserDto): Promise<User> {
    try {
      const model = new this.userModel();
      model.firstname = createUserDto.firstname;
      model.lastname = createUserDto.lastname;
      model.email = createUserDto.email;
      model.phone = createUserDto.phone;
      model.password = createUserDto.password;
      model.city = createUserDto.city;
      return await model.save();
    } catch (error) {
      // Handle duplicate key error (MongoError with code 11000)
      if (error.code === 11000) {
        throw new ConflictException('Email already exists');
      }
      throw error; // Rethrow other errors
    }
  }

  async signIn(loginUserDto: LoginUserDto): Promise<any> {
    try {
      const data = await this.userModel
        .findOne({
          email: loginUserDto.email,
        })
        .lean();
      const access_token = await this.authService.authentication(data.id);
      return { ...data, access_token };
    } catch (error) {
      return error;
    }
  }

  async findAll(req): Promise<any> {
    try {
      const query = { ...req.query };
      query.fields = 'firstname, lastname, email, isActive';
      const findData = new APIFeatures(this.userModel.find(), query || {})
        .filter()
        .paginate()
        .sort()
        .search();
      const data = await findData.query;
      return data;
    } catch (error) {
      return error;
    }
  }

  async findUserById(id: string) {
    try {
      const data = await this.userModel.findById(id);
      return data;
    } catch (error) {
      return error;
    }
  }

  async userUpdate(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      const data = await this.userModel.findByIdAndUpdate(id, updateUserDto, {
        new: true,
        runValidators: true,
      });
      return data;
    } catch (error) {
      return error;
    }
  }

  async userDelete(id: string): Promise<User> {
    try {
      const data = await this.userModel.findByIdAndDelete(id).lean();
      return data;
    } catch (error) {
      return error;
    }
  }
}
