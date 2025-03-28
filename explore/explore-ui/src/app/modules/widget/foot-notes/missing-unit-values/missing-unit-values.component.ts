import {Component, Input, OnInit} from '@angular/core';

@Component({
        selector: 'app-missing-unit-values',
        templateUrl: './missing-unit-values.component.html'
})
export class MissingUnitValuesComponent implements OnInit {

        @Input() missingUnitValues: string[];

        constructor() {
            // empty constructor
        }

        ngOnInit(): void {
            // Do nothing on init
        }

}
