..
    Copyright (C) 2020 CERN.
    Copyright (C) 2020 Northwestern University.

    Invenio App RDM is free software; you can redistribute it and/or modify
    it under the terms of the MIT License; see LICENSE file for more details.

Contributing
============

Contributions are welcome, and they are greatly appreciated! Every
little bit helps, and credit will always be given. Additional documentation 
can be found in the Invenio `maintainers guide <https://inveniordm.docs.cern.ch/maintenance/newcomers/#tools>`_.


Types of Contributions
----------------------

Report Bugs
~~~~~~~~~~~

Report bugs at https://github.com/inveniosoftware/invenio-app-rdm/issues.

If you are reporting a bug, please include:

* Your operating system name and version.
* Any details about your local setup that might be helpful in troubleshooting.
* Detailed steps to reproduce the bug.

Fix Bugs
~~~~~~~~

Look through the GitHub issues for bugs. Anything tagged with "bug"
is open to whoever wants to implement it.

Implement Features
~~~~~~~~~~~~~~~~~~

Look through the GitHub issues for features. Anything tagged with "feature"
is open to whoever wants to implement it.

Write Documentation
~~~~~~~~~~~~~~~~~~~

Invenio App RDM could always use more documentation, whether as part of the
official Invenio App RDM docs, in docstrings, or even on the web in blog posts,
articles, and such.

Submit Feedback
~~~~~~~~~~~~~~~

The best way to send feedback is to file an issue at
https://github.com/inveniosoftware/invenio-app-rdm/issues.

If you are proposing a feature:

* Explain in detail how it would work.
* Keep the scope as narrow as possible, to make it easier to implement.
* Remember that this is a volunteer-driven project, and that contributions
  are welcome :)

Get Started!
------------

Ready to contribute? Here's how to set up `invenio-app-rdm` for local development.

1. Fork the `inveniosoftware/invenio-app-rdm` repo on GitHub.
2. Clone your fork locally:

   .. code-block:: console

      $ git clone git@github.com:your_name_here/invenio-app-rdm.git

3. Install your local copy. Assuming you have
   `pipenv <https://docs.pipenv.org/install/#installing-pipenv>`_, installed, this is how you
   set up your fork for local development:

   .. code-block:: console

      $ mkvirtualenv invenio-app-rdm
      $ cd invenio-app-rdm/
      $ pip install -e ".[all]"

4. Create a branch for local development:

   .. code-block:: console

      $ git checkout -b name-of-your-bugfix-or-feature

   Now you can make your changes locally.

5. When you're done making changes, check that your changes pass tests:

   .. code-block:: console

      $ ./run-tests.sh

   The tests will provide you with test coverage and also check PEP8
   (code style), PEP257 (documentation), flake8 as well as build the Sphinx
   documentation and run doctests.

6. Commit your changes and push your branch to GitHub:

   .. code-block:: console

      $ git add .
      $ git commit -s
          -m "component: title without verbs"
          -m "* NEW Adds your new feature."
          -m "* FIX Fixes an existing issue."
          -m "* BETTER Improves and existing feature."
          -m "* Changes something that should not be visible in release notes."
      $ git push origin name-of-your-bugfix-or-feature

7. Submit a pull request through the GitHub website.

Pull Request Guidelines
-----------------------

Before you submit a pull request, check that it meets these guidelines:

1. The pull request should include tests and must not decrease test coverage.
2. If the pull request adds functionality, the docs should be updated. Put
   your new functionality into a function with a docstring.
3. The pull request should work for Python 2.7, 3.3, 3.4 and 3.5. Check
   https://github.com/inveniosoftware/invenio-app-rdm/actions?query=event%3Apull_request
   and make sure that the tests pass for all supported Python versions.
