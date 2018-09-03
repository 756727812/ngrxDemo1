import { AuthService } from './auth.service';
import { _HttpClient } from './http/http.client';
import { ReportService } from './report/report.service';

export const services = [AuthService, ReportService, _HttpClient];

export * from './auth.service';
export * from './http/http.client';
export * from './report/report.service';
