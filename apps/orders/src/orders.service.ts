import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { OrdersRepository } from './orders.repository';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { QueryOrdersDto } from './dto/query-orders.dto';
import { OrderStatus, VALID_TRANSITIONS } from './entities/order-status.enum';

const MIN_QUANTITY = 1;

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);
  constructor(
    private readonly ordersRepository: OrdersRepository,
    @Inject('AUDIT_SERVICE') private readonly auditClient: ClientProxy,
  ) {}

  async create(dto: CreateOrderDto) {
    if (dto.quantity < MIN_QUANTITY) {
      throw new BadRequestException(`Minimum quantity is ${MIN_QUANTITY}`);
    }

    return this.ordersRepository.save({
      ...dto,
      status: OrderStatus.PENDING,
    });
  }

  async findAll(query: QueryOrdersDto) {
    const [data, total] = await this.ordersRepository.findAll(query);
    return {
      data,
      total,
      page: query.page ?? 1,
      limit: query.limit ?? 10,
      totalPages: Math.ceil(total / (query.limit ?? 10)),
    };
  }

  async updateStatus(id: string, dto: UpdateStatusDto) {
    const order = await this.ordersRepository.findById(id);
    if (!order) throw new NotFoundException(`Order ${id} not found`);

    const allowed = VALID_TRANSITIONS[order.status];
    if (!allowed.includes(dto.status)) {
      throw new BadRequestException(
        `Cannot transition from ${order.status} to ${dto.status}`,
      );
    }

    const updated = await this.ordersRepository.save({
      ...order,
      status: dto.status,
    });

    this.logger.log(
      `Order ${id} status changed: ${order.status} → ${dto.status}`,
    );

    // Fire and forget
    this.auditClient.emit('order.status_changed', {
      orderId: id,
      fromStatus: order.status,
      toStatus: dto.status,
      metadata: { updatedAt: new Date() },
    });

    return updated;
  }
}
