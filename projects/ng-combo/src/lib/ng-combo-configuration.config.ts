import {Injectable, ModuleWithProviders, NgModule, Provider} from "@angular/core";

export interface NgComboConfigurationConfig {
  i18n: NgComboConfigurationI18n;
  styles: NgComboConfigurationStyles;
}

export interface NgComboConfigurationI18n {
  loadingText: string;
}

export interface NgComboConfigurationStyles {
  dropdownIcon: string;
  loadingIcon: string;
}


@Injectable({providedIn: 'root'})
export class NgComboConfigurationProvider{
  get config(): NgComboConfigurationConfig {
    // return default config
    return {
      i18n: {
        loadingText: 'Loading, please wait...',
      },
      styles: {
        dropdownIcon: 'fa-solid fa-chevron-down',
        loadingIcon: 'fa-solid fa-spinner fa-spin',
      }
    };
  }
}

export class LibConfiguration {
  config?: Provider;
}
