import {
  Component, ContentChild,
  ElementRef, EventEmitter,
  Input, OnChanges,
  OnDestroy,
  OnInit, Output,
  SimpleChanges,
  TemplateRef,
} from '@angular/core';
import {JsonPipe, NgClass, NgTemplateOutlet} from "@angular/common";
import {ComboItem} from "./types";
import {NgComboDropdownComponent} from "./ng-combo-dropdown/ng-combo-dropdown.component";
import {NgComboDropdownItemDirective} from "./ng-combo-dropdown/ng-combo-dropdown-item.directive";
import {FormsModule} from "@angular/forms";
import {NgComboConfigurationProvider} from "./ng-combo-configuration.config";


@Component({
  selector: 'ng-combo',
  standalone: true,
  imports: [
    NgClass,
    NgTemplateOutlet,
    JsonPipe,
    NgComboDropdownComponent,
    NgComboDropdownItemDirective,
    FormsModule
  ],
  templateUrl: './ng-combo.component.html',
  styleUrls: ['./variables.css', './ng-combo.component.scss'],
  providers: [{
    provide: NgComboConfigurationProvider,
    useClass: NgComboConfigurationProvider
  }]
})
export class NgComboComponent<CODE> implements OnInit, OnDestroy {
  @Input()
  inputIconCss?: string;

  @Input()
  valueList?: ComboItem<CODE>[];

  @Input()
  valueListLoader?: (query: string | null) => Promise<ComboItem<CODE>[]>;

  @Input()
  selectedValueLoader?: (codes: CODE[] | CODE) => Promise<ComboItem<CODE>[]>;

  @ContentChild(NgComboDropdownItemDirective, {read: TemplateRef})
  dropdownItemTemplateRef?: TemplateRef<unknown>;

  internalValueList: ComboItem<CODE>[] | null = null;
  dropdownVisible = false;

  query: string | null = null;

  onClickOutsideFnRef: any | null = null;
  loadingDropdownItems: boolean = false;

  @Input()
  cached: boolean = false;

  @Input()
  multi: boolean = false;

  @Input()
  searchable = false;

  _selectedObj: ComboItem<CODE>[] | null = null;

  internalSelected: ComboItem<CODE>[] = [];

  label: string = '';


  @Input()
  get selected(): CODE | CODE[] | null {
    if (this._selectedObj === null) {
      return null;
    }
    if (this.multi === true) {
      return this._selectedObj.map(i => i.code);
    }
    return this._selectedObj[0].code;
  }

  set selected(newSel: CODE | CODE[] | null) {
    if (newSel === null) {
      this._selectedObj = null;
      this.selectedChanged();
    } else {
      this.fetchObjsForCode(newSel!).then(() => {
        this.selectedChanged();
      }).catch((e) => {
        console.error('[NgCombo] Error while fetchin selected objects for code/codes: ' + JSON.stringify(newSel), e);
      })
    }

  }

  @Input()
  get selectedObj(): ComboItem<CODE> | ComboItem<CODE>[] | null {
    if (this._selectedObj === null) {
      return null;
    }
    if (this.multi === true) {
      return this._selectedObj;
    }
    return this._selectedObj[0];
  }

  set selectedObj(newSel: ComboItem<CODE> | ComboItem<CODE>[] | null) {
    if (newSel === null) {
      this._selectedObj = null;
    } else {
      if (this.multi === true) {
        this._selectedObj = newSel as ComboItem<CODE>[];
      } else {
        if (Array.isArray(newSel)) {
          this._selectedObj = newSel;
        } else {
          this._selectedObj = [newSel];
        }

      }
    }
    this.selectedChanged();
  }

  @Output()
  onSelectedSingle = new EventEmitter<CODE | null>();

  @Output()
  selectedChange = new EventEmitter<CODE | CODE[] | null>();

  @Output()
  onSelectedItemSingle = new EventEmitter<ComboItem<CODE> | null>();

  @Output()
  onSelectedMulti = new EventEmitter<CODE[] | null>();

  @Output()
  onSelectedItemMulti = new EventEmitter<ComboItem<CODE>[] | null>();

  inputText: string = '';

  get normalizedQuery(): string | null {
    if (this.query === '') {
      return null;
    }
    return this.query;
  }


  constructor(private element: ElementRef, private config: NgComboConfigurationProvider) {
    this.inputIconCss = this.inputIconCss ?? this.config.config.styles.dropdownIcon;
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.onClickedOutsideListener);
  }


  async ngOnInit() {
    if (!this.valueList && !this.valueListLoader) {
      throw new Error('[NgCombo] Neither valueList and valueListLoader is defined - you have to provide either one of them (not both)');
    }
    if (!!this.valueList && !!this.valueListLoader) {
      throw new Error('[NgCombo] Both valueList and valueListLoader are defined - you have to provide either one of them (not both)');
    }
  }

  initValueList(useCached = this.cached): Promise<void> {
    return new Promise((resolveInit, rejectInit) => {
      if (!!this.valueList) {
        this.internalValueList = this.valueList!;
        resolveInit();
        return;
      } else {
        if (useCached && !!this.internalValueList) {
          resolveInit();
          return;
        }
        this.loadingDropdownItems = true;
        this.valueListLoader!(this.normalizedQuery).then((result) => {
          this.internalValueList = result;
          resolveInit();
        }).catch((err) => {
          console.error('[NgCombo] valueListLoader fails with error', err);
          rejectInit('[NgCombo] valueListLoader fails with error: ' + JSON.stringify(err));
        }).finally(() => {
          this.loadingDropdownItems = false;
        })
      }
    });
  }

  onClickedOutsideListener(e: MouseEvent) {
    if (e.target != this.element.nativeElement && !this.element.nativeElement.contains(e.target)) {
      this.onDropdownHide();
      document.removeEventListener('click', this.onClickOutsideFnRef);
      this.onClickOutsideFnRef = null;
    }
  }

  onDropdownShow() {
    this.initValueList();

    this.dropdownVisible = true;
    setTimeout(() => {
      this.onClickOutsideFnRef = this.onClickedOutsideListener.bind(this);
      document.addEventListener('click', this.onClickOutsideFnRef);
    }, 100); //wait a while to prevent accidentally closing dropdown right after it is shown
    this.inputText = this.query ?? '';
  }

  onDropdownHide() {
    this.dropdownVisible = false;
    this.updateLabel();
    this.inputText = this.label;
  }

  onQueryChanged() {
    this.internalValueList = null;
    this.initValueList();
  }

  private async selectedChanged() {
    if (this.selected === null) {
      this.internalSelected = [];
      return;
    }

    let sel = this.internalValueList?.filter(item => (this._selectedObj ?? []).map(o => o.code).includes(item.code));
    if (typeof sel !== 'undefined') {
      this.internalSelected = sel ? sel : [];
      this.updateLabel();
      return;
    }
    //selected value is not in valueList - this happens when combobox has just initialized
    //there is selected value, but valueList is not lazy fetched via valueListLoader

    // TODO zavolat dalsi callback, ktory vyhlada item podla CODE
    // await this.initValueList(true);
    this.updateLabel();
  }

  updateLabel() {
    let label;
    if (this.internalSelected.length === 0) {
      label = '';
    } else {
      if (this.multi) {
        label = this.internalSelected.map(i => i.label).join(', ');
      } else {
        label = this.internalSelected[0].label;
      }
    }
    this.label = label;
  }

  public addOrRemoveSelectedItem(item: ComboItem<CODE>) {
    if (!this.multi) {
      this.internalSelected = [];
    }
    let found = this.internalSelected.findIndex(i => item.code === i.code);
    if (found < 0) {
      this.internalSelected.push(item);
    } else {
      this.internalSelected.splice(found, 1);
    }
    if (this.multi) {
      this.onSelectedMulti.emit(this.internalSelected.map(i => i.code));
      this.onSelectedItemMulti.emit(this.internalSelected);
      this.selectedChange.emit(this.internalSelected as CODE[]);
    } else {
      if (this.internalSelected.length === 0) {
        this.onSelectedSingle.emit(null);
        this.onSelectedItemSingle.emit(null);
        this.selectedChange.emit(null);
      } else {
        this.onSelectedSingle.emit(this.internalSelected.map(i => i.code)[0]);
        this.onSelectedItemSingle.emit(this.internalSelected[0]);
        this.selectedChange.emit(this.internalSelected[0] as CODE);
      }
    }

  }

  async fetchObjsForCode(codes: CODE[] | CODE): Promise<void> {
    if (!!this.valueList) {
      let c = Array.isArray(codes) ? codes : [codes];
      this.selectedObj = this.valueList.filter(o => c.includes(o.code));
    } else {
      if (typeof this.selectedValueLoader === 'undefined') {
        console.log('[NgCombo] selectedValueLoader() not defined');
        throw new Error('[NgCombo] selectedValueLoader() not defined');
      }
      let selectedObjs = await this.selectedValueLoader(codes);
      this.selectedObj = selectedObjs;
    }
  }
}
