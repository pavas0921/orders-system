import {
  IsString,
  IsInt,
  IsNumber,
  IsPositive,
  Min,
  IsOptional,
} from 'class-validator';

export class CreateOrderDto {
  @IsString()
  userId: string;

  @IsString()
  productId: string;

  @IsInt()
  @Min(1, { message: 'quantity must be at least 1' })
  quantity: number;

  @IsNumber()
  @IsPositive()
  totalPrice: number;

  @IsOptional()
  @IsString()
  description?: string;
}
