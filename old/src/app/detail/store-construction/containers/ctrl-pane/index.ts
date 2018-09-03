import { CtrlPaneComponent } from './ctrl-pane.component';
import { CtrlWidgetOutletComponent } from './sub/ctrl-widget-outlet.component';

import { components } from './sub';

export default [CtrlPaneComponent, CtrlWidgetOutletComponent, ...components];

export * from './sub/ctrl-widget-outlet.component';
export * from './sub/basic-info/basic-info.component';
export * from './sub';
