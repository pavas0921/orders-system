import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog, AuditLogDocument } from './schemas/audit-log.schema';
import { StatusChangedDto } from './dto/status-changed.dto';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);
  constructor(
    @InjectModel(AuditLog.name)
    private readonly auditLogModel: Model<AuditLogDocument>,
  ) {}

  async logStatusChange(dto: StatusChangedDto): Promise<AuditLog> {
    const log = new this.auditLogModel(dto);
    const saved = await log.save();
    this.logger.log(
      `Audit log saved — Order ${dto.orderId}: ${dto.fromStatus} → ${dto.toStatus}`,
    );
    return saved;
  }

  async findByOrderId(orderId: string): Promise<AuditLog[]> {
    return this.auditLogModel
      .find({ orderId })
      .sort({ createdAt: 'asc' })
      .exec();
  }
}
