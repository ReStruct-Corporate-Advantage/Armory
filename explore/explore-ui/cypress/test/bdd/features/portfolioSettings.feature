Feature: Validate Portfolio Settings

Background:
    Given Portfolio is loaded for historical bussiness day
    When Navigate to portfolio settings

Scenario: Validate Portfolio Settings tabs are displayed
    Then all the tabs in portfolio settings should be displayed

Scenario: Validate Split Settings options are displayed
    And select the Split Settings tab
    Then all the split settings should be displayed correctly
