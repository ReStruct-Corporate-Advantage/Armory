import {ColumnConfig, ColumnConstants, RequestParamsCreator, Serializable} from '@blk/explore-ui-core';
import {ColumnOptionConstants, ColumnSet} from '@blk/explore-ui-column-option';
import {getImpliedAndDxShockValues, getImpliedShockUnitEnumValue, ImpliedShockUnitEnum} from '../../enums/implied-shock-unit.enum';
import {isEmpty, isNil, isObject} from 'lodash';
import {ShockSettingColumnOption} from '../column-option/shock-setting-column-option.model';
import {ScenarioConstants} from '../../constants/scenario.constant';
import {Subject} from 'rxjs';

export class ImpliedShockScenario implements Serializable, RequestParamsCreator {

    columns: ColumnSet = new ColumnSet();
    impliedShockUnit: ImpliedShockUnitEnum = ImpliedShockUnitEnum.FACTOR_SPECIFIC;
    dxsShockUnit: string = ScenarioConstants.DXS_SHOCK_UNIT.PERCENTAGE_OF_SPREAD;
    restrictImpliedShocks: string[] = [];
    noiseDampening: string;
    isShockCorrelationsDateEnabled = false;
    shockCorrelationsDate: string;

    factorsUpdated$ = new Subject<void>();
    globalSettingsUpdated$ = new Subject<void>();

    constructor(data?: any) {
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    serialize() {
        throw new Error('Method not implemented.');
    }

    deserialize(data: any) {
        this.noiseDampening = data.noiseDampening;
        if (data.shockCorrelationsDate) {
            this.shockCorrelationsDate = data.shockCorrelationsDate;
            this.isShockCorrelationsDateEnabled = true;
        }
        if (data.restrictImpliedShocks) {
            this.restrictImpliedShocks = data.restrictImpliedShocks.split(ColumnOptionConstants.COMMA);
        }
        if (data.impliedShockUnit) {
            const shockUnits = getImpliedAndDxShockValues(data.impliedShockUnit);
            this.impliedShockUnit = shockUnits.impliedShockUnit;
            this.dxsShockUnit = shockUnits.dxsShockUnit;
        }
        if (data.impliedShocks) {
            data.impliedShocks.forEach((column: any) => {
                if (isNil(column.shockSettings)) {
                    column.shockSettings = {};
                }
                column.shockSettings.configType = ShockSettingColumnOption.CONFIG_TYPE;

                const col = new ColumnConfig({
                    columnTag: column.columnTag,
                    columnKey: this.getColKey(column),
                    columnTitle: this.getColTitle(column),
                    positionColumnType: ColumnConstants.FACTOR_MODEL,
                    optionValues: [
                        column.shockSettings,
                    ],
                });
                this.columns.columns.push(col);
            });
        }
    }

    private getColKey(column: any): string {
        if (column.columnKey) {
            return column.columnKey;
        }
        const colTagToUse = column.isCustomFactor ? ColumnConstants.CUSTOM_FACTOR_TAG : column.columnTag;
        return ColumnConfig.generateColumnKey(colTagToUse);
    }

    private getColTitle(column: any): string {
        if (column.isCustomFactor) {
            return ColumnConstants.CUSTOM_FACTOR_TITLE;
        }
        return (column.columnTitle ? column.columnTitle : column.columnTag);
    }

    addRequestParams(requestParams: any): void {
        if (this.noiseDampening) {
            requestParams.noiseDampening = this.noiseDampening;
        }
        if (this.restrictImpliedShocks.length > 0) {
            requestParams.restrictImpliedShocks = this.restrictImpliedShocks.join(',');
        }
        if (this.isShockCorrelationsDateEnabled && !isEmpty(this.shockCorrelationsDate)) {
            requestParams.shockCorrelationsDate = this.shockCorrelationsDate;
        }
        if (this.impliedShockUnit) {
            requestParams.impliedShockUnit = getImpliedShockUnitEnumValue(this.impliedShockUnit, this.dxsShockUnit);
        }
        if (this.columns.columns.length !== 0) {
            this.columns.addRequestParams(requestParams);
        }
    }

    getParamsForConversionToSpecified(): any {
        const params: any = {
            type: 'ImpliedScenario',
        };
        params.dxsShockUnit = (this.impliedShockUnit === ImpliedShockUnitEnum.FACTOR_SPECIFIC) ? (this.dxsShockUnit ?? ScenarioConstants.DXS_SHOCK_UNIT.PERCENTAGE_OF_SPREAD) : undefined;
        if (this.isShockCorrelationsDateEnabled && !isEmpty(this.shockCorrelationsDate))  {
            params.scenarioMatrixDateOverride = this.shockCorrelationsDate;
        }
        if (this.noiseDampening) {
            params.noiseDampening = this.noiseDampening;
        }
        if (this.restrictImpliedShocks.length > 0) {
            params.predictBlock = this.restrictImpliedShocks.join(',');
        }

        let shockUnit: string;
        switch (this.impliedShockUnit) {
            case ImpliedShockUnitEnum.FACTOR_LEVELS: shockUnit = 'lvl';
                break;
            case ImpliedShockUnitEnum.NUMBER_OF_STD_DEVS: shockUnit = 'std';
                break;
            default: shockUnit = '';
        }

        if (this.columns.columns.length > 0) {
            const inputShocks: string[] = [];
            const mappingBlocks: string[] = [];
            this.columns.columns.forEach(column => {
                const shockColumnOption = column.optionValues.find(optionValue => optionValue.configType === ShockSettingColumnOption.CONFIG_TYPE) as ShockSettingColumnOption;
                if (!isNil(shockColumnOption?.shock)) {
                    inputShocks.push(column.columnTag + ':' + shockColumnOption.shock + shockUnit);
                }
                if (!isNil(shockColumnOption?.restrictImpliedShocks)) {
                    shockColumnOption.restrictImpliedShocks.forEach(restrictShock => {
                        mappingBlocks.push(column.columnTag + '|' + restrictShock);
                    });
                }
            });
            // format : 'inputShocks': 'USD_3m:3bps&USD_1yr:2bps',
            if (inputShocks.length > 0) {
                params.inputShocks = inputShocks.join('&');
            }

            // format : 'mappingBlock': 'SPX|FMI_WRLD_LEVERAGE&SPX|FMI_WRLD_VOLATILITY&FMI_WRLD_USA|FMI_WRLD_VOLATILITY',
            if (mappingBlocks.length > 0) {
                params.mappingBlock = mappingBlocks.join('&');
            }
        }

        return params;
    }

    getDxsShockUnitValue(): string {
        return this.impliedShockUnit === ImpliedShockUnitEnum.FACTOR_SPECIFIC && !isEmpty(this.dxsShockUnit) ? this.dxsShockUnit : ScenarioConstants.DXS_SHOCK_UNIT.PERCENTAGE_OF_SPREAD;
    }
}
