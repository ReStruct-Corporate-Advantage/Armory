Feature: Visual Comparison tests for display settings

    Background:
        Given "Risk and Exposure" with display options settings is added to a report for portfolio "SNP100" with date "20230202"

    Scenario: Validate display options data for column Market Value %  
        When I open widget settings modal from "Risk and Exposure"
        And "Market Value %" column is present in selected columns
        And I select column "Market Value %"
        And I select radio option for DisplaySettings "None"
        And I apply widget settings
        Then Risk and Exposure widget should be displayed with the scaling None data for Market Value %

        When I open widget settings modal from "Risk and Exposure"
        And "Market Value %" column is present in selected columns
        And I select column "Market Value %"
        And I select radio option for DisplaySettings "Basis Point (bp)"
        And I apply widget settings
        Then Risk and Exposure widget should be displayed with the scaling Basis Point data for Market Value %

        When I open widget settings modal from "Risk and Exposure"
        And "Market Value %" column is present in selected columns
        And I select column "Market Value %"
        And I select radio option for DisplaySettings "Percent (%)"
        And I apply widget settings
        Then Risk and Exposure widget should be displayed with the scaling Percent data for Market Value %    

    Scenario: Validate display options data for column Market Value       
        When I open widget settings modal from "Risk and Exposure"
        And I click Columns tab
        And I add column "Market Value"
        And "Market Value" column is present in selected columns
        And I apply widget settings
        And I maximize widget
        Then Risk and Exposure widget should be displayed with the scaling Thousands data

        When I open widget settings modal from "Risk and Exposure"
        And "Market Value" column is present in selected columns
        And I select radio option for DisplaySettings "Millions (mm)"
        And I change number of decimal places to "0"        
        And I apply widget settings
        Then Risk and Exposure widget should be displayed with the scaling Millions data

        When I open widget settings modal from "Risk and Exposure"
        And "Market Value" column is present in selected columns
        And I click thousands separator checkbox (UNCHECK)
        And I select radio option for DisplaySettings "None"
        And I apply widget settings
        Then Risk and Exposure widget should be displayed with the scaling None data

        When I open widget settings modal from "Risk and Exposure"
        And "Market Value" column is present in selected columns
        And I click thousands separator checkbox (CHECK)
        And I select radio option for DisplaySettings "Thousands (m)"
        And I apply widget settings
        Then Risk and Exposure widget should be displayed with the scaling Thousands data

        When I open widget settings modal from "Risk and Exposure"
        And "Market Value" column is present in selected columns
        And I select radio option for DisplaySettings "Billions (mmm)"
        And I apply widget settings
        Then Risk and Exposure widget should be displayed with the scaling Billions data

        When I open widget settings modal from "Risk and Exposure"
        And "Market Value" column is present in selected columns
        And I type in "Test" on ColumnTitle text input
        And I apply widget settings
        Then Risk and Exposure widget should be displayed with the changed column Title data

       

        

        
        
        

