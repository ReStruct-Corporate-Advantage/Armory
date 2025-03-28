/// <reference types="cypress" />
// ***********************************************
// This contains various custom commands
// that are common and can be used across tests
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

import {introPage} from '../integration/pages/introPage';
import {sharedElements} from '../integration/pages/sharedElements';
import {portfolioInputPanel} from '../integration/pages/portfolioInputPanel';
import {CypressCommonConstants} from '../integration/constants/cypress-common-constants';
import {addMatchImageSnapshotCommand} from 'cypress-image-snapshot/command';

addMatchImageSnapshotCommand({
    failureThreshold: 0.0001, // threshold for entire image
    failureThresholdType: 'percent', // percent of image or number of pixels
    customDiffConfig: { threshold: 0.001 }, // threshold for each pixel
    capture: 'viewport', // capture viewport in screenshot
});

// ignore uncaught exceptions
Cypress.on('uncaught:exception', (err) => {
    return false
  })

Cypress.Commands.add('mockApplicationLoading' as any, () => {
    cy.intercept('GET', CypressCommonConstants.EXPLORE_BETA_CONTEXT_PATH + '/getUserMetadata?loadingKey=*&loadingMessage=Checking%20Access&requestId=*', (req) => req.reply({statusCode: 200, fixture: 'mocks/metadata.json'}));
    cy.intercept('GET', new RegExp(`^${CypressCommonConstants.EXPLORE_BETA_CONTEXT_PATH}/definitions\\?.*`), (req) => req.reply({ statusCode: 200, fixture: 'mocks/definitions.json' }));
    cy.intercept('GET', '/bms/request/aladdinhelp/inquirytransparency/isUserEnabledToAladdinHelp?_=*', (req) => req.reply({statusCode: 200, fixture: 'mocks/aladdinHelp.json'}));
    cy.intercept('GET', CypressCommonConstants.EXPLORE_BETA_CONTEXT_PATH + '/loadMandates?loadingKey=*&loadingMessage=Loading%20Mandates&requestId=*', (req) => req.reply({statusCode: 200, fixture: 'mocks/mandates.json'}));
    cy.intercept('GET', CypressCommonConstants.EXPLORE_BETA_CONTEXT_PATH + '/getFavoriteForTypeAndUser?owner=_ADMIN&type=MANDATE_MAP&isGlobalFav=false&loadingKey=*&loadingMessage=Loading%20Mandate%20Settings&requestId=*', (req) => req.reply({statusCode: 200, fixture: 'mocks/adminMandateMapTypeFav.json'}));
    cy.intercept('GET', CypressCommonConstants.EXPLORE_BETA_CONTEXT_PATH + '/getAllFavoritesForUserAndType?owner=_ADMIN&type=MANDATE&loadingKey=*&loadingMessage=Loading%20Mandate%20Options&requestId=*', (req) => req.reply({statusCode: 200, fixture: 'mocks/adminMandateTypeAllFav.json'}));
    cy.intercept('GET', CypressCommonConstants.EXPLORE_BETA_CONTEXT_PATH + '/getAllFavoritesForUserAndType?owner=_ADMIN&type=ATTRIBUTION_SETTING&loadingKey=*&loadingMessage=Loading%20Mandate%20Options&requestId=*', (req) => req.reply({statusCode: 200, fixture: 'mocks/adminAttributionSettingAllFav.json'}));
    cy.intercept('GET', CypressCommonConstants.EXPLORE_BETA_CONTEXT_PATH + '/getAllFavoritesForUserAndType?owner=_ADMIN&type=BREAKDOWN&loadingKey=*&loadingMessage=Loading%20Mandate%20Options&requestId=*', (req) => req.reply({statusCode: 200, fixture: 'mocks/adminBreakdownAllFav.json'}));
    cy.intercept('GET', CypressCommonConstants.EXPLORE_BETA_CONTEXT_PATH + '/getAllFavoritesForUserAndType?owner=_ADMIN&type=FAC_BKD&loadingKey=*&loadingMessage=Loading%20Mandate%20Options&requestId=*', (req) => req.reply({statusCode: 200, fixture: 'mocks/adminFacBkdAllFav.json'}));
    cy.intercept('GET', CypressCommonConstants.EXPLORE_BETA_CONTEXT_PATH + '/getAllFavoritesForUserAndType?owner=_ADMIN&type=LAYOUT&loadingKey=*&loadingMessage=Loading%20Mandate%20Options&requestId=*', (req) => req.reply({statusCode: 200, fixture: 'mocks/adminLayoutAllFav.json'}));
    cy.intercept('GET', CypressCommonConstants.EXPLORE_BETA_CONTEXT_PATH + '/getAllFavoritesForUserAndType?owner=_ADMIN&type=REPORT&loadingKey=*&loadingMessage=Loading%20Mandate%20Options&requestId=*', (req) => req.reply({statusCode: 200, fixture: 'mocks/adminReportAllFav.json'}));
    cy.intercept('GET', CypressCommonConstants.EXPLORE_BETA_CONTEXT_PATH + '/getAllFavoritesForUserAndType?owner=_GLOBAL&type=LAYOUT&loadingKey=*&loadingMessage=Loading%20Mandate%20Options&requestId=*', (req) => req.reply({statusCode: 200, fixture: 'mocks/globalLayoutAllFav.json'}));
    cy.intercept('GET', CypressCommonConstants.EXPLORE_BETA_CONTEXT_PATH + '/getFavoriteForTypeAndUser?owner=_ADMIN&type=WORKSPACE_FOLDER&isGlobalFav=false&requestId=*', (req) => req.reply({statusCode: 200, fixture: 'mocks/adminWorkspaceFolderFav.json'}));
    cy.intercept('GET', CypressCommonConstants.EXPLORE_BETA_CONTEXT_PATH + '/getAllFavoritesForUserAndType?owner=_ADMIN&type=WORKSPACE&requestId=*', (req) => req.reply({statusCode: 200, fixture: 'mocks/adminWorkspaceAllFav.json'}));
    cy.intercept('GET', CypressCommonConstants.EXPLORE_BETA_CONTEXT_PATH + '/getFavoriteForTypeAndUser?owner=*&type=WORKSPACE_FOLDER&isGlobalFav=false&requestId=*', (req) => req.reply({statusCode: 200, fixture: 'mocks/userWorkspaceFolderFav.json'}));
    cy.intercept('GET', CypressCommonConstants.EXPLORE_BETA_CONTEXT_PATH + '/getAllFavoritesForUserAndType?owner=*&type=WORKSPACE&requestId=*', (req) => req.reply({statusCode: 200, fixture: 'mocks/userWorkspaceAllFav.json'}));
    cy.intercept('GET', CypressCommonConstants.EXPLORE_BETA_CONTEXT_PATH + '/getAllUsersForType?type=WORKSPACE&requestId=*', (req) => req.reply({statusCode: 200, fixture: 'mocks/workspaceAllUserFav.json'}));
    cy.intercept('POST', 'https://pdx-col.eum-appdynamics.com/eumcollector/beacons/browser/v2/AD-AAB-ABY-GSD/adrum', (req) => req.reply(200));
    cy.intercept('https://cdn.appdynamics.com/adrum/adrum-latest.js', (req) => req.reply(200));
    cy.intercept('POST', CypressCommonConstants.EXPLORE_BETA_CONTEXT_PATH + '/setUserPreference', (req) => req.reply(200));

    cy.intercept('GET', CypressCommonConstants.EXPLORE_BETA_CONTEXT_PATH + '/getIndexResearchPortfolios', (req) => req.reply({statusCode: 200, fixture: 'mocks/indexResearchPortfolios.json'}));

    cy.intercept('GET', CypressCommonConstants.EXPLORE_BETA_CONTEXT_PATH + '/getFavoriteForTypeAndUser?owner=*&type=LAYOUT_FOLDER&isGlobalFav=*&requestId=*', (req) => {
        if (req.query.owner === '_GLOBAL') {
            req.reply({statusCode: 200, fixture: 'mocks/globalLayoutFolderFav.json'});
        } else if (req.query.owner === '_ADMIN') {
            req.reply({statusCode: 200, fixture: 'mocks/adminLayoutFolderFav.json'});
        } else {
            req.reply({statusCode: 200, fixture: 'mocks/userLayoutFolderFav.json'});
        }
    });

    cy.intercept('GET', CypressCommonConstants.EXPLORE_BETA_CONTEXT_PATH + '/getAllFavoritesForUserAndType?owner=*&type=LAYOUT&requestId=*', (req) => req.reply( {statusCode: 200, fixture: 'mocks/userLayoutFav.json'}));
    cy.intercept('GET', CypressCommonConstants.EXPLORE_BETA_CONTEXT_PATH + '/getAllUsersForType?type=LAYOUT&requestId=*', (req) => req.reply( {statusCode: 200, fixture: 'mocks/allLayoutFav.json'}));
});
Cypress.Commands.add('matchChartSnapshot', (snapshotName, element: Cypress.Chainable, useToggle: boolean) => {
    // Set the viewport size
    // Wait for Highcharts to load
    cy.window().then((win) => {
        if (!win.Highcharts) {
            throw new Error('Highcharts is not loaded');
        }
        return new Cypress.Promise((resolve, reject) => {
            let retryCount = 0;
            const checkHighcharts = () => {
                if (!win.Highcharts.charts || win.Highcharts.charts.length === 0) {
                    throw new Error('No Highcharts instances found');
                }

                if (win.Highcharts.charts.every(chart => chart === undefined || chart.renderer.forExport || !chart.animation)) {
                    resolve();
                } else if (retryCount < 10) {
                    retryCount++;
                    setTimeout(checkHighcharts, 100);
                } else {
                    reject(new Error('Chart not rendered properly'));
                }
            };
            checkHighcharts();
        });
    });
    element.within((chart) => {
        // Wait for toggles to be visible within the specific element
        if (useToggle) {
            cy.wrap(chart).find('.toggles', { timeout: 10000 }).should('be.visible');
        }
        // Take a snapshot of a chart
        cy.wrap(chart).matchImageSnapshot(snapshotName);
    });
});

Cypress.Commands.add('mockPortfolioLoading' as any, (portfolio: string) => {
    cy.intercept('GET', CypressCommonConstants.EXPLORE_BETA_CONTEXT_PATH + '/portsearch?searchText=*', (req => req.reply(200)));

    cy.intercept('POST', CypressCommonConstants.EXPLORE_BETA_CONTEXT_PATH + '/portfolioInfo*', (req) => {
        if (req.body.portfolio) {
            req.reply({statusCode: 200, fixture: `mocks/portfolioInfo/portfolioInfo_${portfolio}.json`});
        } else {
            req.reply();
        }
    }).as('portInfo');

    cy.intercept('POST', CypressCommonConstants.EXPLORE_BETA_CONTEXT_PATH + '/getDate', (req) => {
        if (req.body.holidayCalendar === 'GP_GLOBAL_STD') {
            req.reply({ statusCode: 200, fixture: 'mocks/getDate20230412.json' });
        } else if (req.body.holidayCalendar === 'GreenPkg') {
            req.reply({ statusCode: 200, fixture: 'mocks/getDate20180904.json' });
        } else if (req.body.days === '8' && req.body.holidayCalendar === "INDEX_ALL_Calendar") {
            req.reply({ statusCode: 200, fixture: 'mocks/getDate/getDate_T8.json' });
        }else if (req.body.days === '7' && req.body.holidayCalendar === 'INDEX_ALL_Calendar') {
            req.reply({ statusCode: 200, fixture: 'mocks/getDate/getDate_T7.json' });
        } else if (req.body.days === '1' && req.body.holidayCalendar === 'INDEX_ALL_Calendar') {
            req.reply({ statusCode: 200, fixture: 'mocks/getDate/getDate_T1.json' });
        } else if (req.body.days === '1' && req.body.holidayCalendar === "US_NYSE") {
            req.reply({ statusCode: 200, fixture: 'mocks/getDate/getDate_T1_US_NYSE.json' });
        } else if (req.body.days === '8' && req.body.holidayCalendar === "US_NYSE") {
            req.reply({ statusCode: 200, fixture: 'mocks/getDate/getDate_T8_US_NYSE.json' });
        } else if (req.body.days === '1' && req.body.holidayCalendar === 'SG') {
            req.reply({ statusCode: 200, fixture: 'mocks/getDate/getDate_T1_SG.json' });
        } else if (req.body.holidayCalendar === 'INDEX_ALL_Calendar') {
            req.reply({ statusCode: 200, fixture: 'mocks/getDate/getDate_INDEX_ALL_Calendar.json' });
        } else if (req.body.holidayCalendar === null) {
            req.reply({ statusCode: 200, fixture: 'mocks/getDate/getDate_null.json' });
        } else {
            req.reply();
        }
    });
    cy.intercept('POST', CypressCommonConstants.EXPLORE_BETA_CONTEXT_PATH + '/getPublishedState?loadingKey=*&loadingMessage=Loading%20Data%20for%20*', (req) => {
        if (req.body.portfolio === 'BGO') {
            req.reply({statusCode: 200, fixture: 'mocks/publishedState_BGO.json'});
        } else if (req.body.portfolio === 'RUBICONAGA') {
            req.reply({statusCode: 200, fixture: 'mocks/publishedState_RUBICONAGA.json'});
        } else if (req.body.portfolio === 'SNP100') {
            req.reply({statusCode: 200, fixture: 'mocks/getPublishedState/getPublishedState_SNP100.json'});
        } else if (req.body.portfolio === 'SPE7US-C') {
            req.reply({statusCode: 200, fixture: 'mocks/getPublishedState/getPublishedState_SPE7US-C.json'});
        } else {
            req.reply();
        }
    });
});

Cypress.Commands.add('mockWidgetLoading' as any, () => {
    cy.intercept('POST', CypressCommonConstants.EXPLORE_BETA_CONTEXT_PATH + '/getPrismData?widgetId=*', (req) => {
        if (req.body.portfolio === 'BGO' && req.body.title === 'Bar Chart' && req.body.columns[0].columnTag === 'pct_notional_val') {
            req.reply({statusCode: 200, fixture: 'mocks/getPrismData/barChart_pctNAV.json'});
        }  else if (req.body.portfolio === 'BGO' && req.body.title === 'Pie Chart') {
            req.reply({statusCode: 200, fixture: 'mocks/getPrismData/pieChart_BGO.json'});
        } else if (req.body.portfolio === 'BGO' && req.body.title === 'Return Analysis') {
            req.reply({statusCode: 200, fixture: 'mocks/getPrismData/returnAnalysis_BGO.json'});
        } else if (req.body.portfolio === 'BGO' && req.body.title === 'Scatter Plot') {
            req.reply({statusCode: 200, fixture: 'mocks/getPrismData/scatterPlot_BGO.json'});
        } else if (req.body.portfolio === 'BGO' && req.body.title === 'Heat Map') {
            req.reply({statusCode: 200, fixture: 'mocks/getPrismData/heatMap_BGO.json'});
        } else if (req.body.portfolio === 'BGO' && req.body.title === 'Tree Map') {
            req.reply({statusCode: 200, fixture: 'mocks/getPrismData/treeMap_BGO.json'});
        } else if (req.body.portfolio === 'BGO' && req.body.title === 'Slope Graph') {
            req.reply({statusCode: 200, fixture: 'mocks/getPrismData/slopeGraph_BGO.json'});
        } else if (req.body.portfolio === 'BGO' && req.body.title === 'Risk and Exposure') {
            req.reply({statusCode: 200, fixture: 'mocks/getPrismData/riskAndExposure_BGO.json'});
        } else if (req.body.portfolio === 'BGO' && req.body.title === 'Bar Chart') {
            req.reply({statusCode: 200, fixture: 'mocks/getPrismData/barChart_BGO.json'});
        } else if (req.body.portfolio === 'SNP100' && req.body.title === 'Risk and Exposure') {
            req.reply({statusCode: 200, fixture: 'mocks/getPrismData/riskAndExposure_default.json'});
        } else if (req.body.portfolio === 'RUBICONAGA') {
            req.reply({statusCode: 200, fixture: 'mocks/getPrismData/prismData_RUBICONAGA.json'});
        } else if (req.body.portfolio === 'SPE7US-C') {
            req.reply({statusCode: 200, fixture: 'mocks/getPrismData/getPrismData_acrm_base.json'});
        } else {
            req.reply();
        }
    });

    cy.intercept('POST', CypressCommonConstants.EXPLORE_BETA_CONTEXT_PATH + '/getPrismTimeSeriesData?widgetId=*', (req) => {
        if (req.body.portfolio === 'BGO' && req.body.title === 'Time Series Chart') {
            req.reply({statusCode: 200, fixture: 'mocks/getPrismTimeSeriesData/timeseries_BGO.json'});
        } else {
            req.reply();
        }
    });

    cy.intercept('POST', CypressCommonConstants.EXPLORE_BETA_CONTEXT_PATH + '/getRiskFactorData?widgetId=*', (req) => {
        if (req.body.portfolio === 'SNP100') {
            req.reply({statusCode: 200, fixture: 'mocks/getRiskFactorData/getRiskFactorData_snp100.json'});
        } else {
            req.reply();
        }
    });

    cy.intercept('POST', CypressCommonConstants.EXPLORE_BETA_CONTEXT_PATH + '/getCashFlowModeling?widgetId=*', (req) => {
        if (req.body.portfolio === 'SPE7US-C' && req.body.title === 'Commitment Risk' && !req.body.scenario && req.body.type === 'commitmentRiskChart2') {
            req.reply({statusCode: 200, fixture: 'mocks/getCashFlowModeling/getCashFlowModeling_acrm_base_chart.json'});
        } else if (req.body.portfolio === 'SPE7US-C' && req.body.title === 'Commitment Risk' && req.body.scenario && req.body.type === 'commitmentRiskChart2') {
            req.reply({statusCode: 200, fixture: 'mocks/getCashFlowModeling/getCashFlowModeling_acrm_stress_scenario_chart.json'});
        } else if (req.body.portfolio === 'SPE7US-C' && req.body.title === 'Commitment Risk' && !req.body.scenario && req.body.type === 'commitmentRisk2') {
            req.reply({statusCode: 200, fixture: 'mocks/getCashFlowModeling/getCashFlowModeling_acrm_base_table.json'});
        } else if (req.body.portfolio === 'SPE7US-C' && req.body.title === 'Commitment Risk' && req.body.scenario && req.body.type === 'commitmentRisk2') {
            req.reply({statusCode: 200, fixture: 'mocks/getCashFlowModeling/getCashFlowModeling_acrm_stress_scenario_table.json'});
        } else {
            req.reply();
        }
    });

    cy.intercept('POST', CypressCommonConstants.EXPLORE_BETA_CONTEXT_PATH + '/getReturnTimeSeriesData?widgetId=*', (req) => {
        if (req.body.portfolio === 'SNP100' && req.body.title === 'Return Analysis Chart') {
            req.reply({statusCode: 200, fixture: 'mocks/getReturnTimeSeriesData/returnsChart_2QTD.json'});
        } else {
            req.reply();
        }
    });

    cy.intercept('POST', CypressCommonConstants.EXPLORE_BETA_CONTEXT_PATH + '/bulkColumnOptions', (req) => {
        if (req.body.colList[0].colTag === 'pct_notional_val') {
            req.reply({statusCode: 200, fixture: 'mocks/bulkColumnOptions/colOption_pctNAV.json'});
        } else if (req.body.colList[0].colTag === 'cusip') {
            req.reply({statusCode: 200, fixture: 'mocks/bulkColumnOptions/cusipColumn.json'});
        } else if (req.body.colList[0].colTag === 'market_val') {
            req.reply({statusCode: 200, fixture: 'mocks/bulkColumnOptions/mktValColumn.json'});
        } else if (req.body.colList[0].colTag === 'pct_mv') {
            req.reply({statusCode: 200, fixture: 'mocks/bulkColumnOptions/mktValPerColumn.json'});
        } else if (req.body.colList[0].colTag === 'eq_fin_th_ws_147') {
            req.reply({statusCode: 200, fixture: 'mocks/bulkColumnOptions/colOption_ROE.json'});
        } else {
            req.reply();
        }
    });
});

Cypress.Commands.add('mockWidgetDisplayOptionLoading' as any, () => {
    let prismData: any;
    cy.fixture('mocks/getPrismData/riskAndExposure_display_settings.json').then((data) => {
        if (data) {
            prismData = data;
        }
    });
    cy.intercept('POST', CypressCommonConstants.EXPLORE_BETA_CONTEXT_PATH + '/getPrismData?widgetId=*', (req) => {
        if (req.body.portfolio === 'SNP100' && req.body.title === 'Risk and Exposure') {
            if (prismData) {
                let newData = updatedColumnData(prismData, req);
                req.reply({ statusCode: 200, body: newData });
            }
        } else {
            req.reply();
        }
    })
});

Cypress.Commands.add('mockWidgetROEColumnLoading' as any, () => {
    let prismData: any;
    cy.fixture('mocks/getPrismData/barChart_ROE_Column_SNP100.json').then((data) => {
        if (data) {
            prismData = data;
        }
    });
    cy.intercept('POST', CypressCommonConstants.EXPLORE_BETA_CONTEXT_PATH + '/getPrismData?widgetId=*', (req) => {
        if (req.body.portfolio === 'SNP100') {
            if (prismData && req.body.columns.length > 1) {
                let newData = updateROEColumnData(prismData, req);
                req.reply({ statusCode: 200, body: newData });
            }
        } else {
            req.reply();
        }
    })
});

Cypress.Commands.add('mockGetTimePeriodDatesAndName' as any, (numberOfPeriod: string, frequency: string) => {
    cy.intercept('POST', CypressCommonConstants.EXPLORE_BETA_CONTEXT_PATH + '/getTimePeriodDatesAndName', (req) => {
        if (req.body.portfolioName) {
            req.reply({statusCode: 200, fixture: `mocks/getTimePeriodDatesAndName/getTimePeriodDatesAndName_${numberOfPeriod}_${frequency}.json`});
        } else {
            req.reply();
        }
    });
});

Cypress.Commands.add('initializeMainPage' as any, (portfolio: string, date: string) => {
    cy.mockApplicationLoading();
    cy.mockPortfolioLoading(portfolio);
    cy.visit(Cypress.env(`mainPageUrl_${portfolio}_${date}`));
    sharedElements.loadingSpinner().should('not.exist');
});

Cypress.Commands.add('loadApplication' as any, () => {
    cy.visit(Cypress.env('introPageUrl'));
    sharedElements.loadingSpinner().should('not.exist');
    introPage.portfolioSearchInput().should('be.visible');
});

Cypress.Commands.add('loadPortfolio' as any, (portfolio: string) => {
    introPage.searchPortfolio(portfolio);
    sharedElements.loadingSpinner().should('not.exist');
});

Cypress.Commands.add('changeDate' as any, (date: string) => {
    portfolioInputPanel.dateInput().click().type(date).click();
    sharedElements.loadingSpinner().should('not.exist');
});

Cypress.Commands.add('staticColumnValues' as any, () => {
    cy.intercept('GET', CypressCommonConstants.EXPLORE_BETA_CONTEXT_PATH + '/getStaticColumnValues?colTag=sec_group&requestId=*', (req) => req.reply({
        statusCode: 200,
        fixture: 'mocks/getStaticColumnValues/sec_group.json'
    }));
});

export {};

declare global {
    namespace Cypress {
        interface Chainable {

            matchChartSnapshot(snaphotName: string, element: Cypress.Chainable, useToggle: boolean): void;

            /**
             * Initialize Explore main page with given portfolio and date
             * @param portfolio - portfolio ticker eg> SNP100
             * @param date - yyyymmdd format eg> 20240205
             */
            initializeMainPage(portfolio: string, date: string): Chainable;

            /**
             * intercept and reply with mocked responses for all the calls going to backend while loading Explore application
             */
            mockApplicationLoading(): Chainable;

            /**
             * mock getTimePeriodDatesAndName
             * @param numberOfPeriod - eg> 2
             * @param frequency - eg> QTD
             */
            mockGetTimePeriodDatesAndName(numberOfPeriod: string, frequency: string): Chainable;

            /**
             * loads Explore application for url configured in cypress.config.ts
             */
            loadApplication(): Chainable;

            /**
             * intercept and reply with mocked responses for all the calls going to backend while loading any portfolio in Explore application
             */
            mockPortfolioLoading(portfolio: string): Chainable;

            /**
             * intercept and reply with mocked responses for all the calls going to backend while loading any widget in Explore application
             */
            mockWidgetLoading(): Chainable;

            /**
             * intercept and reply with mocked responses for all the calls going to backend while loading Risk and Exposure widget with Display Options Explore application
             */
            mockWidgetDisplayOptionLoading(): Chainable;

            /**
             * intercept and reply with mocked responses for all the calls going to backend while loading Bar Chart with ROE (%)  column in Explore application
             */
            mockWidgetROEColumnLoading(): Chainable;

            /**
             * loads the given portfolio from home page
             * @param portfolio portfolio to be loaded
             */
            loadPortfolio(portfolio: string): Chainable;

            /**
             * change the date in portfolio input panel
             * @param date date to be changed to
             */
            changeDate(date: string): Chainable;

            /**
             * loads the static columns for Security Group filter while configuring a custom new filter in portfolio filter settings
             */
            staticColumnValues(): Chainable;
        }
    }
}
function updatedColumnData(prismData: any,req:any):any {
    if (prismData[0].output["data"]["columnHeaderDetails"]["columnKeyToDisplayNameMap"]) {
        prismData[0].output["data"]["columnHeaderDetails"]["columnKeyToDisplayNameMap"][req.body.columns[3].columnKey] = req.body.columns[3].title;
    }
    if (prismData[0].output["data"]["columnHeaderDetails"]["columnKeyToTagMap"]) {
        prismData[0].output["data"]["columnHeaderDetails"]["columnKeyToTagMap"][req.body.columns[3].columnKey] = "market_val"
    }
    let newkey = req.body.columns[3].columnKey;
    prismData[0].output["data"].columns[3]=newkey;
    return prismData;
}

function updateROEColumnData(prismData: any, req: any): any {
    let columnKey = req.body.columns[1].columnKey;
    let splitColumnKey = { "header": "FY-0",
                            "originalKey": columnKey +"|FY-0",
                            "CLASS_TYPE": "com.bfm.prism.data.tree.SplitColumnIdentifier",
                            "updatedKeySuffix": "FY-0",
                            "updatedKey": columnKey +"|FY-0"};
    if (prismData[0].output["data"]["splitColumnKeys"]) {
        prismData[0].output["data"]["splitColumnKeys"][columnKey] = [];
        prismData[0].output["data"]["splitColumnKeys"][columnKey][0] = splitColumnKey
    }
    if (prismData[0].output["data"]["columnHeaderDetails"]["columnKeyToDisplayNameMap"]) {
        prismData[0].output["data"]["columnHeaderDetails"].columnKeyToDisplayNameMap = {};
        prismData[0].output["data"]["columnHeaderDetails"]["columnKeyToDisplayNameMap"][req.body.columns[0].columnKey]= "Notional Market Value %";
        prismData[0].output["data"]["columnHeaderDetails"]["columnKeyToDisplayNameMap"][req.body.columns[1].columnKey]= req.body.columns[1].title+'(Median-PORT)';
    }
    if (prismData[0].output["data"]["columnHeaderDetails"]["columnKeyToTagMap"]) {
        prismData[0].output["data"]["columnHeaderDetails"].columnKeyToTagMap = {};
        prismData[0].output["data"]["columnHeaderDetails"]["columnKeyToTagMap"][req.body.columns[0].columnKey] = "pct_notional_val"
        prismData[0].output["data"]["columnHeaderDetails"]["columnKeyToTagMap"][req.body.columns[1].columnKey] = "eq_fin_th_ws_147"
    }
    let newkey = req.body.columns[1].columnKey + "|FY-0";
    prismData[0].output["data"].columns[1]=newkey;
    return prismData;
}

