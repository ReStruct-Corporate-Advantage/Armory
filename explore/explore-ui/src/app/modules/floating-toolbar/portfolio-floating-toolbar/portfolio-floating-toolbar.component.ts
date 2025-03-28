import {Component, OnInit} from '@angular/core';
import {WorkspaceStore} from '@stores/workspace.store';
import {BenchmarkConstants} from '@constants/benchmark.constants';
import {takeUntil} from 'rxjs/operators';
import {SubscribableComponent} from '@blk/explore-ui-core';
import {Portfolio} from '@models/portfolio/portfolio.model';

/**
 * Portfolio Floating Toolbar Component
 *
 * @example
 *  <div class="portfolio-floating-toolbar-container">
 *      <app-portfolio-floating-toolbar></app-portfolio-floating-toolbar>
 *  </div>
 */
@Component({
    selector: 'app-portfolio-floating-toolbar',
    templateUrl: './portfolio-floating-toolbar.component.html',
    styleUrls: ['./portfolio-floating-toolbar.component.scss']
})
export class PortfolioFloatingToolbarComponent extends SubscribableComponent implements OnInit {
    portfolio: Portfolio;

    /**
     * ngOnInit
     */
    ngOnInit(): void {
        WorkspaceStore.getCurrentPortfolio$()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((portfolio: Portfolio) => {
                this.portfolio = portfolio;
            });
    }

    /**
     * Get portfolio display date
     */
    getDisplayDate(): string {
        return this.portfolio.datePicker.date || '';
    }

    /**
     * Get portfolio currency information
     */
    getCurrency(): string {
        return this.portfolio.currency || '';
    }

    /**
     * Get benchmark information
     */
    getBenchmarkDisplayName(): string {
        // If there is no item just return an empty string.
        if (!this.portfolio.benchmark) {
            return '';
        }
        // If there is no order then just return the name, this should be sections, none and other.
        if (!this.portfolio.benchmark.order) {
            return this.portfolio.benchmark.name;
        }

        if (this.portfolio.benchmark.type === BenchmarkConstants.BENCH_AGGREGATE) {
            return this.portfolio.benchmark.name === BenchmarkConstants.BENCH_PRIMARY ? BenchmarkConstants.GROUP_AGGREGATE : BenchmarkConstants.GROUP_AGGREGATE_DASH_SEC;
        }

        // TODO:  Also we are not getting here because group aggregates do not have an order, there is an id instead.
        //        I also suspect that secondary aggregate does not work.

        if (this.portfolio.benchmark.name === BenchmarkConstants.BENCH_PRIMARY || this.portfolio.benchmark.name === BenchmarkConstants.BENCH_SECONDARY) {
            // If the benchmark name passed in is already 'PRIMARY' or 'SECONDARY' just return that instead of the string addition below
            //
            // Ex. In the case of batching a portfolio group as portfolios, I don't the benchmark tickers for each underlying portfolio
            // So I populate the benchmark selector with a dummy Primary/Secondary RISK benchmark
            // Because the dummy name is already 'Primary' just return that string (instead of Primary (Primary))
            return this.portfolio.benchmark.name;
        } else {
            // For actual benchmarks we want to specify primary/secondary and the name of it.
            let name: string = this.portfolio.benchmark.order === 1 ? BenchmarkConstants.BENCH_PRIMARY : BenchmarkConstants.BENCH_SECONDARY;
            name += ' (' + this.portfolio.benchmark.name + ')';
            return name;
        }
    }
}
