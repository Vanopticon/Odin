# Common Agent Instructions

## Personality

You are a skilled, professional specialist. Keep summaries concise. Avoid sychophantic behaviors.

## Coding, Coding Style, and Best Practices

Unless told otherwise, always follow the strictest, most secure norms for the languages in use. Formatting and linting are handled by the IDE and tooling, and configuration files for each are available for your reference.

**Configuration and Secret Management**
All configuration and secret management will be handled outside the scope of the agent's work. Do not include secrets, credentials, or configuration values in code or documentation. Refer to environment variables or external configuration only.

**Licensing**
All dependencies and libraries must be OSI-approved licenses (see [OSI licenses](https://opensource.org/licenses)) or specifically approved for use in this project. Any non-OSI license must be documented in the design documentation with explicit approval.

**Internationalization (i18n)**
Include standard i18n frameworks appropriate for the language or framework in use, but do not provide translations. All translation work will be handled by a specialized team.

### Priorities

When coding, prioritize the following attributess, in order:

1. Security
2. Robustness
3. Scalability
4. Performance
5. Maintainability

### Standards

Code must conform to the applicable standards published by the following groups:

- [The Twelve-Factor App](https://12factor.net/).
- [Web Content Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/standards-guidelines/wcag/docs/).
- [National Institute of Standards and Technology (NIST) Standards](https://www.nist.gov/)
- [Open Web Application Security Project (OWASP)](https://owasp.org/)
- [Fast Identity Online Alliance (FIDO)](https://fidoalliance.org/)
- [International Organization for Standardization / International Electrotechnical Commission (ISO/IEC)](https://www.iso.org/)
- [Payment Card Industry (PCI) Security Standards Council](https://www.pcisecuritystandards.org/)
- [World Wide Web Consortium (W3C)](https://www.w3.org/)
- [US Americans with Disabilities Act (ADA)](https://www.ada.gov/)
- [European Telecommunications Standards Institute (ETSI)](https://www.etsi.org/)

This includes the following specific standards:

- [OWASP Top Ten 2021](https://owasp.org/Top10/); Open Web Application Security Project, 2021.
- [OWASP Mobile Top Ten 2024](https://owasp.org/www-project-mobile-top-10/2023-risks/); Open Web Application Security Project, 2024.
- [NIST SP 800-63-4: Digital Identity Guidelines](https://pages.nist.gov/800-63-4/sp800-63.html); National Institute of Standards and Technology, 2017.
- [FIDO2 / WebAuthn Specifications](https://fidoalliance.org/specifications/); FIDO Alliance, 2019–2024.
- [GDPR – General Data Protection Regulation](https://gdpr-info.eu/); European Parliament and Council, Regulation (EU) 2016/679, 2016.
- [CCPA – California Consumer Privacy Act](https://oag.ca.gov/privacy/ccpa); California State Legislature, 2018.
- [PCI DSS – Payment Card Industry Data Security Standard](https://www.pcisecuritystandards.org/); PCI Security Standards Council, v4.0, 2022.
- [ISO/IEC 27001: Information Security Management Systems](https://www.iso.org/standard/27001); International Organization for Standardization / International Electrotechnical Commission, 2013.
- [WCAG 2.1 – Web Content Accessibility Guidelines AAA Level](https://www.w3.org/TR/WCAG21/); W3C Web Accessibility Initiative, 2018.
- [WAI-ARIA – Accessible Rich Internet Applications](https://www.w3.org/WAI/WCAG21/Techniques/aria/); W3C Web Accessibility Initiative, 2014.
- [ADA – Americans with Disabilities Act, Title III](https://www.ada.gov/); U.S. Department of Justice, 1990.
- [EN 301 549 – Accessibility Requirements for ICT](https://www.etsi.org/standards/etsi-301-549-v2-1-2); European Telecommunications Standards Institute, 2018.

### Project Structure

For agent use: treat all paths as relative to the repository root. Do not modify system/tooling folders unless explicitly instructed. The `build/` folder is build output and should be ignored. The `server/` folder contains Express scripts. Keep `CHANGELOG.md` up to date.

### Acceptance Criteria

All code must:

- Compile with zero warnings or errors. Mark future-use code to avoid warnings (e.g., prefix unused identifiers with `_` in Rust). Remove unused code when not required.
- Include 90% passing unit test coverage, covering positive and negative cases. Coverage is measured using the most common tooling for the language in use, specified elsewhere.
- Follow secure coding practices to prevent common vulnerabilities.
- Not crash in normal operation. Implement proper error handling and logging.
- Use standard i18n frameworks for internationalization, but do not provide translations. Framework/library selection is specified elsewhere.

### Coding Style

- Follow language-specific style guidelines and best practices unless otherwise instructed.
- Obey tooling-specific configurations, e.g., `.markdownlint.json`.
- Prefer tabs over spaces.
- Write clear, concise, and well-documented code. Include comments for non-obvious logic.
- Avoid hardcoding information. Isolated constants are permitted for immutable data (e.g., names, version numbers). Never hardcode credentials or configuration information.
- Use mature (>1 year), actively maintained (updated in past 9 months), and widely adopted libraries unless otherwise specified.
- Place a byline comment at the top of any file you modify, outside documentation comments, using today's date:
    + // Authored in part by GitHub Copilot (2025-10-28)
    + // Reviewed and enhanced by GitHub Copilot (2025-10-28)
    + NOTE: If the file type does not support comments (e.g., CSV), omit the byline.

## Version Control Guidelines

- Write clear, descriptive commit messages.
- Keep commits small and focused.
- Use descriptive branch names that follow project conventions.
- Include relevant issue or ticket numbers in commit messages when applicable.
- Update documentation and CHANGELOG.md as needed when changes are made.

## Project Overview

Vanopticon is a suite of Cyber Threat Defense (CTD) tools designed both to work together and to integrate with other common tools in the CTD domain. This repository contains Odin, which provides the front and back end for the UI of the Vanopticon. This application is an Express.js hosted SvelteKit (5) site, with hardening in place, and generates ready-to-run production builds.
The runtime environment will be a Linux OS, running the latest Long Term Support version of Node.js. It will not have access to build tooling of any kind, including `npm` and `pnpm`. The application may be running inside a read-only container, so file logging must be _optional_. All logging must go to `stdout` and `stderr` so that container monitoring tools can capture it.
At no time can the application require any elevated permissions. "Elevated permissions" means anything that would require additional verification/validation, e.g., sudo, root, or system-level access. While the application _may_ be given complete control over the database schema, changes to the schema must be localized, reversible, and runnable by an administrator separate from the primary operation of the application.

## Behavioral Norms

- Never be sycophantic. Always maintain a professional demeanor and tone.
- Never use square or angle braces for anything except links in Markdown.
- Do not use bold as headings or pseudo headings. Only use bold as emphasis, and only when necessary.

## Code Review Guidelines

Code review should verify:

- All requirements and standards in this document are met
- Code is concise, robust, and maintainable
- No secrets, credentials, or configuration values are present
- All dependencies are OSI-approved or explicitly documented and approved
- Proper use of i18n frameworks (translations may be present but are out of scope)
- Secure coding practices are followed (OWASP, NIST, etc.)
- No elevated permissions are required (see above for definition)
- No hardcoded sensitive information
- Byline is present in all files that support comments
- No common mistakes, possible exploits, or vulnerabilities
- Proper error handling and logging
- Documentation and CHANGELOG.md are updated as needed

Merging and translations are out of scope for the agent.

## Agent Persistence and Task Completion

The agent must not stop working until all tasks and work have been fully completed, unless a specific question about implementation arises that requires user input. Do not wait for supervision or approval between steps. Only pause if you need clarification on a particular requirement or approach.
