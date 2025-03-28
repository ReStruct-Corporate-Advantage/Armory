Feature: Visual Comparison tests for Scatter Plot

    Background:
        Given "Scatter Plot" with default settings is added to a report for portfolio "BGO" with date "20190611"

    Scenario: Validate scatter plot  is loading
        When I maximize widget
        Then "Scatter Plot" should be displayed, aligning with the snapshot "scatterplot_default"