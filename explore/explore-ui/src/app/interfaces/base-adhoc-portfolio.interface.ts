import {AdhocPortParams} from '@models/portfolio/adhocModelling/adhoc-port-params.model';
import {cloneDeep} from 'lodash';

/*
Interface to represent common members of AdhocPortfolio and AdhocPortGroup
Adhoc Portfolio -> PositionBasedPortfolio
Adhoc PortGroup -> RuleBasedPortfolio
 */
export interface BaseAdhocPortfolio {
    adhocParams: AdhocPortParams;
}

export function isAdhocPort(object: any): object is BaseAdhocPortfolio {
    return 'adhocParams' in object;
}

export function deserializeAdhocParams(data: any, adhocParams: AdhocPortParams): AdhocPortParams {
    if (!adhocParams) {
        // let AdhocPortParams take care of deserializing
        return new AdhocPortParams(data.adhocParams);
    }

    return adhocParams;
}

export function serializeAdhocParamsAndConfigType(configType: string, adhocParams: AdhocPortParams): any {
    return {
        configType: configType,
        adhocParams: adhocParams.serialize()
    }
}

export function copyAdhocParams(source: BaseAdhocPortfolio): AdhocPortParams {
    return cloneDeep(source.adhocParams);
}


export function adhocParamsEquals(obj: BaseAdhocPortfolio, adhocParams: AdhocPortParams): boolean {
    if ((!adhocParams && obj.adhocParams) || (adhocParams && !obj.adhocParams)) {
        return false;
    }

    return !(adhocParams && obj.adhocParams && !adhocParams.equals(obj.adhocParams));
}

