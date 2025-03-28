/**
 * This class holds constants related to benchmark
 */
export class BenchmarkConstants {
    static readonly BENCH_PRIMARY = 'Primary';
    static readonly BENCH_SECONDARY = 'Secondary';
    static readonly BENCH_TYPE_RISK = 'RISK';
    static readonly NONE_BENCH = 'None';
    static readonly NoneBenchName = 'NoneBenchName';
    static readonly OTHER_BENCH = 'Other';
    static readonly GROUP_AGGREGATE = 'Group Aggregate';
    static readonly GROUP_AGGREGATE_SEC = 'Group Aggregate Secondary';
    static readonly GROUP_AGGREGATE_DASH_SEC = 'Group Aggregate - Secondary';
    static readonly BENCH_AGGREGATE = 'BenchAggregate';
    static readonly BENCH_AGGREGATE_SEC = 'BenchAggregateSecondary';
    static readonly BENCH_TYPE_MARKET = 'MARKET';
    static readonly BENCH_TYPE_FORWARD = 'FWRD';
    static readonly MODEL = 'REPACCT';
    static readonly PERFORM = 'PERFORM';

    // Known benchmark types and the description for them.
    static readonly BENCHMARK_TYPES_DISPLAY = {
        RISK: 'Risk',
        PERFORM: 'Performance',
        REPACCT: 'Model',
        BenchAggregate: 'Group Aggregate',
        MARKET: 'Market',
        FWRD: 'Forward'
    };
}
