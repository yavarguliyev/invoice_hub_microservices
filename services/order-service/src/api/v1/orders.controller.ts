import { JsonController, Get, QueryParams } from 'routing-controllers';
import { ContainerHelper, createVersionedRoute, GetQueryResultsArgs } from '@invoice-hub/common';

import { ContainerItems } from 'application/ioc/static/container-items';
import { IOrderService } from 'application/services/order.service';

@JsonController(createVersionedRoute({ controllerPath: '/orders', version: 'v1' }))
export class OrdersController {
  private orderService: IOrderService;

  constructor () {
    this.orderService = ContainerHelper.get<IOrderService>(ContainerItems.IOrderService);
  }

  @Get('/')
  async get (@QueryParams() query: GetQueryResultsArgs) {
    return await this.orderService.get(query);
  }
}
