import {AbstractConfig, RequestParamsCreator, SerializeFavoriteType} from '@blk/explore-ui-core';
import {isEmpty} from 'lodash';

export class DecisionLevelConfig extends AbstractConfig implements RequestParamsCreator {

    static readonly PORT_TREE_CAPTION: string = 'Portfolio tree';
    static readonly PORT_ATTRIBUTES_CAPTION: string = 'Portfolio attributes';

    arrangeByOption = 'Portfolio tree';
    portTreeDecisionLevelOption = 0;
    topDownCols: string[] = [];
    decisionBenchMap: Map<string, string> = new Map<string, string>();
    allSectorPaths: string[] = [];

    static isArrangedByTopdown(decisionLevelsConfig: DecisionLevelConfig): boolean {
        return !!decisionLevelsConfig.topDownCols?.length && !decisionLevelsConfig.topDownCols.every(col => col == null);
    }

    constructor(data?: any) {
        super();
        if (data) {
            this.deserialize(data);
        }
    }

    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        const serializedData: any = {};
        this.serializeContent(serializedData);
        const {isSectorView, isLookthroughEnabled, ltSecurityTypes, ...newSer} = serializedData;
        return newSer;
    }

    deserialize(data: any) {
        if (data) {
            if (data.hasOwnProperty('portTreeDecisionLevel')) {
                this.portTreeDecisionLevelOption = data.portTreeDecisionLevel;
            }
            if (data.hasOwnProperty('topDownCols')) {
                this.topDownCols = data.topDownCols;
                this.arrangeByOption = 'Portfolio attributes';
            }
            if (data.hasOwnProperty('decisionBenchMap') && !isEmpty(data.decisionBenchMap)) {
                const decisionBenchMapDeSer = JSON.parse(data.decisionBenchMap);
                this.decisionBenchMap = new Map<string, string>();
                Object.keys(decisionBenchMapDeSer).forEach(key => this.decisionBenchMap.set(key, decisionBenchMapDeSer[key]));
            }
        }
    }

    addRequestParams(requestParams: any, _paramName?: string, _isExportRequest?: boolean): void {
        this.serializeContent(requestParams);
        if (!requestParams?.isDecisionLevelData) {
            if (this.isEffectivelyArrangedByPortTree()) {
                delete requestParams.portTreeDecisionLevel;
            } else if (this.isEffectivelyArrangedByPortAttributes()) {
                requestParams.topDownColsForReporting = [...this.topDownCols];
                delete requestParams.topDownCols;
            }
        }
    }

    private serializeContent(data: any, _paramName?: string, _isExportRequest?: boolean) {
        if (this.isEffectivelyArrangedByPortTree()) {
            data.portTreeDecisionLevel = this.portTreeDecisionLevelOption;
        } else if (this.isEffectivelyArrangedByPortAttributes()) {
            data.topDownCols = [...this.topDownCols];
        }

        if (!!this.decisionBenchMap.size) {
            const decisionBenchMap: any = {};
            this.decisionBenchMap.forEach((value, key) => decisionBenchMap[key] = value);
            if (!!Object.keys(decisionBenchMap)?.length) {
                data.decisionBenchMap = JSON.stringify(decisionBenchMap);
            }
        }
    }

    public isEffectivelyArrangedByPortAttributes(): boolean {
        return this.arrangeByOption === DecisionLevelConfig.PORT_ATTRIBUTES_CAPTION && DecisionLevelConfig.isArrangedByTopdown(this);
    }

    public isEffectivelyArrangedByPortTree(): boolean {
        return this.arrangeByOption === DecisionLevelConfig.PORT_TREE_CAPTION && this.portTreeDecisionLevelOption > 0;
    }
}
