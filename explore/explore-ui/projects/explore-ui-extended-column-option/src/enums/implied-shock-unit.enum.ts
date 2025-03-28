import {ScenarioConstants} from '../constants/scenario.constant';

export enum ImpliedShockUnitEnum {
    FACTOR_SPECIFIC = 'FACTOR_SPECIFIC',
    NUMBER_OF_STD_DEVS = 'NUMBER_OF_STD_DEVS',
    FACTOR_LEVELS = 'FACTOR_LEVELS',
    DXS_FACTOR_PCT_SPREAD = 'DXS_FACTOR_PCT_SPREAD',
}

export function getImpliedShockUnitEnumValue(impliedShockUnit: ImpliedShockUnitEnum, dxsFactorUnit: string): ImpliedShockUnitEnum {
    if (impliedShockUnit === ImpliedShockUnitEnum.FACTOR_SPECIFIC) {
        if (dxsFactorUnit === ScenarioConstants.DXS_SHOCK_UNIT.PERCENTAGE_OF_SPREAD) {
            return ImpliedShockUnitEnum.DXS_FACTOR_PCT_SPREAD;
        } else {
            return ImpliedShockUnitEnum.FACTOR_SPECIFIC;
        }
    }
    return impliedShockUnit;
}

export function getImpliedAndDxShockValues(impliedShockUnit: string): { impliedShockUnit: ImpliedShockUnitEnum, dxsShockUnit: string} {
    const data: any = {};
    if (impliedShockUnit === ImpliedShockUnitEnum.DXS_FACTOR_PCT_SPREAD) {
        data.impliedShockUnit = ImpliedShockUnitEnum.FACTOR_SPECIFIC;
        data.dxsShockUnit = ScenarioConstants.DXS_SHOCK_UNIT.PERCENTAGE_OF_SPREAD;
    } else if (impliedShockUnit === ImpliedShockUnitEnum.FACTOR_SPECIFIC) {
        data.impliedShockUnit = ImpliedShockUnitEnum.FACTOR_SPECIFIC;
        data.dxsShockUnit = ScenarioConstants.DXS_SHOCK_UNIT.SPREAD;
    } else {
        data.impliedShockUnit = impliedShockUnit as ImpliedShockUnitEnum;
    }
    return data;
}
