import {
  Directive,
  OnChanges,
  Input,
  ComponentRef,
  ViewContainerRef,
  Compiler,
  ModuleWithComponentFactories,
  Component,
  NgModule,
  Type,
} from '@angular/core';
import { SharedModule } from '@shared/shared.module';

/**
 * 注意：具体哪个模块使用到再 import，避免循环依赖
 */
@Directive({
  selector: '[compile]',
})
export class CompileDirective implements OnChanges {
  @Input() compile: string;
  @Input() compileContext: any;

  compRef: ComponentRef<any>;

  constructor(private vcRef: ViewContainerRef, private compiler: Compiler) {}

  ngOnChanges() {
    if (!this.compile) {
      if (this.compRef) {
        this.updateProperties();
        return;
      }
      throw Error('You forgot to provide template');
    }

    this.vcRef.clear();
    this.compRef = null;

    const component = this.createDynamicComponent(this.compile);
    const module = this.createDynamicModule(component);
    this.compiler
      .compileModuleAndAllComponentsAsync(module)
      .then((moduleWithFactories: ModuleWithComponentFactories<any>) => {
        const compFactory = moduleWithFactories.componentFactories.find(
          x => x.componentType === component,
        );

        this.compRef = this.vcRef.createComponent(compFactory);
        this.updateProperties();
      })
      .catch(error => {
        console.log(error);
      });
  }

  updateProperties() {
    for (const prop in this.compileContext) {
      this.compRef.instance[prop] = this.compileContext[prop];
    }
  }

  private createDynamicComponent(template: string) {
    @Component({
      template,
      selector: 'custom-dynamic-component',
    })
    class CustomDynamicComponent {}
    return CustomDynamicComponent;
  }

  private createDynamicModule(component: Type<any>) {
    @NgModule({
      imports: [SharedModule],
      declarations: [component],
    })
    class DynamicModule {}
    return DynamicModule;
  }
}
