// hash-password.middleware.ts

import { HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class HashPasswordMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    if (req.body && req.body.password) {
      if (typeof req.body.password !== 'string') {
        return res.status(401).json({ error: 'password should be string.' });
      }
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      req.body.password = hashedPassword;
    }
    next();
  }
}

@Injectable()
export class VerifyPasswordMiddleware implements NestMiddleware {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}
  async use(req: Request, res: Response, next: NextFunction) {
    const userDetails = await this.userModel
      .findOne({
        email: req.body.email,
      })
      .select('+password');
    if (!userDetails) {
      return res.status(HttpStatus.NOT_FOUND).json({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'User Not Found',
        data: {},
        status: false,
      });
    }
    if (req.body && req.body.password) {
      // Check if the provided password matches the expected hash
      const isPasswordValid = await bcrypt.compare(
        req.body.password,
        userDetails.password,
      );

      if (!isPasswordValid) {
        // Handle the case where the password is not valid
        return res.status(401).json({
          error: 'Invalid password',
          statusCode: HttpStatus.BAD_REQUEST,
          status: false,
          message: 'Incorrect password',
        });
      }
    }

    next();
  }
}
