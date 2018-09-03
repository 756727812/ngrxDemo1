import { EventService } from './event.service';
import { ActivityClusterService } from './activity-cluster.service';

export const services: any[] = [EventService, ActivityClusterService];

export * from './event.service';
export * from './activity-cluster.service';
