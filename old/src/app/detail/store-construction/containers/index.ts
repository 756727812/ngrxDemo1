import { EditorComponent } from './editor/editor.component';
import { EditorPostPayComponent } from './editor-post-pay/editor-post-pay.component';
import { ResPaneComponent } from './res-pane/res-pane.component';
import { PreviewPaneComponent } from './preview-pane/preview-pane.component';
import fromCtrlPane from './ctrl-pane';
import fromPreviewPane from './preview-pane';
import { ResourceNicheManagementComponent } from './resource-niche-management/resource-niche-management.component';

export const containers: any[] = [
  EditorComponent,
  EditorPostPayComponent,
  ResPaneComponent,
  PreviewPaneComponent,
  ResourceNicheManagementComponent,
  ...fromCtrlPane,
  ...fromPreviewPane,
];

export * from './editor/editor.component';
export * from './editor-post-pay/editor-post-pay.component';
export * from './res-pane/res-pane.component';
export * from './preview-pane/preview-pane.component';
export * from './ctrl-pane';
export * from './preview-pane';
export * from './resource-niche-management/resource-niche-management.component';
