Add "renders any JSON, however messy" resilience to this app's dynamic
content rendering.

CONTEXT
I have an app that renders UI dynamically from a JSON config/data source
(e.g. a `design_json`, `content`, `layout`, or similar field — find where
this actually happens in this codebase before changing anything). Right
now it can break or blank-screen if that JSON is missing fields, has the
wrong types, uses inconsistent key names, or contains an unrecognized
section/block type. I want it to degrade gracefully instead: bad or
unexpected data should never crash the page or hide unrelated content —
worst case, one broken piece silently disappears while everything else
still renders.

I'm attaching `resilientJsonRenderer.tsx`, which implements this pattern
in three layers. Use it as the basis, adapting names/types to match this
codebase's conventions and language (TS/JS, and framework if not React):

1. SAFE READERS — never read a dynamic field directly. Every read goes
   through a typed helper that coerces to the expected type with a
   fallback, so undefined/null/wrong-type/malformed values can never
   propagate into rendering:
   - safeParse: JSON.parse that tolerates strings, objects, or garbage,
     always returns a usable object, never throws.
   - safeString / safeNumber / safeBool: return the value if it's the
     right type (and non-empty for strings), else a fallback.
   - safeArray: Array.isArray check, else [] — makes every .map/.filter
     downstream safe.
   - firstValidColor (or equivalent for whatever "loosely-typed" fields
     this app has — colors, urls, enums): tries a prioritized list of
     candidate values/aliases/nested shapes and returns the first one
     that actually validates, instead of trusting the first thing found.

2. FUZZY CLASSIFICATION — wherever the JSON has a list of "things with a
   type" (sections, blocks, widgets, steps, whatever the domain object
   is), don't require an exact enum match. Classify each item's
   type/name via keyword pattern matching against a small known set of
   kinds, with an explicit "custom"/"unknown" fallback bucket that still
   renders (generically) rather than being dropped or throwing. If the
   app has certain sections that must always exist, guarantee they're
   present in the normalized list even if the source JSON omitted them.

3. ISOLATED RENDERING — when mapping the normalized list into JSX/
   components, wrap EACH item's render in its own failure boundary:
   - a try/catch around the builder call for simple synchronous cases, and/or
   - a proper error-boundary component (class component with
     getDerivedStateFromError/componentDidCatch in React; framework
     equivalent otherwise) for anything with its own state/effects/
     children.
   One item's failure must never take down sibling items or the rest of
   the page.

WHAT I WANT YOU TO DO
1. Find where this app currently parses/reads its dynamic JSON content
   and turns it into rendered UI. Show me what you found before changing
   it.
2. Add the safe-reader utilities (adapt to this app's actual data shape
   — don't just copy color/section-specific helpers if this app's domain
   is different; keep the *pattern*, generalize the specifics).
3. Add the fuzzy classifier + normalizer for whatever this app's
   "typed list of dynamic items" is, with a rule set that matches this
   app's actual vocabulary, and an explicit fallback/"custom" case.
4. Add the per-item render isolation (error boundary + safe builder call)
   and wire it into the existing render loop.
5. Migrate the existing rendering code to use these utilities instead of
   direct field access — do this incrementally and show me each file you
   touch.
6. Add a couple of tests/fixtures with deliberately bad input (missing
   fields, wrong types, unknown type/kind values, malformed nested
   objects) proving the page still renders and only the offending piece
   is affected.

Don't restructure unrelated parts of the app. Keep the change scoped to
the dynamic-JSON-rendering path.
