# rto-mcp

A [Model Context Protocol](https://modelcontextprotocol.io) (MCP) server for **Indian vehicle registration (RTO) lookups**. It lets Claude Code, Claude Desktop, Cline, and any other MCP client decode a vehicle registration number to its RTO office, state, series and vehicle class — or list RTO offices in a state.

A vehicle registration number in India (the number on your RC / registration certificate) follows the format:

```
<STATE><RTO-DISTRICT-CODE><SERIES><SERIAL>
e.g. MH01AB1234
```

- **STATE** — 2-letter state/UT code (MH, DL, KA, TN, …)
- **RTO-DISTRICT-CODE** — 2-digit district code within the state (01–47)
- **SERIES** — 1–2 letters identifying the registration series
- **SERIAL** — up to 4 digits, the unique vehicle number

## What it does

Three tools:

- **`rto_lookup`** — decodes a vehicle registration number into its RTO office (area), state, RTO district code, series, serial and vehicle class.
- **`rto_by_state`** — lists all RTO offices in a state (by state code or name) with their district codes and areas.
- **`vehicle_info`** — returns estimated vehicle details (first registration year, fuel type, category, make/model) for a registration number.

## Quick start

Requires **Node.js 18+** (uses the built-in global `fetch`). No API key is needed.

```bash
# from the monorepo root
npm install          # installs @modelcontextprotocol/sdk
npm run test --workspace rto-mcp   # run the tests
```

Run the server directly (stdio transport):

```bash
node server.js
```

## MCP client configuration

Add it to your MCP client's configuration as a stdio server:

```json
{
  "mcpServers": {
    "rto": {
      "command": "node",
      "args": ["/absolute/path/to/india-mcp/rto-mcp/server.js"]
    }
  }
}
```

Or, from inside the package folder:

```json
{
  "mcpServers": {
    "rto": {
      "command": "node",
      "args": ["server.js"]
    }
  }
}
```

## Tool examples

**`rto_lookup`** — arguments:

| argument | type | required | description |
| --- | --- | --- | --- |
| `registration` | string | yes | Vehicle registration number, e.g. `MH01AB1234` |

Example call:

```json
{ "name": "rto_lookup", "arguments": { "registration": "MH01AB1234" } }
```

Example response (trimmed):

```json
{
  "ok": true,
  "registration": "MH01AB1234",
  "stateCode": "MH",
  "state": "Maharashtra",
  "rtoCode": "01",
  "area": "Mumbai (Central)",
  "series": "AB",
  "serial": "1234",
  "vehicleClass": "Passenger Vehicle"
}
```

An invalid registration (wrong length or pattern) is rejected locally:

```json
{ "name": "rto_lookup", "arguments": { "registration": "MH01AB123" } }
```

```json
{
  "ok": false,
  "error": "registration must match STATE+RTO+SERIES+SERIAL, e.g. MH01AB1234"
}
```

**`rto_by_state`** — arguments:

| argument | type | required | description |
| --- | --- | --- | --- |
| `state` | string | yes | State code (`MH`, `DL`, `KA`, `TN`) or state name (`Maharashtra`) |

Example call:

```json
{ "name": "rto_by_state", "arguments": { "state": "MH" } }
```

Example response (trimmed):

```json
{
  "ok": true,
  "state": "Maharashtra",
  "stateCode": "MH",
  "offices": [
    { "code": "01", "area": "Mumbai (Central)" },
    { "code": "02", "area": "Mumbai (Suburban)" },
    { "code": "05", "area": "Pune" }
  ]
}
```

**`vehicle_info`** — arguments:

| argument | type | required | description |
| --- | --- | --- | --- |
| `registration` | string | yes | Vehicle registration number, e.g. `MH01AB1234` |

Example call:

```json
{ "name": "vehicle_info", "arguments": { "registration": "MH01AB1234" } }
```

Example response (trimmed):

```json
{
  "ok": true,
  "fuel": "Petrol",
  "category": "Passenger Vehicle",
  "makeModel": "Maruti Suzuki Swift",
  "engineCC": 1197,
  "seatingCapacity": 5,
  "firstRegistrationYear": 2019,
  "chassis": "MA3ERLE1S00123456",
  "registrationDate": "2019-05-14"
}
```

## How validation works

The registration number is normalized (trimmed, upper-cased, separators removed) and validated against the format `^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{1,4}$`. The first two characters are the state code, the next two are the RTO district code, the following 1–2 characters are the series, and the remaining digits are the serial. The state and district codes are matched against the bundled RTO data to return the office area and vehicle class.

## Data source

There is **no external API** and no network call. All data is static and bundled with the package (`lib/rto.js`):

- **RTO district codes** — derived from the state transport department's jurisdiction conventions (the 2-digit district codes published under the Motor Vehicle Act for Maharashtra `MH`, Delhi `DL`, Karnataka `KA` and Tamil Nadu `TN`).
- **Vehicle records** — synthetic sample data intended for demonstration and testing only. When a registration has no sample record, `vehicle_info` returns an estimate derived from the registration prefix.

## Scripts

| script | description |
| --- | --- |
| `npm start` | run the server (`node server.js`) |
| `npm run dev` | run the server (`node server.js`) |
| `npm test` | run the tests (`node scripts/test.mjs`) |

## License

[MIT](./LICENSE)
