# Alerts

- [Introduction](#introduction)
- [Configuration](#configuration)
- [Slack Web API](#slack-web-api)
- [Error Message](#error-message)

## Introduction

If a contract test fails during a monitoring run, the monitor sends an alert to the Slack channel for the relevant on-call goalie. The rest of this guide explains the previous sentence.

## Configuration

The information required for alerts––the test names and Slack channel associated with each goalie––lives in `package.json`, within the `goalieMappings` section of `config`. To add a new set of contract tests for a resource to a particular team, just add the name and path of the test under the `resources` section of the correct goalie. To add a new team, put it under `goalieMappings` follow the same format for `resources` and `slackChannel` as the other teams. To change the name of the slack channel for a particular goalie, modify the value associated with `slackChannel` under that goalie's mapping.

## Slack Web API

The script which runs the tests, `actions/contract_tests/goalieruns.js`, uses the [Slack Web API](https://api.slack.com/web#basics) to send alerts to the appropriate goalie channels (all of which are specified in the `config` section of `package.json`). The line `web = new WebClient(process.env.SLACK_TOKEN)` initialises a new instance of Slack's WebClient, which is then used to send the appropriate error message to the right channel, through the `postMessage` function.

## Error Message

The message sent for a failing contract test is simple.

This is a sample error which could be surfaced in one of the goalie channels, due to a contract test failure:

```
FAILED CONTRACT TEST: at /github/workspace/tests/zip_lookups_test.js:43:5

EXPECTED:  200
ACTUAL:    422
```

There is no error stacktrace, because most of the stacktrace (save for the failed test line included in the current message) shows the parts in the tape module which errored (and those will stay the same regardless of which test fails).

The particular error message, in case of a contract test failure triggered by a mistake in production on our end, will always be "should be strictly equal", because we'd be surfacing a status code that doesn't match the one we expect in the tests. The test summary (e.g. "use an incorrectly formatted zip code") doesn't change from run to run, so that too can be excluded. Therefore, so that this doesn't clutter up any goalie channels, only the most important information––which contract test failed, the received status code, and the expected status code––will be surfaced in the message.
