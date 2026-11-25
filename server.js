#!/usr/bin/env node
/**
 * rto-mcp — MCP server for Indian vehicle registration (RTO) lookups.
 *
 * Tools:
 *   rto_lookup    — decode a vehicle registration number (e.g. MH01AB1234)
 *                   to its RTO office, state, series, serial and vehicle class.
 *   rto_by_state  — list all RTO offices in a state with their codes and areas.
 *   vehicle_info  — return estimated vehicle details (year, fuel, category)
 *                   for a registration number.
 *
 * Data source: static, bundled data (see lib/rto.js). No network call, no API
 * key. The RTO district-code maps follow State RTO jurisdiction conventions;
 * the vehicle sample records are synthetic and for demonstration/testing only.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  rtoLookup,
  rtoByState,
  vehicleInfo,
} from './lib/rto.js';

const server = new Server(
  { name: 'rto-mcp', version: '0.1.0' },
  {
    capabilities: { tools: {} },
  },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'rto_lookup',
      description:
        'Decode an Indian vehicle registration number (e.g. MH01AB1234) into its RTO office, state, RTO district code, series, serial and vehicle class.',
      inputSchema: {
        type: 'object',
        properties: {
          registration: {
            type: 'string',
            description: 'Vehicle registration number, e.g. MH01AB1234',
          },
        },
        required: ['registration'],
      },
    },
    {
      name: 'rto_by_state',
      description:
        'List all RTO offices in an Indian state (by state code like MH/DL/KA/TN or by state name) with their district codes and areas.',
      inputSchema: {
        type: 'object',
        properties: {
          state: {
            type: 'string',
            description: 'State code (MH, DL, KA, TN) or state name (Maharashtra)',
          },
        },
        required: ['state'],
      },
    },
    {
      name: 'vehicle_info',
      description:
        'Return estimated vehicle details (first registration year, fuel type, category, make/model) for a registration number. Uses bundled sample data; returns an estimate when no sample exists.',
      inputSchema: {
        type: 'object',
        properties: {
          registration: {
            type: 'string',
            description: 'Vehicle registration number, e.g. MH01AB1234',
          },
        },
        required: ['registration'],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'rto_lookup') {
    const reg = args?.registration;
    if (!reg) {
      return {
        content: [{ type: 'text', text: 'Missing required argument: registration' }],
      };
    }
    return { content: [{ type: 'text', text: JSON.stringify(rtoLookup(reg), null, 2) }] };
  }

  if (name === 'rto_by_state') {
    const state = args?.state;
    if (!state) {
      return {
        content: [{ type: 'text', text: 'Missing required argument: state' }],
      };
    }
    return { content: [{ type: 'text', text: JSON.stringify(rtoByState(state), null, 2) }] };
  }

  if (name === 'vehicle_info') {
    const reg = args?.registration;
    if (!reg) {
      return {
        content: [{ type: 'text', text: 'Missing required argument: registration' }],
      };
    }
    return { content: [{ type: 'text', text: JSON.stringify(vehicleInfo(reg), null, 2) }] };
  }

  throw new Error(`Unknown tool: ${name}`);
});

const transport = new StdioServerTransport();
await server.connect(transport);
console.error('rto-mcp server running on stdio');
