import { Test, TestingModule } from '@nestjs/testing';
import { TicketsService } from './tickets.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
  },
  ticket: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  message: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
};

describe('TicketsService', () => {
  let service: TicketsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<TicketsService>(TicketsService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks(); // Очищуємо виклики перед кожним тестом
  });

  describe('getTickets logic by Roles', () => {
    it('should throw NotFoundException if user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      await expect(service.getTickets(999)).rejects.toThrow(NotFoundException);
    });

    it('should return tickets for Role 1 (User)', async () => {
      const userId = 1;
      mockPrismaService.user.findUnique.mockResolvedValue({ id: userId, role: 1 });
      mockPrismaService.ticket.findMany.mockResolvedValue([{ id: 101 }]);

      const result = await service.getTickets(userId);

      expect(mockPrismaService.ticket.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { users: { some: { userId } } }
        })
      );
      expect(result).toHaveLength(1);
    });

    it('should return tickets for Role 2 (Support) with OR logic', async () => {
      const userId = 2;
      mockPrismaService.user.findUnique.mockResolvedValue({ id: userId, role: 2 });
      
      await service.getTickets(userId);

      expect(mockPrismaService.ticket.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.any(Array)
          })
        })
      );
    });
  });

  describe('Ticket Operations (CRUD)', () => {
    it('should create a ticket', async () => {
      const dto = { title: 'Test', description: 'Desc', userId: 1 };
      mockPrismaService.ticket.create.mockResolvedValue({ id: 1, ...dto });

      await service.createTicket(dto);

      expect(mockPrismaService.ticket.create).toHaveBeenCalled();
    });

    it('should patch a ticket', async () => {
      const ticketId = 1;
      const updateData = { status: 'CLOSED' };
      mockPrismaService.ticket.update.mockResolvedValue({ id: ticketId, status: 'CLOSED' });

      await service.patchTicket(ticketId, updateData as any);

      expect(mockPrismaService.ticket.update).toHaveBeenCalledWith({
        where: { id: ticketId },
        data: updateData,
      });
    });

    it('should delete a ticket', async () => {
      const ticketId = 1;
      mockPrismaService.ticket.delete.mockResolvedValue({ id: ticketId });

      await service.deleteTicket(ticketId);

      expect(mockPrismaService.ticket.delete).toHaveBeenCalledWith({
        where: { id: ticketId }
      });
    });
  });

  describe('Messages and Users', () => {
    it('should add a user to a ticket', async () => {
      const ticketId = 1;
      const userId = 5;
      mockPrismaService.ticket.update.mockResolvedValue({ id: ticketId });

      await service.addUserToTicket(ticketId, userId);

      expect(mockPrismaService.ticket.update).toHaveBeenCalled();
    });

    it('should create a message', async () => {
      const ticketId = 1;
      const messageData = { message: 'Hello', userId: 1 };
      mockPrismaService.message.create.mockResolvedValue({ id: 1, ...messageData });

      await service.addMessage(ticketId, messageData);

      expect(mockPrismaService.message.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ ticketId })
      });
    });

    it('should get message by ID or throw error', async () => {
      mockPrismaService.message.findUnique.mockResolvedValue(null);
      await expect(service.getMessageById(99)).rejects.toThrow(NotFoundException);

      const msg = { id: 1, message: 'Hi' };
      mockPrismaService.message.findUnique.mockResolvedValue(msg);
      expect(await service.getMessageById(1)).toEqual(msg);
    });
  });
});