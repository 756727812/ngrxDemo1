import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { ClipboardModule } from 'ngx-clipboard';
import { NgZorroAntdExtraModule } from 'ng-zorro-antd-extra';
import { AlainThemeModule } from '@delon/theme';
import { SeeSelectGoodsModal } from '@shared/components/select-goods-modal/modal-add-items.component';

// region: zorro modules

import {
  // LoggerModule,
  // NzLocaleModule,
  NzButtonModule,
  NzAlertModule,
  NzBadgeModule,
  // NzCalendarModule,
  NzCascaderModule,
  NzCheckboxModule,
  NzDatePickerModule,
  NzFormModule,
  NzInputModule,
  NzInputNumberModule,
  NzGridModule,
  NzMessageModule,
  NzModalModule,
  NzNotificationModule,
  NzPaginationModule,
  NzPopconfirmModule,
  NzPopoverModule,
  NzRadioModule,
  NzRateModule,
  NzSelectModule,
  NzSpinModule,
  NzSliderModule,
  NzSwitchModule,
  NzProgressModule,
  NzTableModule,
  NzTabsModule,
  NzTagModule,
  NzTimePickerModule,
  NzUtilModule,
  NzStepsModule,
  NzDropDownModule,
  NzMenuModule,
  NzBreadCrumbModule,
  NzLayoutModule,
  NzRootModule,
  NzCarouselModule,
  // NzCardModule,
  NzCollapseModule,
  NzTimelineModule,
  NzToolTipModule,
  // NzBackTopModule,
  // NzAffixModule,
  // NzAnchorModule,
  NzAvatarModule,
  NzUploadModule,
  // SERVICES
  NzNotificationService,
  NzMessageService,
  NzTransferModule,
} from 'ng-zorro-antd';
const ZORROMODULES = [
  // LoggerModule,
  // NzLocaleModule,
  NzButtonModule,
  NzAlertModule,
  NzBadgeModule,
  // NzCalendarModule,
  NzCascaderModule,
  NzCheckboxModule,
  NzDatePickerModule,
  NzFormModule,
  NzInputModule,
  NzInputNumberModule,
  NzGridModule,
  NzMessageModule,
  NzModalModule,
  NzNotificationModule,
  NzPaginationModule,
  NzPopconfirmModule,
  NzPopoverModule,
  NzRadioModule,
  NzRateModule,
  NzSelectModule,
  NzSpinModule,
  NzSliderModule,
  NzSwitchModule,
  NzProgressModule,
  NzTableModule,
  NzTabsModule,
  NzTagModule,
  NzTimePickerModule,
  NzUtilModule,
  NzStepsModule,
  NzDropDownModule,
  NzMenuModule,
  NzBreadCrumbModule,
  NzLayoutModule,
  NzRootModule,
  NzCarouselModule,
  // NzCardModule,
  NzCollapseModule,
  NzTimelineModule,
  NzToolTipModule,
  // NzBackTopModule,
  // NzAffixModule,
  // NzAnchorModule,
  NzAvatarModule,
  NzTransferModule,
  NzUploadModule,
];
// endregion

// region: @delon/abc modules
import {
  // AlainABCModule,
  AdAvatarListModule,
  AdChartsModule,
  AdCountDownModule,
  AdDescListModule,
  AdEllipsisModule,
  AdErrorCollectModule,
  AdExceptionModule,
  AdFooterToolbarModule,
  AdGlobalFooterModule,
  AdNoticeIconModule,
  AdNumberInfoModule,
  AdResultModule,
  AdSidebarNavModule,
  AdStandardFormRowModule,
  AdTagSelectModule,
  AdTrendModule,
  AdDownFileModule,
  AdImageModule,
  AdUtilsModule,
} from '@delon/abc';
const ABCMODULES = [
  AdAvatarListModule,
  AdChartsModule,
  AdCountDownModule,
  AdDescListModule,
  AdEllipsisModule,
  AdErrorCollectModule,
  AdExceptionModule,
  AdFooterToolbarModule,
  AdGlobalFooterModule,
  AdNoticeIconModule,
  AdNumberInfoModule,
  AdResultModule,
  AdSidebarNavModule,
  AdStandardFormRowModule,
  AdTagSelectModule,
  AdTrendModule,
  AdDownFileModule,
  AdImageModule,
  AdUtilsModule,
];
// endregion

// custom
import * as fromDirectives from './directives';
import * as fromComponents from './components';
import * as fromServices from './services';
import * as fromPipes from './pipes';
import { CanDeactivateGuard } from './guards/can-deactivate-guard.service';
import { SeeKolSelectorComponent } from '@shared/components/kol-selector/kol-selector.component';
import { ProgressLoadingModalComponent } from '@shared/components/progress-loading-modal/progress-loading-modal.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    HttpClientModule,
    ...ZORROMODULES,
    NgZorroAntdExtraModule.forRoot(),
    AlainThemeModule.forChild(),
    ...ABCMODULES,
    ClipboardModule,
  ],
  declarations: [
    ...fromDirectives.directives,
    ...fromComponents.components,
    ...fromPipes.pipes,
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    ...ZORROMODULES,
    NgZorroAntdExtraModule,
    AlainThemeModule,
    ...ABCMODULES,
    ...fromDirectives.directives,
    ...fromComponents.components,
    ...fromPipes.pipes,
    ClipboardModule,
  ],
  providers: [fromDirectives.DEFAULT_VALUE_ACCESSOR, CanDeactivateGuard],
  entryComponents: [
    SeeSelectGoodsModal,
    SeeKolSelectorComponent,
    ProgressLoadingModalComponent,
  ],
})
export class SharedModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedModule,
      providers: [
        // ng-zorro-antd Services
        NzNotificationService,
        NzMessageService,
        ...fromServices.services,
      ],
    };
  }

  constructor(private reportService: fromServices.ReportService) {}
}
