Feature: Visual Comparison tests for conditional formatting

    Background:
        Given "Risk and Exposure" with default settings is added to a report for portfolio "SNP100" with date "20230202"
    
    Scenario: Validate Conditional Formatting for Risk and Exposure
        When I open widget settings modal from "Risk and Exposure"
        And I select column "Market Value %"
        And "Market Value %" column options are visible
        And I select column option "Conditional formatting"
        And I click on Add Rule button
        And I select "Greater than" in the rule dropdown
        And I enter "10" in the value field
        And I select "cell only" in color field
        And I click on background color picker to select the color "RGB,255,0,0"
        And I click "Second to last level of data" checkbox (CHECK)
        And I apply widget settings
        And I maximize widget
        And I right click on "SNP100" cell to open context menu and click on "Expand All Levels"
        Then Risk and Exposure should be displayed with conditional formatting applied
    
    Scenario: Validate Conditional Formatting for Risk and Exposure for Greather than or equals condition
        When I open widget settings modal from "Risk and Exposure"
        And I select column "Market Value %"
        And "Market Value %" column options are visible
        And I select column option "Conditional formatting"
        And I click on Add Rule button
        And I select "Greater than or equal" in the rule dropdown
        And I enter "9" in the value field
        And I select "text only" in color field
        And I click on font text picker to select the color "RGB,255,0,0"
        And I click "Last level of data" checkbox (UNCHECK)
        And I apply widget settings
        And I maximize widget
        And I right click on "SNP100" cell to open context menu and click on "Expand All Levels"
        Then Risk and Exposure should be displayed with conditional formatting applied
    
    Scenario: Validate Conditional Formatting for Risk and Exposure for Not equals condition
        When I open widget settings modal from "Risk and Exposure"
        And I select column "Market Value %"
        And "Market Value %" column options are visible
        And I select column option "Conditional formatting"
        And I click on Add Rule button
        And I select "Does not equal" in the rule dropdown
        And I enter "12" in the value field
        And I select "cell and text" in color field
        And I click on color and text picker to select the color "RGB,255,0,0/RGB,0,255,0"
        And I apply widget settings
        And I maximize widget
        And I right click on "SNP100" cell to open context menu and click on "Expand All Levels"
        Then Risk and Exposure should be displayed with conditional formatting applied