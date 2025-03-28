Feature: Change Portfolio Benchmark

    Background:
        Given Portfolio is loaded for historical bussiness day

    Scenario: Change Benchmark from Primary to Secondary
        When select secondary benchmark
        Then verify portfolio benchmark should be changed to secondary benchmark

    Scenario: Change Benchmark to other and load any portfolio
        When select other benchmark
        Then verify portfolio benchmark should be changed to other benchmark
