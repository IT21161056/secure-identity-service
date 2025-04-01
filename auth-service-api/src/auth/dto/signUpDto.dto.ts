import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  readonly name: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  readonly email: string;

  @ApiProperty({ example: 'P@ssw0rd!', minLength: 8 })
  @IsString()
  @MinLength(8)
  readonly password: string;
}
