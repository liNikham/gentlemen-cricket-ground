import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  UseGuards 
} from '@nestjs/common';
import { GroundService } from './ground.service';
import { CreateGroundDto, UpdateGroundDto } from './dto/ground.dto';
import { AdminAuthGuard } from '../admin-auth/admin-auth.guard';

@Controller('grounds')
export class GroundController {
  constructor(private readonly groundService: GroundService) {}

  @Get()
  async getAllGrounds() {
    return this.groundService.getAllGrounds();
  }

  @Get(':id')
  async getGroundById(@Param('id') id: string) {
    return this.groundService.getGroundById(id);
  }

  @Post()
  @UseGuards(AdminAuthGuard)
  async createGround(@Body() dto: CreateGroundDto) {
    return this.groundService.createGround(dto);
  }

  @Put(':id')
  @UseGuards(AdminAuthGuard)
  async updateGround(
    @Param('id') id: string, 
    @Body() dto: UpdateGroundDto
  ) {
    return this.groundService.updateGround(id, dto);
  }

  @Delete(':id')
  @UseGuards(AdminAuthGuard)
  async deleteGround(@Param('id') id: string) {
    return this.groundService.deleteGround(id);
  }
}
