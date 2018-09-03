import { PreviewPlaceholderItemComponent } from './preview-placeholder-item/preview-placeholder-item.component';
import { ShowTimeComponent } from './show-time/show-time.component';
import { IconRadioGroupComponent } from './icon-radio-group/icon-radio-group.component';
import { LogoUploadComponent } from './logo-upload/logo-upload.component';
import { ModalAddItems } from 'app/detail/store-construction/components/modal-add-items/modal-add-items.component';
import { SortableItemsComponent } from 'app/detail/store-construction/components/sortable/sortable.component';
import { LinkImgUploadComponent } from './link-img-upload/link-img-upload.component';
import { LinkImgUploadFormLabelComponent } from './common-len-form-label/common-len-form-label.component';
import { components as previewGroupComponents } from '../containers/preview-pane/preview-item/preview-group-buy-list/sub';
import { LayoutMagicComponent } from './layout-magic/layout-magic.component';
import { SalesBenefitComponent } from './sales-benefit/sale-benefit.component';
import { VideoUploadComponent } from './video-upload/video-upload.component';
import { BrandSelectorComponent } from './brand-selector/brand-selector.component';

export const components: any[] = [
  ...previewGroupComponents,
  LogoUploadComponent,
  IconRadioGroupComponent,
  ModalAddItems,
  SortableItemsComponent,
  LinkImgUploadComponent,
  ShowTimeComponent,
  PreviewPlaceholderItemComponent,
  LinkImgUploadFormLabelComponent,
  LayoutMagicComponent,
  SalesBenefitComponent,
  VideoUploadComponent,
  BrandSelectorComponent,
];

export * from './logo-upload/logo-upload.component';
export * from './modal-add-items/modal-add-items.component';
export * from './sortable/sortable.component';
export * from './link-img-upload/link-img-upload.component';
export * from './show-time/show-time.component';
export * from './preview-placeholder-item/preview-placeholder-item.component';
export * from './common-len-form-label/common-len-form-label.component';
export * from '../containers/preview-pane/preview-item/preview-group-buy-list/sub';
export * from './layout-magic/layout-magic.component';
export * from './video-upload/video-upload.component';
export * from './brand-selector/brand-selector.component';
