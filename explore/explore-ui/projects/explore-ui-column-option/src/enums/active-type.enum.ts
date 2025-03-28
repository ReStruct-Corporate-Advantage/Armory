export enum ActiveType {
    DIFF_1MINUS2,
    RATIO_2TO1,
    PCT_DIFF_BY_1,
    PCT_DIFF_BY_2
}

export class ActiveTypeUtils {

    /**
     * returns the display name corresponding to each ActiveType.
     */
    static getDisplayName(compareType: ActiveType): string {
        switch (compareType) {
            case ActiveType.DIFF_1MINUS2:
                return 'Portfolio - Benchmark';
            case ActiveType.RATIO_2TO1:
                return 'Portfolio / Benchmark';
            case ActiveType.PCT_DIFF_BY_1:
                return '(Portfolio - Benchmark) / Portfolio';
            case ActiveType.PCT_DIFF_BY_2:
                return '(Portfolio - Benchmark) / Benchmark';
        }
    }

    /**
     * Get activeType list with its values and label
     */
    static getAllActiveTypes(): Array<{ value: string, label: string }> {
        const items: ActiveType[] = Object.keys(ActiveType).map(k => ActiveType[k]).filter(v => typeof v === 'number') as number[];
        const validActiveTypes: { value: string, label: string }[] = [];
        const l: number = items.length;
        for (let i = 0; i < l; i++) {
            const operator: any = {
                value: ActiveType[i],
                label: ActiveTypeUtils.getDisplayName(items[i])
            };
            validActiveTypes.push(operator);
        }
        return validActiveTypes;
    }
}
