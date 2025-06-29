# Contributing

Thanks for your interest in contributing to `neondb`!

> After this page, see [DEVELOPMENT.md](./DEVELOPMENT.md) for local development instructions.

## Code of Conduct

This project contains a [Contributor Covenant code of conduct](./CODE_OF_CONDUCT.md) all contributors are expected to follow.

## Reporting Issues

Please do [report an issue on the issue tracker](https://github.com/neondatabase/neondb-cli/issues/new/choose) if there's any bugfix, documentation improvement, or general enhancement you'd like to see in the repository! Please fully fill out all required fields in the most appropriate issue form.

## Sending Contributions

Sending your own changes as contribution is always appreciated!
There are two steps involved:

1. [Finding an Issue](#finding-an-issue)
2. [Sending a Pull Request](#sending-a-pull-request)

### Finding an Issue

With the exception of very small typos, all changes to this repository generally need to correspond to an [unassigned open issue marked as `status: accepting prs` on the issue tracker](https://github.com/neondatabase/neondb-cli/issues?q=is%3Aissue+is%3Aopen+label%3A%22status%3A+accepting+prs%22+no%3Aassignee+).
If this is your first time contributing, consider searching for [unassigned issues that also have the `good first issue` label](https://github.com/neondatabase/neondb-cli/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22+label%3A%22status%3A+accepting+prs%22+no%3Aassignee+).
If the issue you'd like to fix isn't found on the issue, see [Reporting Issues](#reporting-issues) for filing your own (please do!).

#### Issue Claiming

We don't use any kind of issue claiming system.
We've found in the past that they result in accidental ["licked cookie"](https://devblogs.microsoft.com/oldnewthing/20091201-00/?p=15843) situations where contributors claim an issue but run out of time or energy trying before sending a PR.

If an unassigned issue has been marked as `status: accepting prs` and an open PR does not exist, feel free to send a PR.
Please don't post comments asking for permission or stating you will work on an issue.

### Sending a Pull Request

Once you've identified an open issue accepting PRs that doesn't yet have a PR sent, you're free to send a pull request.
Be sure to fill out the pull request template's requested information -- otherwise your PR will likely be closed.

We use [changesets](https://github.com/changesets/changesets/tree/main).
Once you're done, describe the changes you made in a \*short and clear\*\* paragraph.

| Change Type | Release Type |
| ----------- | ------------ |
| bugfix      | patch        |
| feature     | minor        |
| API change  | major        |

#### Draft PRs

If you don't think your PR is ready for review, [set it as a draft](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/changing-the-stage-of-a-pull-request#converting-a-pull-request-to-a-draft).
Draft PRs won't be reviewed.

#### Granular PRs

Please keep pull requests single-purpose: in other words, don't attempt to solve multiple unrelated problems in one pull request.
Send one PR per area of concern.
Multi-purpose pull requests are harder and slower to review, block all changes from being merged until the whole pull request is reviewed, and are difficult to name well with semantic PR titles.

#### Pull Request Reviews

When a PR is not in draft, it's considered ready for review.
Please don't manually `@` tag anybody to request review.
A maintainer will look at it when they're next able to.

PRs should have passing [GitHub status checks](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/about-status-checks) before review is requested (unless there are explicit questions asked in the PR about any failures).

#### Asking Questions

If you need help and/or have a question, posting a comment in the PR is a great way to do so.
There's no need to tag anybody individually.
One of us will drop by and help when we can.

Please post comments as [line comments](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/commenting-on-a-pull-request#adding-line-comments-to-a-pull-request) when possible, so that they can be threaded.
You can [resolve conversations](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/commenting-on-a-pull-request#resolving-conversations) on your own when you feel they're resolved - no need to comment explicitly and/or wait for a maintainer.

#### Requested Changes

After a maintainer reviews your PR, they may request changes on it.
Once you've made those changes, [re-request review on GitHub](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/about-pull-request-reviews#re-requesting-a-review).

Please try not to force-push commits to PRs that have already been reviewed.
Doing so makes it harder to review the changes.
We squash merge all commits so there's no need to try to preserve Git history within a PR branch.

Once you've addressed all our feedback by making code changes and/or started a followup discussion, [re-request review](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/about-pull-request-reviews#re-requesting-a-review) from each maintainer whose feedback you addressed.

Once all feedback is addressed and the PR is approved, we'll ensure the branch is up to date with `main` and merge it for you.
