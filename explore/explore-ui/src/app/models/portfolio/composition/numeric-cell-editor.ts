import {ICellEditorComp, ICellEditorParams} from 'ag-grid-community';
import {isUndefined} from 'lodash';
import {NumberUtils} from '@utils/number.utils';
import {CoreColumnUtils, CoreCommonConstants, NumericColumnFormat} from '@blk/explore-ui-core';
import {CommonConstants} from '@constants/common.constants';

/**
 * Numeric cell editor to editable ag-grid cells in composition table
 */
export class NumericCellEditor  implements ICellEditorComp {
    eInput: HTMLInputElement;
    cancelBeforeStart = true;
    currentValue: number;

    init(params: ICellEditorParams) {
        // create the cell
        this.eInput = document.createElement('input');
        this.eInput.style.textAlign = 'right';
        this.eInput.style.height =  '100%';
        this.eInput.style.width =  '100%';
        this.eInput.style.borderWidth = '0.25px';
        this.eInput.autofocus = true;

        if (this.isCharNumeric(params.eventKey)) {
            this.eInput.value = params.eventKey;
        } else {
            const val = isUndefined(params.value) ? 0 : Number((parseFloat(params.value)));
            if (isNaN(val)) {
                this.eInput.value = '0.0';
            } else {
                this.eInput.value = val.toFixed(6);
            }
        }
        this.currentValue = NumberUtils.parseNumberString(this.eInput.value);

        this.eInput.addEventListener('keypress', keyPressEvent => {
            // Only allow numerals for percentage column and numberals, 'm', 'b' for non percent columns
            const colDef = CoreColumnUtils.getColumnDefByTag(params.colDef[CommonConstants.COLUMN_TAG]);
            if (!this.isCharNumeric(keyPressEvent.key) && ((colDef?.columnFormat as NumericColumnFormat)?.scalingFactor === 0.01 || !this.isCharMOrB(keyPressEvent.key))) {
                this.eInput.focus();
                if (keyPressEvent.preventDefault) {
                    keyPressEvent.preventDefault();
                }
            }
        });

        this.eInput.addEventListener('blur', () => params.stopEditing());

        // only start edit if key pressed is a number, not a letter
        this.cancelBeforeStart = isNaN(Number(params.eventKey));
    }

    // gets called once when grid ready to insert the element
    getGui(): HTMLElement {
        return this.eInput;
    }

    // focus and select can be done after the gui is attached
    afterGuiAttached(): void {
        this.eInput.select();
    }

    getValue(): any {
        if (this.eInput.value === '-' || this.eInput.value === '+') {
            return this.currentValue;
        }
        return (this.eInput.value[0] === '+' ? this.currentValue : 0) + NumberUtils.parseNumberString(this.eInput.value);
    }

    /**
     * checks if entered char is m or b
     */
    isCharMOrB(charStr: string): boolean {
        return (charStr === 'm' || charStr === 'M' || charStr === 'b' || charStr === 'B');
    }


    isCharNumeric(charStr: string): boolean {
        if (charStr === '.' || charStr === '-' || charStr === '+') {
            return true;
        }
        return !!/\d/.test(charStr);
    }

    // returns the new value after editing
    isCancelBeforeStart = () => this.cancelBeforeStart;
}
