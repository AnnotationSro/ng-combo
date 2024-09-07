import {AfterViewInit, Component, OnInit} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {NgComboComponent} from "../../projects/ng-combo/src/lib/ng-combo.component";
import {ComboItem} from "../../projects/ng-combo/src/lib/types";
import {
  NgComboDropdownItemDirective
} from "../../projects/ng-combo/src/lib/ng-combo-dropdown/ng-combo-dropdown-item.directive";
import {JsonPipe} from "@angular/common";
import {NgComboConfigurationProvider} from "../../projects/ng-combo/src/lib/ng-combo-configuration.config";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgComboComponent, NgComboDropdownItemDirective, JsonPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit {
  valueList: ComboItem<number>[];
  selected1: number | null = null;
  selected2: number = 2;

  constructor(public conf: NgComboConfigurationProvider) {
    this.valueList = [{
      code: 1,
      label: 'item 1'
    }, {
      code: 2,
      label: 'item 2'
    }, {
      code: 3,
      label: 'item 3'
    }, {
      code: 4,
      label: 'item 4 - this is a very long text - but really very very long text'
    }];
  }

  ngAfterViewInit(): void {
  }

  onValueListFetch = (query: (string | null)): Promise<ComboItem<any>[]> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        let list = JSON.parse(JSON.stringify(this.valueList)) as ComboItem<number>[];
        resolve(list.map((i) => {
          i.label = i.label + '_async_' + query;
          return i;
        }));
      }, 2_000);
    });
  }

  onSelectedItem(sel: ComboItem<number> | null) {
    alert('Selected item: ' + JSON.stringify(sel));
  }

  onSelectedCode(sel: number | null) {
    alert('Selected code: ' + sel);
  }
}
