# Contract Monitoring

- [Contract Monitoring](#contract-monitoring)
  - [Introduction](#introduction)
  - [Monitoring in GitHub](#monitoring-in-github)
  - [Controlling the Monitoring Workflow](#controlling-the-monitoring-workflow)
  - [Test Scripts](#test-scripts)
  - [Alerts](#alerts)

## Introduction

Monitoring tests exist for all of the endpoints specified by Lob OpenAPI. These tests are automatically scheduled to run every 30 minutes, against the production version of each endpoint. The following document will explain all the components which go into running monitoring tests smoothly.

## Monitoring in GitHub

We use GitHub Actions to run the monitoring tests. To view the monitor runs, click on the Actions tab in Lob OpenAPI on GitHub, then select "Monitor API contracts" from the left sidebar to get to [this page](https://github.com/lob/lob-openapi/actions/workflows/monitor.yml). Click on any of the instances shown to see the results of the scheduled tests, which are divided into three sections by goalie (Address Verification, Print and Mail API, and Billing).

## Controlling the Monitoring Workflow

The monitoring tests are controlled by a GitHub workflow: `.github/workflows/monitor.yml`. This section will provide a comprehensive breakdown of the information in that file.

The first part is what schedules the tests to run every 30 minutes:

```
on:
  schedule:
    - cron: "*/30 * * * *"
```

There are multiple ways to configure this (such as on pull request), which are discussed [here](https://docs.github.com/en/actions/reference/events-that-trigger-workflows).

`monitor.yml` runs three separate jobs, one for each goalie grouping. They are identical to each other in most respects, from the operating system they run on to the general steps. The two main ways in which they may differ from each other are (1) the secrets used in their respective environments, and the argument being fed to the `pergoalie` script (which will be discussed in the next section). Lob's US Verification endpoint requires a live key to be used, whereas the none of the other endpoints do, which is why only AV's job contains `LOB_API_LIVE_TOKEN` in its environment.

## Test Scripts

For each of the jobs described in `monitor.yml`, the command which runs the monitoring tests is `"npm run pergoalie [goalie]"`. `pergoalie` is a script found in `package.json`, and in turn that script references `actions/contract_tests/goalieruns.js`. This script uses information pulled from the `config` section of `package.json` to run all the tests associated with a specific goalie. It is O(n), despite having a nested for loop, since the test commands only pass a single goalie in at a time (the nested loop is in case someone wants to run it locally with more than one goalie).

## Alerts

See [the ALERTS page](ALERTS.md)
