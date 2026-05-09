import { Controller, Get, Param } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AuditService } from './audit.service';
import { StatusChangedDto } from './dto/status-changed.dto';

@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @EventPattern('order.status_changed')
  async handleStatusChanged(@Payload() data: StatusChangedDto) {
    await this.auditService.logStatusChange(data);
  }

  @Get(':orderId')
  findByOrderId(@Param('orderId') orderId: string) {
    return this.auditService.findByOrderId(orderId);
  }
}
