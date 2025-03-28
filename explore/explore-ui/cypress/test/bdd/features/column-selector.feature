Feature: Visual Comparison tests for column selector

    Background:
        Given "Risk and Exposure" with default settings is added to a report for portfolio "SNP100" with date "20230202"
 
    Scenario: Validate new column can be added in column selector
        When I open widget settings modal from "Risk and Exposure"
        And I click Columns tab
        And I add column "Market Value"
        Then "Market Value" column is present in selected columns
        And "Market Value" column options are visible

        When I select column option "Column-level breakdown"
        Then "Column-level breakdown" options are visible

        When I select column "CUSIP"
        Then "CUSIP" column options are visible

        When I clone "Market Value" column
        Then "Market Value" column is cloned in selected columns

