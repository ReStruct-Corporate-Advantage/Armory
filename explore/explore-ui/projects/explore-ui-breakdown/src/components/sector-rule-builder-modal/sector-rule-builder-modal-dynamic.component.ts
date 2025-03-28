import {SectorRuleBuilderConfig} from '../../models/sector/sector-rule-builder-config.model';
import {ColumnSectorRule} from '../../models/sector/column-sector/column-sector-rule.model';
import {GroupRule} from '../../models/sector/group-rule.model';
import {Observable} from 'rxjs';
import {Rule} from '../../interfaces/rule.interface';

export interface SectorRuleBuilderModalDynamicComponent {
    sectorRuleBuilderConfig: SectorRuleBuilderConfig;
    /**
     * Method to open dialog to edit/update Column Sector Rule
     */
    openDialog(sectorRuleBuilderConfig: SectorRuleBuilderConfig, rule: ColumnSectorRule | GroupRule): Observable<Rule>;
}
