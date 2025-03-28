import {isObject} from 'lodash';
import {Portfolio} from './portfolio.model';
import {BenchmarkConstants} from '@constants/benchmark.constants';
import {WhatIfPortfolio} from '@models/portfolio/what-if-portfolio.model';
import {AbstractConfig, RequestParamsCreator, SerializeFavoriteType} from '@blk/explore-ui-core';
import {AdhocPortParams} from '@models/portfolio/adhocModelling/adhoc-port-params.model';

/**
 * Model class for holding benchmark information
 */
export class Benchmark extends AbstractConfig implements RequestParamsCreator {
    name: string;
    order: number;
    type: string;
    portfolio: Portfolio;

    /**
     * Sort of a utility method to create a benchmark object based on the arguments provided
     * Here, type is the only mandatory argument
     *
     * NOTE: Name is a required field only if the type is 'other'
     */
    static create(type: string, order?: number, name?: string): Benchmark {
        const benchmark = new Benchmark();
        benchmark.type = type;
        if (order != null) {
            benchmark.order = order;
        }
        if (name != null) {
            benchmark.name = name;
        }
        return benchmark;
    }

    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Implementation of abstract doDeserialize
     */
    deserialize(data: any): void {
        if (data.type) {
            this.type = data.type;
        }
        if (data.order != null) {
            this.order = data.order;
        }
        if (data.name) {
            this.name = data.name;
        }
        if (data.portfolio) {
            this.portfolio = new Portfolio();
            this.portfolio.portName = data.portfolio.ticker;
            this.portfolio.id = data.portfolio.favId ? data.portfolio.favId : data.portfolio.id;
        }
    }

    /**
     * Implementation of abstract doSerialize
     */
    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        const benchmark: any = {};
        if (this.type) {
            benchmark.type = this.type;
        }
        if (this.order != null) {
            benchmark.order = this.order;
        }
        if (this.name) {
            benchmark.name = this.name;
        }
        if (this.portfolio && this.portfolio.isModified() && this.type === BenchmarkConstants.OTHER_BENCH) {
            benchmark.portfolio = {
                ticker: this.portfolio.portName,
                id: this.portfolio.id
            };
        }

        return benchmark;
    }

    /**
     * Equals method for comparing two portfolios
     */
    equals(otherBench: Benchmark | any): boolean {
        if (!otherBench) {
            return false;
        }

        if (this.name !== otherBench.name) {
            return false;
        }

        if (this.order !== otherBench.order) {
            return false;
        }

        return this.type === otherBench.type;
    }

    /**
     * add request params for the benchmark model
     */
    addRequestParams(requestParams: any, paramName?: string): void {
        // Benchmark name shouldn't be sent if it doesn't exist, as it hampers the cache warming flow
        if (this.type === BenchmarkConstants.OTHER_BENCH) {
            requestParams.benchmark = this.name;
        }
        requestParams.benchSelection = this.type;
        requestParams.benchOrder = this.order;
        // add composition params if bench portfolio is what-if
        if (this.portfolio && this.portfolio.isModified()) {
            (this.portfolio as WhatIfPortfolio).addBenchCompositionParams(requestParams);
            if ((this.portfolio as any).adhocParams instanceof AdhocPortParams) {
                requestParams.benchmarkAdhocParams = this.getBenchAdhocParams();
            }
        }
    }

    /**
     * returns serialized holding changes for benchmark's portfolio (what-if)
     */
    getSerializedBenchmarkHoldingChanges(): any[] {
        return this.portfolio && this.portfolio.isModified() ? (this.portfolio as WhatIfPortfolio).getSerializedHoldingChanges() : [];
    }

    /**
     * return adhoc params for bench portfolio
     */
    getBenchAdhocParams(): any {
        return (this.portfolio as any).adhocParams instanceof AdhocPortParams
            ? (this.portfolio as any).adhocParams.serialize()
            : null;
    }
}
