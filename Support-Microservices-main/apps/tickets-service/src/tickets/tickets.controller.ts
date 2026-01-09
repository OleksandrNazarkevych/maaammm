import { Body, Controller, Get, Post, Param, Patch, Delete, ParseIntPipe } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { IsString, IsInt, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiOperation, ApiTags, ApiResponse, ApiProperty } from '@nestjs/swagger';

enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  CLOSED = 'CLOSED',
}

class CreateTicketDto {
  @ApiProperty({ example: 'Проблема з доступом' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Не можу зайти в кабінет' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  userId: number;
}

class UpdateTicketDto {
  @ApiProperty({ example: 'CLOSED', enum: TicketStatus, required: false })
  @IsEnum(TicketStatus)
  @IsOptional()
  status?: TicketStatus;
}

class CreateMessageDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  userId: number;

  @ApiProperty({ example: 'Текст повідомлення' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({ example: 'https://i.imgur.com/cVACPds.jpeg', required: false })
  @IsString()
  @IsOptional()
  image?: string;
}

@ApiTags('Tickets')
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketService: TicketsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all tickets' })
  async getAllTickets() {
    return this.ticketService.getAllTickets();
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get user tickets' })
  async getTickets(@Param('userId', ParseIntPipe) userId: number) {
    return this.ticketService.getTickets(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new ticket' })
  async createTicket(@Body() createTicketDto: CreateTicketDto) {
    return this.ticketService.createTicket(createTicketDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update ticket' })
  async patchTicket(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTicketDto: UpdateTicketDto
  ) {
    return this.ticketService.patchTicket(id, updateTicketDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete ticket' })
  async deleteTicket(@Param('id', ParseIntPipe) id: number) {
    return this.ticketService.deleteTicket(id);
  }

  @Post(':id/users/:userId')
  @ApiOperation({ summary: 'Add user to ticket' })
  async addUserToTicket(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.ticketService.addUserToTicket(id, userId);
  }

  @Post(':ticketId/messages')
  @ApiOperation({ summary: 'Send Message' })
  async createMessage(
    @Param('ticketId', ParseIntPipe) ticketId: number,
    @Body() createMessageDto: CreateMessageDto,
  ) {
    return this.ticketService.addMessage(ticketId, createMessageDto);
  }

  @Get(':ticketId/messages')
  @ApiOperation({ summary: 'Get ticket messages' })
  async getTicketMessages(@Param('ticketId', ParseIntPipe) ticketId: number) {
    return this.ticketService.getTicketMessages(ticketId);
  }

  @Get('messages/:messageId')
  @ApiOperation({ summary: 'Get message by id' })
  async getMessageById(@Param('messageId', ParseIntPipe) messageId: number) {
    return this.ticketService.getMessageById(messageId);
  }
}