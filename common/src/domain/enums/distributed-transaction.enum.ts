export enum DistributedTransactionStatus {
  STARTED = 'STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  COMPENSATING = 'COMPENSATING',
  COMPENSATED = 'COMPENSATED',
  TIMED_OUT = 'TIMED_OUT'
}

export enum ProcessStepStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  COMPENSATED = 'COMPENSATED',
  SKIPPED = 'SKIPPED'
}

export enum ProcessType {
  ORDER_APPROVAL = 'ORDER_APPROVAL',
  ORDER_CANCELLATION = 'ORDER_CANCELLATION'
}
