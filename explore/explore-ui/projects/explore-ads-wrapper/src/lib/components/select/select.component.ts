import { Component, EventEmitter, Input, Output } from '@angular/core';
import {AuxSelectOptionGroup, AuxSelectSelectionChangedDetailInterface} from '@blk/aladdin-angular-components';
export type SelectType = 'simple' | 'multiple' | 'filter-simple' | 'filter-multiple' | 'tabular';
export type SelectSize = "small" | "regular" | "large";
 
@Component({
    selector: 'explore-select',
    templateUrl: './select.component.html',
  })
  export class SelectComponent{
    @Output()
    selectionChanged = new EventEmitter<any | any[]>();
   
    @Input()
    data: AuxSelectOptionGroup[] = [];
 
    @Input()
    type: SelectType = 'simple';
 
    @Input()
    size: SelectSize = 'regular';
 
    @Input()
    hasInitialOptionPlaceholder?: boolean = true;
 
    @Input()
    label = '';
 
    @Input()
    isLeftLabel = false;

    @Input()
    valid = true;
 
    onValueChange(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>) {
        if (event.stopPropagation) {
            event.stopPropagation();
          }
        this.selectionChanged.emit(event);
    }
  }