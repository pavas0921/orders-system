import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { OrdersRepository } from './orders.repository';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus, VALID_TRANSITIONS } from './entities/order-status.enum';
import { QueryOrdersDto } from './dto/query-orders.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

const MIN_QUANTITY = 1;

@Injectable()
export class OrdersService {
  constructor(private readonly ordersRepository: OrdersRepository) {}

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

    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }

    const allowed = VALID_TRANSITIONS[order.status];
    if (!allowed.includes(dto.status)) {
      throw new BadRequestException(
        `Cannot transition from ${order.status} to ${dto.status}`,
      );
    }

    const previousStatus = order.status;
    order.status = dto.status;
    const updated = await this.ordersRepository.save(order);

    return { updated, previousStatus };
  }
}
