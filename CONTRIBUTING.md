Contributing
-----------

Here are wonderful ways you can contribute to the Official Canvas Alexa Lambda Skill:

## Submitting Pull Requests

In order for us to continue to dual-license our Canvas product to best serve
all of our customers, we need you to sign our contributor agreement before we
can accept a pull request from you. After submitting a pull request, you'll see
a status check that indicates if a signature is required or not. If the CLAHub
check fails, click on Details and then complete the web form. Once finished,
the CLA check on the pull request will pass successfully. Please read our
[FAQ](https://github.com/instructure/canvas-lms/wiki/FAQ) for more information.

To save yourself a considerable headache, please consider doing development against
our master branch instead of the default stable branch. Our stable branch is
occasionally reforked from master from time to time, so your Git history may get
very confused if you are attempting to contribute changesets against stable.

If you choose to contribute a pull request to Canvas Alexa Lambda, following
these guidelines will make things easier for you and for us:

 - Your pull request should generally consist of a single commit. This process helps keep the git history clean
   by keeping each commit focused on a single purpose. Multiple commits that maintain that focus
   are acceptable, but "train of thought" commits should not be in the history.
 - Your commit message should follow this general format:

   ```
    Summary of the commit (Subject)

    Further explanation of the commit, generally focusing on why you chose
    the approach you did in making this change.

    closes gh-xxx (include the github issue number if applicable)

    Test Plan:
      - Use this space to enumerate steps that need to be taken to test this commit
      - Test plans are important for our in-house QA personnel
   ```

 - The process your pull request goes through is as follows:
    - An Instructure engineer will pull the request down and run it through our automated test suite.
      They will report back with results of the testing. You can help this process along by running targeted
      tests locally prior to submitting the pull request. You should also run `yarn lint` and `yarn test` to make sure
      your commit passes our linter.
    - Once the test passes against our test suites, one or two engineers will look over the code and provide
      a code review.
    - Once the code review is successful, our QA engineers will run through the test plan that has
      been provided and make sure that everything is good to go.
    - If your commit touches any UI elements or behavior of the application, one of our product managers
      will review the changes as well to make sure it is consistent with our product direction.
    - Once all these things have taken place, an engineer will merge your commit into the repository.
    - Congratulations! You are now a Canvas Alexa Lambda contributor! Thank you for helping make Canvas Alexa Lambda great.

Guidelines
----------

- Contributed code should pass our linters

## CLA

### What is it and why do I need to sign it?

The Instructure Contributor Agreement (ICA) is a contributor license agreement which grants us intellectual property rights in material you contribute to a project we own or manage.  Signing the agreement creates a written record which allows us to track our legal rights when we use and distribute any project containing contributor material.  

### What rights am I giving to Instructure?

When you sign the ICA you don’t give up ownership in the material. Instead, you are declaring that (a) you own the material you contribute, (b) that it doesn’t infringe on other intellectual property rights and (c) you are giving us joint-ownership or a license in the material.
