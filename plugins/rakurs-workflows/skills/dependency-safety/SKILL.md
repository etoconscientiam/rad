---
name: dependency-safety
description: "Assess a proposed new production dependency before approval or installation in the RAKURS project."
---

# Dependency Safety

Use before proposing or installing a new production dependency in RAKURS. This
assessment informs the owner; it never grants permission to add the package.

First establish whether the platform, standard library, or an existing package
solves the requirement. If not, assess the exact package and version for:

- maintenance and official source;
- license, known vulnerabilities and install lifecycle scripts;
- direct and transitive dependency footprint;
- client bundle impact when code reaches the configurator;
- security suitability for payment, authentication or personal data.

Use current primary sources where available. Run lockfile-based audit checks only
after an approved lockfile update, and before committing; do not mutate the
project merely to manufacture a reassuring result.

Return a concise decision record: package and purpose, viable alternative,
maintenance signal, graph, audit state, license, relevant size impact, and one
of `NOT NEEDED`, `CANDIDATE`, or `RISKY` with its reason. The owner must still
explicitly approve any new production dependency.
