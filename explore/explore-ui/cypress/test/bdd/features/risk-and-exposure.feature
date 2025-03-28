Feature: Data Comparison tests for Risk and Exposure

    Background:
        Given "Risk and Exposure" with default settings is added to a report for portfolio "SNP100" with date "20230202"

    Scenario: Validate Risk and Exposure table with default settings
        Then Risk and Exposure widget should be displayed with the correct default data

    Scenario: Validate Risk and Exposure table with expand / collapse
        When I maximize widget
        And I expand "CASH" row
        Then Risk and Exposure widget should be displayed with CASH row expanded

        When I right click on "SNP100" cell to open context menu and click on "Collapse All Levels"
        Then Risk and Exposure widget should be displayed with All rows collapsed

        When I right click on "SNP100" cell to open context menu and click on "Expand All Levels"
        Then Risk and Exposure widget should be displayed with All rows expanded
