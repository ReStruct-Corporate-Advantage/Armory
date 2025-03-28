import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {CalendarDateUtils, DateFormatConstants, SubscribableComponent} from '@blk/explore-ui-core';
import {RiskSettings} from '@blk/explore-ui-risk';
import {DateRange, FooterDetails} from '@interfaces/response.interface';
import {CusipProxyDataResponse} from '@models/proxy/cusip-proxy-data-response.model';
import {combineLatest, Observable} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {WorkspaceStore} from '../../../../stores';
import {ProxyDataService} from '../proxy-data.service';

/**
 * Factor Attribution Details Component
 */
@Component({
    selector: 'app-factor-attribution-details',
    templateUrl: './factor-attribution-details.component.html'
})
export class FactorAttributionDetailsComponent extends SubscribableComponent implements OnInit {
    @Input() riskSettings$: Observable<RiskSettings>;
    @Input() footerDetails$: Observable<FooterDetails>;

    summaryValueList: string[];
    proxyInfo: { cusips: string[], overrides: string[], endDates: string[] };
    missingBetasMap: string | Map<string, DateRange[]>;
    missingExposuresMap: string | {[key: string]: DateRange[]};

    /**
     * constructor
     */
    constructor(private changeDetectorRef: ChangeDetectorRef, private proxyDataService: ProxyDataService) {
        super();
    }

    /**
     * ngOnInit
     */
    ngOnInit(): void {
        combineLatest([this.riskSettings$, this.footerDetails$])
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(([riskSettings, footerDetails]) => {
                if (footerDetails) {
                    this.missingBetasMap = footerDetails.missingBetas;
                    this.missingExposuresMap = footerDetails.missingExposures;
                }

                if (riskSettings && footerDetails) {
                    this.setSummaryValueList(riskSettings, footerDetails);

                    if (footerDetails.cusipsTitleMap && footerDetails.startDate) {
                        this.getCusipProxyData(footerDetails.cusipsTitleMap, new Date(footerDetails.startDate), new Date(footerDetails.endDate), this.getRiskModel(riskSettings.exposureRiskSettings.riskModel));
                    }
                }
            });
    }

    /**
     * Get riskModel
     *  @example '^APWDA' => 'APWD'
     */
    private getRiskModel(riskModel: string): string {
        const model = riskModel.replace('^', '');
        return model.substr(0, model.length - 1);
    }

    /**
     * Update value list
     */
    private setSummaryValueList(riskSettings: RiskSettings, footerDetails: FooterDetails): void {
        const portfolio = WorkspaceStore.getCurrentPortfolio();

        const startDate = CalendarDateUtils.getDateInFormat(footerDetails.startDate, DateFormatConstants.DDMMMYYYY_SPACE) || '';
        const endDate = CalendarDateUtils.getDateInFormat(footerDetails.endDate, DateFormatConstants.DDMMMYYYY_SPACE) || '';

        this.summaryValueList = [
            // Portfolio
            portfolio.title + ' - ' + portfolio.fullName,
            // Benchmark
            portfolio.benchmark.name,
            // Assets
            footerDetails.assetsCount.toString(),
            // Active Return
            this.getReturnValue(footerDetails.activeReturn),
            // Portfolio Return
            this.getReturnValue(footerDetails.portfolioActiveReturn),
            // Benchmark Return
            this.getReturnValue(footerDetails.benchmarkActiveReturn),
            // Horizon
            startDate + ' - ' + endDate,
            // Economy Date
            riskSettings.economyRiskSettings.dateObject.date,
            // Weighting Scheme
            riskSettings.economyRiskSettings.weightingScheme,
            // Model published on
            'N/A'
        ];
    }

    /**
     * Get cusip proxy data
     */
    private getCusipProxyData(cusipTitleMap: any, startDate: any, endDate: any, riskModel: string): void {
        const cusips = Object.keys(cusipTitleMap);
        this.proxyDataService.getProxyData$({cusips, startDate, endDate, riskModel})
            .subscribe((proxyData: CusipProxyDataResponse) => {
                if (proxyData) {
                    this.updateProxyInfo(proxyData);

                    if (proxyData.filePublishedDate) {
                        this.updatePublishedDate(proxyData.filePublishedDate);
                    }
                    this.changeDetectorRef.markForCheck();
                }
            });
    }

    /**
     * Update proxyInfo
     */
    private updateProxyInfo(proxyData: CusipProxyDataResponse): void {
        if (!proxyData.cusipProxyData) {
            return;
        }
        const proxyInfo = {cusips: [], overrides: [], endDates: []};

        for (const cusipData of proxyData.cusipProxyData) {
            const cusipDesc = cusipData.originalCusip && proxyData.cusipDescriptions[cusipData.originalCusip] ? ` (${proxyData.cusipDescriptions[cusipData.originalCusip]})` : '';
            const overrideDesc = cusipData.override && proxyData.cusipDescriptions[cusipData.override] ? `(${proxyData.cusipDescriptions[cusipData.override]})` : '';
            proxyInfo.cusips.push(cusipData.originalCusip + cusipDesc);
            proxyInfo.overrides.push(cusipData.override + overrideDesc);
            proxyInfo.endDates.push(CalendarDateUtils.getDateInFormat(cusipData.endDate, DateFormatConstants.MMDDYYYY_SLASH));
        }
        this.proxyInfo = proxyInfo;
    }

    /**
     * Update published date in summary value list
     */
    private updatePublishedDate(filePublishedDate: Date) {
        const publishedDate = CalendarDateUtils.getDateInFormat(filePublishedDate, DateFormatConstants.DDMMMYYYY_DASH);
        this.summaryValueList.pop();
        this.summaryValueList = [...this.summaryValueList, publishedDate];
    }

    /**
     * Get return value
     */
    private getReturnValue(number: number): string {
        return number ? number.toFixed(5) + ' %' : 'N/A';
    }
}
