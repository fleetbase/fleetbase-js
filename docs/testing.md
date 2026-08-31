# Testing policy

The release-blocking Vitest suite exercises the complete maintained source boundary and enforces 100% statements, branches, functions, and lines. Tests assert successful behavior, compatibility behavior, and failure paths; generated declarations and build output do not count toward source coverage.

## Mutation quality

The scheduled Stryker workflow is an additional assertion-quality signal. Its explicit boundary is the SDK's core adapter, Fetch transport, collection, registry, resolver, resource, store-action, and store behavior. Platform wrappers are covered by exact-package runtime fixtures, while the legacy inflection tables and declarative resource catalog are covered by contract tests and are not used to inflate or dilute the core mutation score.

The initial all-source baseline generated 1,761 mutants: 1,183 killed, 562 survived, 3 timed out, and 13 had no coverage. Survivor review found that legacy string literals and regular-expression alternatives in the inflection tables, plus declarative resource names and action paths, accounted for most survivors. Core survivors were concentrated in conditional alternatives, returned object shapes, and Fetch option composition.

The reviewed core baseline generated 634 mutants: 480 killed, 143 survived, 3 timed out, and 8 had no coverage, for a 76.18% mutation score. The largest remaining groups are conditional alternatives in the Fetch transport and resource state paths; the complete per-mutant report is retained by CI.

The core boundary has a release floor of 76%. This is a ratchet, not a target: changes must not lower the score, equivalent mutants must be explained in review, and broadly disabling mutators is not allowed. Scheduled reports retain per-mutant evidence for 30 days so the floor can be raised as stronger assertions are added.
