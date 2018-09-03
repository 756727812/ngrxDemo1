import { EditorService } from './editor.service';
import { AddItemsService } from './add-items.service';
import { CtrlPaneService } from './ctrl-pane.service';

export const services: any[] = [
  EditorService,
  AddItemsService,
  // CtrlPaneService,
];

export * from './add-items.service';
export * from './editor.service';
// export * from './ctrl-pane.service';
