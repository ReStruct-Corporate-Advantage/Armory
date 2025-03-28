import {Injectable} from '@angular/core';
import {cloneDeep, isEmpty, isEqual} from 'lodash';
import {forkJoin, Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';

import {Portfolio} from '@models/portfolio/portfolio.model';
import {BaseWorkpad} from '@models/workspace/base-workpad.model';
import {FlatWorkpad} from '@models/workspace/flat-workpad.model';
import {WorkspaceStore} from '../../../stores';
import {WorkspaceUtils} from '../../../utils';
import {PortfolioService} from '../portfolio';
import {ReportService} from './report.service';
import {ReportGroup} from '@models/workspace/report-group.model';
import {BenchmarkConstants} from '@constants/benchmark.constants';
import {DateValue} from '@blk/explore-ui-core';
import {RulesBasedPortfolio} from '@models/portfolio/rule-based-portfolio.model';
import {BaseRule} from '@models/portfolio/tradeRules/base-rule.model';
import {BaseAdhocPortfolio, isAdhocPort} from '@interfaces/base-adhoc-portfolio.interface';
import {AdhocPortGroup} from '@models/portfolio/adhoc-portgroup.model';
import {AdhocPortfolio} from '@models/portfolio/adhoc-portfolio.model';

/**
 * Workpad Service
 */
@Injectable({
    providedIn: 'root'
})
export class WorkpadService {
    constructor(private portfolioService: PortfolioService, private reportService: ReportService) {
    }

    /**
     * create a flatWorkpad and set report and portfolio
     * index is passed from add-portfolio-modal if more than one portfolio are added, so we can update currentReport of the first portfolio ONLY
     */
    createFlatWorkpad(portfolio: Portfolio, index?: number): FlatWorkpad {
        const newFlatWorkpad = new FlatWorkpad();

        const curatedReportFavorites = WorkspaceUtils.getCuratedReportFavorites(portfolio);
        if (curatedReportFavorites && curatedReportFavorites.length) {
            this.reportService.addCuratedReports$(newFlatWorkpad, curatedReportFavorites, index).subscribe(() => {
                // Ensure that there is a report, if not then we need to add one.
                if (!newFlatWorkpad.reports.length) {
                    const newReport = WorkspaceUtils.createNewReport();
                    newFlatWorkpad.reports.push(WorkspaceUtils.createNewReport());

                    // if multiple portfolios are added at the same time, update current report for the first portfolio ONLY
                    if (!index) {
                        WorkspaceStore.updateCurrentReport(newReport);
                    }
                }
            });
        } else {
            newFlatWorkpad.reports.push(WorkspaceUtils.createNewReport());
        }

        newFlatWorkpad.addPortfolios(portfolio);

        return newFlatWorkpad;
    }

    /**
     * fetch all portfolios in the workpad and return the portfolios
     */
    fetchAllPortfolios$(workpad: BaseWorkpad): Observable<any> {
        const observableQueue: Observable<any>[] = [];
        const portfolios = workpad.getAllPortfolios();

        if (isEmpty(portfolios)) {
            return of([]);
        }

        const portIdSet = new Set<string>();
        // Loop through each report and get the portId's of all portfolios that are in a ComparisonConfig
        for (const comparisonConfig of workpad.comparisonConfigMap.values()) {
            for (const portId of comparisonConfig.portComparisonList) {
                portIdSet.add(portId);
            }
        }
        // Loop through each portfolio
        for (const portfolio of portfolios) {
            // If it's the first portfolio, or the portfolio exists in a ComparisonConfig in one of the reports, fetch port info
            if (portfolios.indexOf(portfolio) === 0 || portIdSet.has(portfolio.portId)) {
                if (isAdhocPort(portfolio)) {
                    // support old adhoc port group favorites
                    if (portfolio instanceof AdhocPortfolio && portfolio.adhocParams && portfolio.adhocParams.isPortGroup) {
                        const adhocPortGroup = new AdhocPortGroup();
                        (adhocPortGroup as AdhocPortGroup).createRulesFromHoldingChanges(portfolio.holdingChanges);
                        adhocPortGroup.deserialize(portfolio.serialize());
                        (portfolio as BaseAdhocPortfolio) = adhocPortGroup;
                    }
                    observableQueue.push(this.portfolioService.fetchPortfolioInformation$(portfolio, { isLightVersion: true, includeMandate: true }, false, portfolio.adhocParams));
                } else {
                    observableQueue.push(this.portfolioService.fetchPortfolioInformation$(portfolio, { isLightVersion: true, includeMandate: true }));
                }
            } else {
                // Else, just return an observable of that portfolio object
                observableQueue.push(of(portfolio));
            }
        }

        return forkJoin(observableQueue);
    }

    /**
     * Updates the portfolio information when a date change has happened. This can be used for flat workpads and report groups
     */
    updatePortInfoOnDateChange(oldPortfolios: Portfolio[], newDateObject: DateValue, workpad?: BaseWorkpad, skipCurrentWorkpadUpdate?: boolean): void {
        const observableQueue: Observable<any>[] = [];
        let newCurrentPortfolio: Portfolio;

        for (const portfolio of oldPortfolios) {
            // TODO: Clear the widget content
            // fetch data for each portfolio
            const portObject = cloneDeep(portfolio);
            portObject.datePicker = newDateObject;
            let tradeRules: BaseRule[];
            // clear existing holding changes for RuleBased Portfolio if date is changed
            if (portObject instanceof RulesBasedPortfolio) {
                portObject.clearHoldingChangesWithRulelist(false);
                tradeRules = portObject.compositionRules.tradeRules;
            }
            observableQueue.push(
                this.portfolioService
                    .fetchPortfolioInformation$(
                        portObject,
                        { isLightVersion: true, includeMandate: true },
                        undefined,
                        undefined,
                        tradeRules // pass existing trade rules
                    )
                    .pipe(
                        map((newPort: Portfolio) => {
                            // save the datePicker
                            newPort.datePicker = newDateObject;
                            // We want to retain benchmark in case other benchmark is selected and date is changed
                            if (portfolio.benchmark.type === BenchmarkConstants.OTHER_BENCH) {
                                newPort.benchmark = portfolio.benchmark;
                            }
                            // if among the portfolios, the current one is included, save it to later update the WorkspaceStore
                            if (isEqual(portfolio, WorkspaceStore.getCurrentPortfolio())) {
                                newCurrentPortfolio = newPort;
                            }
                            return newPort;
                        })
                    )
            );
        }

        forkJoin(observableQueue).subscribe((newPortfolios: Portfolio[]) => {
            workpad = workpad || WorkspaceStore.getCurrentWorkpad();
            // When all the portfolios have fetched, replace the portfolios in workpad
            workpad.replacePortfolios(newPortfolios[0], workpad instanceof ReportGroup ? oldPortfolios[0] : undefined);
            if (skipCurrentWorkpadUpdate) {
                if (newCurrentPortfolio) {
                    WorkspaceStore.updateCurrentPortfolio(newCurrentPortfolio);
                }
                return;
            }
            WorkspaceStore.updateCurrentWorkpad(workpad, newCurrentPortfolio, WorkspaceStore.getCurrentReport());

            // Load curated views
            // fetch Published State
        });
    }
}
