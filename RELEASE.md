> v2.1.1 ~ "Query strings Fleetbase APIs can read"

## Highlights

- Query lists and nested values are sent in bracket form (`ids[]=1&ids[]=2`, `filter[active]=true`, `stops[0][id]=s1`), as SDK v1 sent them on native. v2.0 and v2.1.0 repeated the key (`ids=1&ids=2`), which PHP and Laravel read as only the last value, so multi-value filters such as store tags or several cart origins reached the API as one value.

## Compatibility

A patch release with no API changes. Nested query objects were JSON-encoded in v2.0 and v2.1.0 and are now bracketed.

This is the release branch's metadata, not evidence that v2.1.1 has been published. Merging this release PR into `main` tags and publishes it.
