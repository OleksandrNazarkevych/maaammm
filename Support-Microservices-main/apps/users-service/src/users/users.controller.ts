import { Controller, Get } from '@nestjs/common';
import { UserService } from './users.service';
import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'Get all user' })
  @ApiResponse({ status: 200, description: 'Return all user' })
  async findAll() {
    return this.userService.findAll();
  }
}
