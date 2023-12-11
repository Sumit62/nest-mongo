import {
  IsString,
  IsInt,
  IsEmail,
  IsBoolean,
  IsNotEmpty,
} from 'class-validator';
export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  firstname: string;

  @IsString()
  @IsNotEmpty()
  lastname: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsInt()
  @IsNotEmpty()
  phone: number;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsBoolean()
  isActive: boolean = true;
}

export class LoginUserDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
  @IsNotEmpty()
  @IsString()
  password: string;
}
