import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateGroundDto, UpdateGroundDto } from './dto/ground.dto';

@Injectable()
export class GroundService {
  constructor(private readonly prisma: PrismaService) {}

  async createGround(dto: CreateGroundDto) {
    if (!dto.name || dto.name.trim().length < 3) {
      throw new BadRequestException('Ground name must be at least 3 characters long');
    }

    if (!dto.address || !dto.description || !dto.contactName || !dto.contactPhone) {
      throw new BadRequestException('Ground name, address, description, contact name, and contact phone are required');
    }

    const weekdayPrice = Number(dto.weekdayPrice);
    const weekendPrice = Number(dto.weekendPrice);
    if (isNaN(weekdayPrice) || weekdayPrice < 0 || isNaN(weekendPrice) || weekendPrice < 0) {
      throw new BadRequestException('Prices must be non-negative numbers');
    }

    if (!/^\+?[1-9]\d{7,14}$/.test(dto.contactPhone.trim())) {
      throw new BadRequestException('Contact phone must be a valid mobile number with country code (e.g. +919876543210)');
    }

    if (dto.mapLocationUrl && !/^https?:\/\//i.test(dto.mapLocationUrl.trim())) {
      throw new BadRequestException('Google Maps link must start with http:// or https://');
    }

    return this.prisma.cricketGround.create({
      data: {
        name: dto.name.trim(),
        address: dto.address.trim(),
        mapLocationUrl: dto.mapLocationUrl ? dto.mapLocationUrl.trim() : null,
        description: dto.description.trim(),
        images: dto.images || [],
        weekdayPrice,
        weekendPrice,
        morningPrice: dto.morningPrice !== undefined ? Number(dto.morningPrice) : weekdayPrice,
        eveningPrice: dto.eveningPrice !== undefined ? Number(dto.eveningPrice) : weekdayPrice,
        morningWeekendPrice: dto.morningWeekendPrice !== undefined ? Number(dto.morningWeekendPrice) : weekendPrice,
        eveningWeekendPrice: dto.eveningWeekendPrice !== undefined ? Number(dto.eveningWeekendPrice) : weekendPrice,
        timeSlots: dto.timeSlots && dto.timeSlots.length > 0 
          ? dto.timeSlots 
          : ["7:00 AM - 10:30 AM", "2:30 PM - 5:50 PM"],
        hasParking: dto.hasParking ?? true,
        hasCharging: dto.hasCharging ?? true,
        hasFirstAid: dto.hasFirstAid ?? true,
        hasDugout: dto.hasDugout ?? true,
        hasWashroom: dto.hasWashroom ?? true,
        hasChangingRoom: dto.hasChangingRoom ?? true,
        contactName: dto.contactName.trim(),
        contactPhone: dto.contactPhone.trim(),
        rules: dto.rules ? dto.rules.trim() : 'Standard Ground Rules apply.',
      },
    });
  }

  async getAllGrounds() {
    return this.prisma.cricketGround.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async getGroundById(id: string) {
    const ground = await this.prisma.cricketGround.findUnique({
      where: { id },
    });

    if (!ground) {
      throw new NotFoundException(`Cricket ground with ID ${id} not found`);
    }

    return ground;
  }

  async updateGround(id: string, dto: UpdateGroundDto) {
    await this.getGroundById(id);

    return this.prisma.cricketGround.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.address && { address: dto.address }),
        ...(dto.mapLocationUrl !== undefined && { mapLocationUrl: dto.mapLocationUrl }),
        ...(dto.description && { description: dto.description }),
        ...(dto.images && { images: dto.images }),
        ...(dto.weekdayPrice !== undefined && { weekdayPrice: Number(dto.weekdayPrice) }),
        ...(dto.weekendPrice !== undefined && { weekendPrice: Number(dto.weekendPrice) }),
        ...(dto.morningPrice !== undefined && { morningPrice: Number(dto.morningPrice) }),
        ...(dto.eveningPrice !== undefined && { eveningPrice: Number(dto.eveningPrice) }),
        ...(dto.morningWeekendPrice !== undefined && { morningWeekendPrice: Number(dto.morningWeekendPrice) }),
        ...(dto.eveningWeekendPrice !== undefined && { eveningWeekendPrice: Number(dto.eveningWeekendPrice) }),
        ...(dto.timeSlots && { timeSlots: dto.timeSlots }),
        ...(dto.hasParking !== undefined && { hasParking: dto.hasParking }),
        ...(dto.hasCharging !== undefined && { hasCharging: dto.hasCharging }),
        ...(dto.hasFirstAid !== undefined && { hasFirstAid: dto.hasFirstAid }),
        ...(dto.hasDugout !== undefined && { hasDugout: dto.hasDugout }),
        ...(dto.hasWashroom !== undefined && { hasWashroom: dto.hasWashroom }),
        ...(dto.hasChangingRoom !== undefined && { hasChangingRoom: dto.hasChangingRoom }),
        ...(dto.contactName && { contactName: dto.contactName }),
        ...(dto.contactPhone && { contactPhone: dto.contactPhone }),
        ...(dto.rules !== undefined && { rules: dto.rules }),
      },
    });
  }

  async deleteGround(id: string) {
    await this.getGroundById(id);
    return this.prisma.cricketGround.delete({
      where: { id },
    });
  }
}
