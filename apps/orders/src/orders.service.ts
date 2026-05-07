import { Injectable, BadRequestException } from '@nestjs/common';
import { OrdersRepository } from './orders.repository';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from './entities/order-status.enum';
import { QueryOrdersDto } from './dto/query-orders.dto';

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
}
