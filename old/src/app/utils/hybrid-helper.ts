import {
  downgradeComponent,
  downgradeInjectable,
} from '@angular/upgrade/static';
import { FactoryProvider } from '@angular/core';
import * as angular from 'angular';

export interface IComponentUpgradeOptions {
  inputs?: string[];
  outputs?: string[];
}

export interface IHybridHelper {
  downgradeComponent(
    moduleName: string,
    componentSelector: string,
    componentClass: any,
    options?: IComponentUpgradeOptions,
  ): IHybridHelper;
  downgradeProvider(
    moduleName: string,
    providerName: string,
    providerClass: any,
  ): IHybridHelper;
  buildProviderForUpgrade(ng1Name: string, ng2Name?: string): FactoryProvider;
}

export const HybridHelper: IHybridHelper = {
  /**
   * 封装组件降级
   */
  downgradeComponent: (
    moduleName: string,
    componentName: string,
    componentClass: any,
    options?: IComponentUpgradeOptions,
  ): IHybridHelper => {
    options = options || {}; // tslint:disable-line no-parameter-reassignment
    const inputs = options.inputs || [];
    const outputs = options.outputs || [];
    const component = componentClass;

    angular.module(moduleName).directive(componentName, downgradeComponent({
      component,
      inputs,
      outputs,
    }) as angular.IDirectiveFactory);

    return HybridHelper;
  },

  /**
   * 封装 DI 降级
   */
  downgradeProvider: (
    moduleName: string,
    providerName: string,
    providerClass: any,
  ): IHybridHelper => {
    angular
      .module(moduleName)
      .factory(providerName, downgradeInjectable(providerClass));

    return HybridHelper;
  },

  /**
   * 封装 ng2 调用的 ng1 DI 模块
   */
  buildProviderForUpgrade: (
    ng1Name: string,
    ng2Name?: string,
  ): FactoryProvider => {
    ng2Name = ng2Name || ng1Name; // tslint:disable-line no-parameter-reassignment

    return {
      provide: ng2Name,
      useFactory: buildFactoryForUpgradeProvider(ng1Name),
      deps: ['$injector'],
    };
  },
};

function buildFactoryForUpgradeProvider(ng1Name: string): Function {
  return (injector: any) => injector.get(ng1Name);
}
