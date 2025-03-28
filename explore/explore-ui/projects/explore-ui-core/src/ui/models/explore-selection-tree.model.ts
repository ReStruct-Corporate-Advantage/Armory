import {AuxSelectionTreeInterface} from '@blk/aladdin-angular-components';

/**
 * Model class for selection tree in Explore
 */
export class ExploreSelectionTree implements AuxSelectionTreeInterface {
    label: string;
    children: ExploreSelectionTree[];
    eventData: any;
    tooltip: string;

    constructor(label: string) {
        this.label = label;
    }
}
