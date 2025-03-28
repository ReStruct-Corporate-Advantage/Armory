import { SerializeFavoriteType } from "@blk/explore-ui-core";
import { isObject } from "lodash";

export class DecarbPortfolioTarget {
    label:string;
    reductionPercent:number;
    startYear:string;
    targetYear:string;
    showDeleteButton: boolean;

    constructor(data?:any){
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    equals(target: DecarbPortfolioTarget): boolean{
        return this.label === target.label && this.reductionPercent === target.reductionPercent && this.startYear === target.startYear && this.targetYear === target.targetYear;
    }

    deserialize(data: any): void {
        this.label = data?.label;
        this.reductionPercent = data?.reductionPercent;
        this.startYear = data?.startYear;
        this.targetYear = data?.targetYear;
    }

    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        // only serialize if the scenario settings are valid
        if (!this.isValid()) {
            return undefined;
        }
        return {
            label: this.label,
            reductionPercent: this.reductionPercent,
            startYear: this.startYear,
            targetYear: this.targetYear
        };
    }

    isValid():boolean{
        return Boolean(this.label && this.reductionPercent && this.startYear && this.targetYear);
    }
}