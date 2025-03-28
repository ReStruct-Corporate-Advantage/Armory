import {Component, Input} from '@angular/core';
import {OptimizationColDef} from '@optimization-settings-configuration/models/optimization-col-def';
import {Dictionary} from 'lodash';

@Component({
  selector: 'app-optimization-summary-grid',
  templateUrl: './optimization-summary-grid.component.html',
  styleUrls: ['./optimization-summary-grid.component.scss']
})
export class OptimizationSummaryGridComponent {
    @Input() data: Array<Dictionary<any>>;
    @Input() columns: OptimizationColDef[];
}
