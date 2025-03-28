import { Column, Entity } from 'typeorm';
import { IsNumber, IsEnum, IsUUID } from 'class-validator';
import { Entities, OrderStatus, BaseEntity } from '@invoice-hub/common';

@Entity(Entities.ORDER)
export class Order extends BaseEntity {
  @Column({ type: 'uuid', name: 'user_id' })
  @IsUUID()
  userId: string;

  @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2 })
  @IsNumber()
  totalAmount: number;

  @Column({ type: 'varchar', length: 64 })
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
