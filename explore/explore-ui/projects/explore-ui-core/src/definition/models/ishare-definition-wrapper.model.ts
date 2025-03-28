import {IShareDefinition} from './ishare-definition.model';

export class IShareDefinitionWrapper {
    iShareDefinitions: IShareDefinition[] = [];

    /**
     * Deserialize def into ishare definition model
     */
    deserialize(iShareDef: any): void {
        let groups: string[] = [];
        this.doDeserialize(iShareDef, groups);
    }

    private doDeserialize(iShareDef: any, groups: string[]) {
        groups.push(iShareDef.name);
        if (iShareDef.data.length !== 0) {
            iShareDef.data.forEach(dataNode => {
                if (dataNode.cusip && dataNode.ticker) {
                    this.iShareDefinitions.push(new IShareDefinition(dataNode.ticker, dataNode.name, dataNode.cusip, [...groups]));
                } else {
                    this.doDeserialize(dataNode, groups);
                }
            });
        }
        groups.splice(groups.length - 1);
    }
}
