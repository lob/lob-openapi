# Contract Tests in CI

This version of our contract tests in CI works as a private github action rather than as a public
github action. Extracting it out of the spec repo into a public github action repo is a planned
future task.

## How to use

1. Create a valid Lob API test token
2. Add the test token as a repository secret in the repository in which you
   intend to run this action.
3. Include this action (the directory and all its files):

   - action.yml
   - Dockerfile
   - entrypoint.sh
   - and the README.md

   in a directory in your repo, e.g., `/actions/contract_tests`

4. In your workflow, include a step that
   uses the action. If you use `npm` and
   `npm test` to run your tests, you can
   use the defaults, like so:

   ```yml
   test:
     runs-on: ubuntu-latest

     steps:
       - name: checkout
         uses: actions/checkout@v2

       - name: contract tests
         uses: ./actions/contract_tests
         env:
           LOB_API_TEST_TOKEN: ${{ secrets.TEST_TOKEN_FROM_STEP_2 }}
           LOB_API_LIVE_TOKEN: ${{ secrets.LOB_API_LIVE_TOKEN }}
   ```

You can configure the installation and/or test commands used. Look in `action.yml` for details.
