import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../generated/client';

@Injectable()
export class TicketsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllTickets() {
    return await this.prisma.ticket.findMany();
  }

  async getTickets(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      throw new NotFoundException(`Користувача з ID ${userId} не знайдено`);
    }

    const roleId = user.role;
    let whereClause: Prisma.TicketWhereInput = {};

    if (roleId === 1) {
      whereClause = {
        users: {
          some: { userId: userId },
        },
      };
    } else if (roleId === 2) {
      whereClause = {
        OR: [
          { status: 'OPEN' },
          {
            AND: [
              { users: { some: { userId } } },
              { status: { in: ['IN_PROGRESS', 'CLOSED'] } },
            ],
          },
        ],
      };
    } else if (roleId === 3) {
      whereClause = {};
    }

    return await this.prisma.ticket.findMany({
      where: whereClause,
      include: {
        users: true,
      },
    });
  }

  async createTicket(data: { title: string; description: string; userId: number }) {
    return await this.prisma.ticket.create({
      data: {
        title: data.title,
        description: data.description,
        status: 'OPEN',
        users: {
          create: {
            userId: data.userId,
          },
        },
      },
    });
  }

  async patchTicket(id: number, data: Prisma.TicketUpdateInput) {
    return await this.prisma.ticket.update({
      where: { id },
      data,
    });
  }

  async deleteTicket(id: number) {
    return await this.prisma.ticket.delete({
      where: { id },
    });
  }

  async addUserToTicket(ticketId: number, userId: number) {
    return await this.prisma.ticket.update({
      where: { id: ticketId },
      data: {
        users: {
          create: {
            userId: userId,
          },
        },
      },
      include: { users: true },
    });
  }

  async addMessage(ticketId: number, data: { message: string; image?: string; userId: number }) {
    return await this.prisma.message.create({
      data: {
        message: data.message,
        image: data.image,
        userId: data.userId,
        ticketId: ticketId,
      },
    });
  }

  async getTicketMessages(ticketId: number) {
    return await this.prisma.message.findMany({
      where: { ticketId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getMessageById(messageId: number) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });
    if (!message) {
      throw new NotFoundException('Message not found');
    }
    return message;
  }
}