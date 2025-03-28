Feature: Change Portfolio Currency

    Background:
        Given Portfolio is loaded for historical bussiness day

    Scenario: Change Portfolio Currency
        When select another currency
        Then verify portfolio currency should be changed to selected currency
