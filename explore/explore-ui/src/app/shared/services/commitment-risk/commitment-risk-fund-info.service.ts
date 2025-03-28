import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {map, share} from 'rxjs/operators';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {PortfolioSecurity} from '@interfaces/portfolio-security.interface';
import {RequestConstants} from '@constants/request.constants';
import {Http2BmsService} from '@services/bms';

@Injectable(
    {
        providedIn: 'root'
    }
)
/**
 * Service for loading column options
 */
export class CommitmentRiskFundInfoService {
    cfmFunds: Observable<[PortfolioSecurity]>;
    /**
     * constructor
     */
    constructor(private http2BmsService: Http2BmsService) {
    }

    fetchPrivateFunds(portfolio: Portfolio, stressScenario: string): Observable<[PortfolioSecurity]> {
        // Fetch the missing column options.
        this.cfmFunds = this.http2BmsService.post$( RequestConstants.CFM_FUNDS, this.createCFMFundRequest(portfolio, stressScenario))
            .pipe(
                map((payload: any) => {
                    const items = payload.data;
                    // convert payLoad to PortfolioSecurity[]
                    return items.map(item => {
                        return {
                            secDesc: item.DESCRIPTION,
                            cusip: item.CUSIP,
                            isDisabled: item.EXCLUDED
                        };
                    });
                }),
                share()
            );

        return this.cfmFunds;
    }

    createCFMFundRequest(portfolio: Portfolio, stressScenario: string) {
        return {
            portName: portfolio.portName,
            currency: portfolio.currency,
            date: portfolio.datePicker.date,
            stressScenario: stressScenario
        };
    }
}
