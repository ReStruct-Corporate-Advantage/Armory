Feature: Validate Portfolio Filter Settings

Background:
    Given Portfolio is loaded for historical bussiness day
    And Navigate to portfolio filter settings

Scenario: Validate Portfolio Filter Settings
    Then Filter screen elements should be displayed correctly

Scenario: Validate user can configure custom filter condition
    When User configure a custom filter rule
    Then Filter is configured correctly
    And Filter can be reset using New button
