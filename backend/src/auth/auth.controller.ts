import { Controller, Post, Body, Get } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('admin')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { username: string; pass: string }) {
    return this.authService.login(body.username, body.pass);
  }

  @Post('init')
  async init() {
    return this.authService.createInitialAdmin();
  }
}
