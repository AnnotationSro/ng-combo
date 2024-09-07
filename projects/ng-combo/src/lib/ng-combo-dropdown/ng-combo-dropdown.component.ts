import {AfterViewInit, Component, ElementRef, Input, OnDestroy, TemplateRef, ViewChild} from '@angular/core';
import {NgClass, NgTemplateOutlet} from "@angular/common";
import {ComboItem} from "../types";
import {createPopper, Instance} from "@popperjs/core";
import {NgComboConfigurationProvider} from "../ng-combo-configuration.config";
import {NgComboComponent} from "../ng-combo.component";
// import {createPopper} from "@popperjs/core/lib/popper-lite";
// import {flip, preventOverflow} from "@popperjs/core";

@Component({
  selector: 'ng-combo-dropdown',
  standalone: true,
  imports: [
    NgTemplateOutlet,
    NgClass
  ],
  templateUrl: './ng-combo-dropdown.component.html',
  styleUrl: './ng-combo-dropdown.component.scss'
})
export class NgComboDropdownComponent<CODE> implements AfterViewInit, OnDestroy {

  @Input()
  dropdownItemTemplate: TemplateRef<unknown> | undefined = undefined;

  @Input()
  inputWrapper: HTMLDivElement | undefined;

  @ViewChild('defaultDropdownItem')
  defaultDropdownItem?: TemplateRef<ElementRef>;

  @ViewChild('dropdown')
  dropdownElement?: ElementRef<HTMLDivElement>;

  popperInstance: Instance | null= null;

  hoveredItemIndex?: number;

  constructor(public config: NgComboConfigurationProvider, public ngComboComponent: NgComboComponent<CODE>) {
  }

  ngOnDestroy(): void {
    if (this.popperInstance) {
      this.popperInstance.destroy();
      this.popperInstance = null;
    }
  }

  ngAfterViewInit(): void {
    this.popperInstance = createPopper(this.inputWrapper!, this.dropdownElement!.nativeElement, {
        placement: 'bottom-start',
        modifiers: [
          {
            name: 'flip',
            options: {
              fallbackPlacements: ['top-start', 'bottom-start'],

            },
          },
        ],
      });
  }

  onItemFocused(event: MouseEvent, index: number) {
    this.hoveredItemIndex = index;
  }

  clearFocus() {
    this.hoveredItemIndex = undefined;
  }

  onItemSelected(item: ComboItem<CODE>) {
    this.ngComboComponent.addOrRemoveSelectedItem(item);
    if (this.ngComboComponent.multi === false) {
      this.ngComboComponent.onDropdownHide();
    }
  }
}
