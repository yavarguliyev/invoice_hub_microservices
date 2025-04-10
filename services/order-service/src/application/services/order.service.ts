import { Container } from 'typedi';
import DataLoader from 'dataloader';
import { plainToInstance } from 'class-transformer';
import {
  CreateOrderArgs,
  GetQueryResultsArgs,
  OrderDto,
  OrderStatus,
  queryResults,
  RedisDecorator,
  ResponseResults,
  ResultMessage,
  UserDto,
  GetOrderArgs,
  DataLoaderInfrastructure,
  ContainerKeys,
  ContainerHelper,
  ContainerItems,
  REDIS_ORDER_LIST,
  KafkaInfrastructure,
  RedisCacheInvalidateDecorator
} from '@invoice-hub/common';

import { buildKafkaRequestOptionsHelper } from 'application/helpers/kafka-request.helper';
import { IOrderTransactionManager } from 'application/transactions/order-transaction.manager';
import { IOrderKafkaSubscriber } from 'application/kafka/order-kafka.subscriber';
import { OrderRepository } from 'domain/repositories/order.repository';
import { Order } from 'domain/entities/order.entity';

export interface IOrderService {
  initialize(): Promise<void>;
  get(query: GetQueryResultsArgs): Promise<ResponseResults<OrderDto>>;
  getById(args: GetOrderArgs): Promise<ResponseResults<OrderDto & { user: UserDto }>>;
  createOrder(currentUser: UserDto, args: CreateOrderArgs): Promise<ResponseResults<OrderDto>>;
}

export class OrderService implements IOrderService {
  // #region DI
  private _kafka?: KafkaInfrastructure;
  private _orderRepository?: OrderRepository;
  private _orderDtoLoaderById?: DataLoader<string, OrderDto>;
  private _transactionManager?: IOrderTransactionManager;
  private _kafkaSubscriber?: IOrderKafkaSubscriber;

  private get kafka () {
    if (!this._kafka) {
      this._kafka = Container.get(KafkaInfrastructure);
    }

    return this._kafka;
  }

  private get orderRepository () {
    if (!this._orderRepository) {
      this._orderRepository = Container.get(OrderRepository);
    }

    return this._orderRepository;
  }

  private get orderDtoLoaderById () {
    if (!this._orderDtoLoaderById) {
      this._orderDtoLoaderById = Container.get<DataLoaderInfrastructure<Order>>(ContainerKeys.ORDER_DATA_LOADER)
        .getDataLoader({ entity: Order, Dto: OrderDto, fetchField: 'id' });
    }

    return this._orderDtoLoaderById;
  }

  private get transactionManager () {
    if (!this._transactionManager) {
      this._transactionManager = ContainerHelper.get<IOrderTransactionManager>(ContainerItems.IOrderTransactionManager);
    }

    return this._transactionManager;
  }

  private get kafkaSubscriber () {
    if (!this._kafkaSubscriber) {
      this._kafkaSubscriber = ContainerHelper.get<IOrderKafkaSubscriber>(ContainerItems.IOrderKafkaSubscriber);
    }

    return this._kafkaSubscriber;
  }
  // #endregion

  async initialize () {
    await this.kafkaSubscriber.initialize();
    await this.transactionManager.initialize();
  }

  @RedisDecorator(REDIS_ORDER_LIST)
  async get (query: GetQueryResultsArgs): Promise<ResponseResults<OrderDto>> {
    const { payloads, total } = await queryResults({ repository: this.orderRepository, query, dtoClass: OrderDto });

    return { payloads, total, result: ResultMessage.SUCCESS };
  }

  async getById (args: GetOrderArgs): Promise<ResponseResults<OrderDto & { user: UserDto }>> {
    const orderDto = await this.orderDtoLoaderById.load(args.id);
    if (!orderDto.userId) {
      this.orderDtoLoaderById.clear(args.id);
      return await this.getById(args);
    }

    const options = buildKafkaRequestOptionsHelper(orderDto);
    const [user] = await this.kafka.requestResponse<[UserDto]>(options);
    delete orderDto.userId;

    return { payload: { ...orderDto, user }, result: ResultMessage.SUCCESS };
  }

  @RedisCacheInvalidateDecorator(REDIS_ORDER_LIST)
  async createOrder ({ id }: UserDto, args: CreateOrderArgs): Promise<ResponseResults<OrderDto>> {
    const order = this.orderRepository.create({ ...args, userId: id, status: OrderStatus.PENDING });
    const newOrder = await this.orderRepository.save(order);

    if (args.totalAmount <= 0) {
      await this.transactionManager.startFailedOrderTransaction(newOrder, 'Invalid total amount', OrderStatus.CANCELLED);
      const payload = plainToInstance(OrderDto, newOrder, { excludeExtraneousValues: true });

      return { payload, result: ResultMessage.FAILED_ORDER_UPDATE_STATUS };
    }

    await this.transactionManager.startOrderTransaction(newOrder);
    const payload = plainToInstance(OrderDto, newOrder, { excludeExtraneousValues: true });

    return { payload, result: ResultMessage.SUCCESS };
  }
}
