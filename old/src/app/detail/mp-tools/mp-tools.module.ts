import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { CommonModule } from '@angular/common';
import { containers } from './containers';
import { MpToolsRoutingModule } from './mp-tools.routing.module';
import { MpToolsService } from './services/mp-tools.service';

@NgModule({
  imports: [CommonModule, SharedModule, MpToolsRoutingModule],
  providers: [MpToolsService],
  declarations: [...containers],
  entryComponents: [],
})
export class MpToolsModule {}
