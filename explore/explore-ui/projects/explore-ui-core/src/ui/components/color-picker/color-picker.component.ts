import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {
    AuxColorPickerColorModel,
    AuxColorPickerEventDetailInterface,
    AuxColorPickerIconEnum
} from '@blk/aladdin-angular-components';

@Component({
    selector: 'explore-core-color-picker',
    templateUrl: './color-picker.component.html',
    styleUrls: ['./color-picker.component.scss']
})
export class ColorPickerComponent implements OnChanges {

    /** Color of the color picker */
    @Input()
    color: string;
    /** Emits when the value of the color picker changes */
    @Output()
    colorChange = new EventEmitter<string>();

    /** Label placed above the color picker */
    @Input()
    label: string;

    @Input()
    icon: AuxColorPickerIconEnum;

    /** Whether or not to disable the color picker and prevent color from being changed */
    @Input()
    isDisabled = false;

    colorModel = AuxColorPickerColorModel.RGB;

    hexValue: string;

    presetColorsHex = ['#C5FBCF', '#FFBBBB', '#8B0000', '#FF0000', '#FFA500', '#FFFF00', '#90EE90', '#00FF00', '#ADD8E6', '#0000FF', '#00008B', '#A020F0'];

    // Regex to enforce rgb(x,x,x) input format
    private rgbRegex = /rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)/;

    private hexRegex = /^#[0-9A-F]{6}$/i;

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.color && changes.color.currentValue) {
            if (this.rgbRegex.test(changes.color.currentValue)) {
                this.hexValue = this.rgbToHex(changes.color.currentValue);
            } else if (this.hexRegex.test(changes.color.currentValue)) {
                this.hexValue = changes.color.currentValue;
            }
        }
    }

    /**
     * convert rgb string for example rgb(180, 51, 51) to hex code which is accepted by aux color picker
     */
    rgbToHex(rgb: string) {
        rgb = rgb.split('(')[1].split(')')[0];
        let rgbColorArr = rgb.split(',');
        rgbColorArr = rgbColorArr.map(value => {
            // tslint:disable-next-line:radix
            value = parseInt(value).toString(16);
            return (value.length === 1) ? '0' + value : value;
        });

       return '#' + rgbColorArr.join('');
    }

    changeColor(event: CustomEvent<AuxColorPickerEventDetailInterface>) {
        const rgbArray = event?.detail?.color?.rgb;
        if (rgbArray) {
            this.color = 'rgb' + '(' + rgbArray.join(',') + ')';
            this.colorChange.emit(this.color);
        }
    }
}
