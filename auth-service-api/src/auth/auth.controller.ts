import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/signIn.dto';
import { RegisterDto } from './dto/signUpDto.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  signUp(@Body() body: RegisterDto): Promise<{ token: string }> {
    return this.authService.signUp(body);
  }

  @Post('/login')
  @HttpCode(HttpStatus.OK)
  login(@Body() body: LoginDto): Promise<{ token: string }> {
    return this.authService.login(body);
  }
}
