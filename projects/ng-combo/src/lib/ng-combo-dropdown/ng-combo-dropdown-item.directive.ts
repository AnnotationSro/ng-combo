import {Directive, ElementRef} from "@angular/core";
import {ComboItem} from "../types";


interface NgComboDropdownItemContext {
  $implicit: ComboItem<any>;
}

@Directive({
  selector: 'ng-template[ng-combo-dropdown-item]',
  standalone: true,
})
export class NgComboDropdownItemDirective {
  static ngTemplateContextGuard(
    dir: NgComboDropdownItemDirective,
    ctx: unknown
  ): ctx is NgComboDropdownItemContext {
    return true;
  }
}
