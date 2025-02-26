import { KafkaInfrastructure } from '@invoice-hub/common-packages';

export interface IUserService {
  createOrder (): Promise<any>;
}

export class UserService implements IUserService {
  constructor () {}

  async createOrder () {
    const orderId = Math.floor(Math.random() * 1000);
    const order = { totalAmount: 180.20 };
    await KafkaInfrastructure.publish('order-created', JSON.stringify({ orderId, order }));

    return { result: 'SUCCEED', orderId };
  }
}
