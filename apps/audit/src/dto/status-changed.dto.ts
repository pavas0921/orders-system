export class StatusChangedDto {
  orderId: string;
  fromStatus: string;
  toStatus: string;
  metadata?: Record<string, any>;
}
