# AI chat presentation and form standards

Confirmed with Peter, 26 October 2026. Read before changing Concierge, Help Center, CMS copilots or Stemfra AI Front Desk presentation.

## Findings and source references

- Platform docs/FRONTDESK.md, Structured answers: lists are components built from authoritative data; the agent classifies intent rather than inventing rows. Public widgets deliberately do not use a Markdown pipeline.
- Platform docs/STACY.md, CMS UI: owner-facing responses support Markdown headings, lists and tables. Drafts destined for fields remain plain text. Do not transplant CMS formatting blindly into visitor widgets.
- Platform docs/CMS_MANAGEMENT_TABLES.md: phone inputs reuse PhoneField with country selection and E.164 handling; email validation occurs on save.
- Concierge previously structured only the top-level category selection. AI plan follow-ups still produced a dense paragraph. Help Center shares this API and must support any new response card.

## Required presentation

Use a short natural introduction, then the appropriate existing component. Comparisons use cards or tables, ordered steps use lists, and contact collection uses forms. Keep simple answers short. Ask one useful question at a time. Do not repeat all plans when answering a narrow follow-up.

For product/plan cards, put the name first and price underneath. Group seats and monthly credits separately; show shared billing terms once below the cards. Prices remain visible on touch screens. Only show an arrow or button when it performs a real action. Preserve source facts, availability and billing restrictions while expressing them as customer-facing next steps.

Use established components and tokens exactly unless a technical adaptation is necessary. Keep input height, corner radius, border, background, typography, labels, spacing, focus and error states consistent within the form. Use persistent labels, relevant input types, mandatory-field checks and helpful inline errors. Preserve values after validation failures. Country menus match the full phone field width and background and stay slightly below their trigger through scrolling/resizing. Reuse shared phone validation and country controls, not a bare text field.

Public conversation surfaces stay light, with branded headers and existing outlines. Preserve the concise AI disclosure, responsive drawer behavior, device-aware composer and no decorative emojis in headings. No em dashes in product copy.

## Verification

Inspect the actual reference source before editing. Check first answers AND follow-ups, long labels, mobile widths, keyboard/focus, validation errors and popup anchoring. Render every new response kind in every consumer of that endpoint. Model-supplied presentation keys must be allowlisted and facts server-owned. Do not claim a documentation update changes another product's runtime.

## Current application

Concierge now renders AI plans as verified server-built rows, with prices, seats and credits separated. The agent can request this presentation for paraphrases and contextual follow-ups. Help Center supports the same plan card. Stemfra AI Front Desk receives this guidance for its next implementation review; its runtime is not changed by this task.

Popular questions must be actual questions ending in question marks. Concierge starters, in order: How do I get started?; How does pricing work?; What are your products? (Peter, 26 October 2026).

Redirect links in chat responses must appear in a single vertical column, one link per row, including Concierge and Help Center. Do not wrap them into multiple columns. Preserve existing button styling. (Peter, 26 October 2026.)

Peer product redirect choices use identical outlined styling. Do not highlight the first option merely because it appears first; no product is preferred. A standalone primary action may retain its existing filled style.
