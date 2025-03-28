import {CoreDefinitionStore, ExploreSelectOption, ExploreSelectOptionGroup, TokenConstants} from '@blk/explore-ui-core';
import {BenchmarkConstants} from '@constants/benchmark.constants';
import {Benchmark} from '@models/portfolio/benchmark.model';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {isEmpty} from 'lodash';

/**
 * Benchmark Selector Utils class
 */
export class BenchmarkSelectorUtils {
    /**
     * returns an array with the display data for the Benchmarks
     */
    public static getBenchmarkOptions(benchmarks: Benchmark[], portfolio: Portfolio, allowOther: boolean): ExploreSelectOptionGroup[] {
        // Create the array that will hold the options
        const benchmarksOptions: ExploreSelectOptionGroup[] = [];
        if (!isEmpty(benchmarks)) {
            BenchmarkSelectorUtils.customSortForBenchmark(benchmarks);

            const benchTypeLabels = new Set();
            let benchTypeOptionGroup: ExploreSelectOptionGroup;

            for (const benchmark of benchmarks) {
                const benchTypeLabel = BenchmarkConstants.BENCHMARK_TYPES_DISPLAY[benchmark.type] || benchmark.type;

                // Create the group if not already defined.
                if (!benchTypeLabels.has(benchTypeLabel)) {
                    benchTypeLabels.add(benchTypeLabel);
                    benchTypeOptionGroup = new ExploreSelectOptionGroup([], benchTypeLabel);
                    benchmarksOptions.push(benchTypeOptionGroup);
                }
                // Add this benchmark to the group.
                benchTypeOptionGroup.values.push(BenchmarkSelectorUtils.createBenchmarkOption(portfolio, benchmark));
            }
        }

        // add the none option
        benchmarksOptions.push(new ExploreSelectOptionGroup(
            [BenchmarkSelectorUtils.createBenchmarkOption(
                portfolio,
                Benchmark.create(BenchmarkConstants.NONE_BENCH, null, BenchmarkConstants.NONE_BENCH)
            )])
        );

        // add the other option if possible
        if (allowOther) {
            benchmarksOptions.push(new ExploreSelectOptionGroup(
                [BenchmarkSelectorUtils.createBenchmarkOption(
                    portfolio,
                    Benchmark.create(BenchmarkConstants.OTHER_BENCH, null, BenchmarkConstants.OTHER_BENCH)
                )])
            );
        }
        return benchmarksOptions;
    }

    /**
     * Custom sort for benchmark
     */
    private static customSortForBenchmark(benchmarks: Benchmark[]): void {
        // Sort the benchmark for the order required to display.
        benchmarks.sort((benchmark1: Benchmark, benchmark2: Benchmark) => {
            // The order goes - RISK, PERFORM, REPACCT, BenchAggregate, MARKET, FWRD.
            for (const benchType in BenchmarkConstants.BENCHMARK_TYPES_DISPLAY) {
                if (!Object.prototype.hasOwnProperty.call(BenchmarkConstants.BENCHMARK_TYPES_DISPLAY, benchType)) {
                    continue;
                }
                const sortByBenchTypeAndOrder = BenchmarkSelectorUtils.sortByBenchTypeAndOrder(benchmark1, benchmark2, benchType);
                if (sortByBenchTypeAndOrder) {
                    return sortByBenchTypeAndOrder;
                }
            }

            // The bench type from tokens () comes in alphabetical order after the above order.
            if (benchmark1.type < benchmark2.type) {
                return -1;
            } else if (benchmark1.type > benchmark2.type) {
                return 1;
            } else {
                return benchmark1.order - benchmark2.order;
            }
        });
    }

    /**
     * Sort by bench type and order
     */
    private static sortByBenchTypeAndOrder(benchmark1: Benchmark, benchmark2: Benchmark, benchType: string): number {
        if (benchmark1.type === benchType && benchmark2.type === benchType) {
            return benchmark1.order - benchmark2.order;
        } else if (benchmark1.type === benchType) {
            return -1;
        } else if (benchmark2.type === benchType) {
            return 1;
        }
    }

    /**
     * Creates Benchmark option
     */
    private static createBenchmarkOption(portfolio, benchmark: Benchmark): ExploreSelectOption {
        return new ExploreSelectOption(
            BenchmarkSelectorUtils.getDisplayName(benchmark),
            benchmark,
            BenchmarkSelectorUtils.isSelectedBenchmark(portfolio, benchmark));
    }

    /**
     * return true if portfolio benchmark is same as of argument benchmark
     */
    private static isSelectedBenchmark(portfolio: Portfolio, benchmark: Benchmark): boolean {
        if (portfolio.benchmark.type === BenchmarkConstants.OTHER_BENCH) {
            return (benchmark.type === BenchmarkConstants.OTHER_BENCH);
        } else if (portfolio.benchmark.type === BenchmarkConstants.NONE_BENCH) {
            // for 'None' selected we don't have any benchmark name for that
            return (benchmark.type === BenchmarkConstants.NONE_BENCH);
        } else if (portfolio.benchmark.type === BenchmarkConstants.BENCH_AGGREGATE) {
            // for 'group-agg' / 'group-agg-sec' it's possible we may not have a name (in favorites)
            // but order & type should suffice to single it out
            return benchmark.type === BenchmarkConstants.BENCH_AGGREGATE && benchmark.order === portfolio.benchmark.order;
        }

        return (benchmark.type === portfolio.benchmark.type && benchmark.name === portfolio.benchmark.name
            && benchmark.order === portfolio.benchmark.order);
    }


    /**
     * Get display name
     */
    private static getDisplayName(benchmark: Benchmark): string {
        // If there is no item just return an empty string.
        if (!benchmark) {
            return '';
        }

        // If there is no order then just return the name, this should be sections, none and other.
        if (!benchmark.order) {
            return benchmark.name;
        }

        // This check is added to keep the same prod behavior - non order 1 bench type Model, the name has been displayed as Secondary.
        if (benchmark.type === BenchmarkConstants.MODEL) {
            return benchmark.order === 1 ? BenchmarkConstants.BENCH_PRIMARY + ' (' + benchmark.name + ')'
                : BenchmarkConstants.BENCH_SECONDARY + ' (' + benchmark.name + ')';
        }

        if (benchmark.type === BenchmarkConstants.BENCH_AGGREGATE) {
            return benchmark.name === BenchmarkConstants.BENCH_PRIMARY ? BenchmarkConstants.GROUP_AGGREGATE : BenchmarkConstants.GROUP_AGGREGATE_DASH_SEC;
        }

        if (benchmark.name === BenchmarkConstants.BENCH_PRIMARY || benchmark.name === BenchmarkConstants.BENCH_SECONDARY) {
            // If the benchmark name passed in is already 'PRIMARY' or 'SECONDARY' just return that instead of the string addition below
            //
            // Ex. In the case of batching a portfolio group as portfolios, I don't the benchmark tickers for each underlying portfolio
            // So I populate the benchmark selector with a dummy Primary/Secondary RISK benchmark
            // Because the dummy name is already 'Primary' just return that string (instead of Primary (Primary))
            return benchmark.name;

        } else {
            // Show it as Primary for bench order 1, show it as Secondary for bench order 2.  Otherwise something like Bench 7 (benchmarkName).
            return benchmark.order === 1
                ? BenchmarkConstants.BENCH_PRIMARY + ' (' + benchmark.name + ')'
                : benchmark.order === 2
                    ? BenchmarkConstants.BENCH_SECONDARY + ' (' + benchmark.name + ')'
                    : 'Bench ' + benchmark.order + ' (' + benchmark.name + ')';
        }
    }
}
