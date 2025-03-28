export enum PercentileRange {
    // scenario cases
    P10P90 = '10-90th',
    P25P75 = '25-75th',

    // base cases
    P10P25 = '10-25th',
    P25P50 = '25-50th',
    P50P75 = '50-75th',
    P75P90 = '75-90th'
}

export enum Percentile {
    P10 = '10th',
    P25 = '25th',
    P50 = '50th',
    P75 = '75th',
    P90 = '90th'
}

export enum LongPercentile {
    P10 = '10th Percentile',
    P25 = '25th Percentile',
    P50 = '50th Percentile',
    P75 = '75th Percentile',
    P90 = '90th Percentile'
}

export const SHORT_PERCENTILE_SUFFIX = 'th';
