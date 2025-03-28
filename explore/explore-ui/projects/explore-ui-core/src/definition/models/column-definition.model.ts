import {ColumnFormat} from './column-format/column-format.model';
import {Setting} from '../../core/models/setting.model';
import {CoreColumnDefUtils} from '../../column/core-column-def.utils';
import {ConfigTypeFactory} from '../../favorite/factories';
import {isNil} from 'lodash';
import {CoreColumnConstants} from '../../core/constants';

/**
 * Column definition model
 */
export class ColumnDefinition extends Setting {

    columnTag: string;
    aliasTags: string[];
    mappedColTags: string[];
    field: string;
    title: string;
    uses: string;
    isSubtotalable: boolean;
    reportTypes: string[];
    columnReports: string[];
    dataType: string;
    columnType: string;
    isNotSupportedInCustomCal: boolean;
    groups: string[];
    columnFormat: ColumnFormat;
    isGroupable: boolean;
    isVisible: boolean;
    isStaticColumn: boolean;
    columnDesc: string;
    functionFlag: number;
    strippedName: string;
    praadaBreakdown: boolean;
    isMacroFactor: boolean;
    isRASColumn: boolean;
    isEATBreakdownDefinition: boolean;
    forTopdown: boolean;

    /**
     * Deserialize col into col definition model
     */
    doDeserialize(col: any): void {
        this.columnTag = col.columnTag;
        this.aliasTags = col.aliasTags;
        this.mappedColTags = col.mappedColTags;
        this.field = col.field;
        this.title = col.title;
        this.uses = col.uses;
        this.isSubtotalable = isNil(col.isSubtotalable) ? true : col.isSubtotalable;
        this.reportTypes = col.reportTypes;
        this.columnReports = col.columnReports;
        this.dataType = isNil(col.dataType) ? 'DOUBLE' : col.dataType;
        this.columnType = col.columnType;
        this.isNotSupportedInCustomCal = isNil(col.isNotSupportedInCustomCal) ? false : col.isNotSupportedInCustomCal;
        this.groups = col.groups;
        this.isGroupable = isNil(col.isGroupable) ? true : col.isGroupable;
        this.forTopdown = isNil(col.forTopdown) ? false : col.forTopdown;
        this.isVisible = isNil(col.isVisible) ? true : col.isVisible;
        this.isStaticColumn = isNil(col.staticColumn) ? false : col.staticColumn;
        this.columnDesc = col.columnDesc;
        this.functionFlag = col.functionFlag;
        this.strippedName = CoreColumnDefUtils.getStrippedName(col.title);
        this.praadaBreakdown = col.praadaBreakdown;
        this.isMacroFactor = col.isMacroFactor;
        this.isRASColumn = isNil(col.isRASColumn) ? false : col.isRASColumn;
        this.isEATBreakdownDefinition = isNil(col.isEATBreakdownDefinition) ? false : col.isEATBreakdownDefinition;
        if (col.columnFormat) {
            this.columnFormat = ConfigTypeFactory.createConfig(col.columnFormat, col.columnFormat.configType);
        }
    }

    /**
     * return path of column example: Performance / Return
     */
    getColumnPath(): string {
        return this.groups && this.groups.length ? [...this.groups, this.title].join(' / ') : this.title;
    }

    isHVaRColumn(): boolean {
        return this.groups?.join(',') === CoreColumnConstants.RAS_COL_GROUPS.HVAR;
    }

    isMCVaRColumn(): boolean {
        return this.groups?.join(',') === CoreColumnConstants.RAS_COL_GROUPS.MCVAR;
    }

    isIRRColumn(): boolean {
        return this.groups?.join(',').startsWith(CoreColumnConstants.RAS_COL_GROUPS.IRR);
    }

    isCreditVaRColumn(): boolean {
        return this.groups?.join(',').startsWith(CoreColumnConstants.CREDIT_VAR_GROUP);
    }
}

