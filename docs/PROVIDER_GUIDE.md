# Provider Guide

Providers are replaceable adapters behind service interfaces. Folqen should choose providers by capability and status, not by hardcoded names.

## Required Provider Metadata

Each provider should expose:

- id
- name
- type
- status
- version
- capabilities
- cost model
- rate limits
- commercial-use status
- configuration schema
- health check behavior
- test connection behavior
- safe fallback behavior

## Status Values

- `not_connected`
- `configured`
- `testing`
- `live`
- `failed`
- `disabled`
- `deprecated`
- `needs_attention`

## Foundation Providers

The current registry includes placeholders for:

- n8n self-hosted workflow provider
- FFmpeg local render provider
- ComfyUI local image workflow provider

All are `not_connected` until configured and tested.
