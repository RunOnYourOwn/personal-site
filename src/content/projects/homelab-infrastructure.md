---
title: 'Homelab Infrastructure'
description: 'Self-hosted infrastructure with a 3-node Proxmox cluster, 250TB storage, and way too many containers.'
year: 2025
tags: ['Proxmox', 'Docker', 'Self-hosting', 'Infrastructure']
featured: true
status: 'in-progress'
heroImage: '../../assets/homeserver-rack.jpeg'
---

What started as a Raspberry Pi running Pi-hole has turned into a 3-node Proxmox cluster with nearly 250TB of storage. It's overkill, but that's kind of the point.

![Homelab Infrastructure Diagram](/images/homelab-infrastructure.svg)

## The Setup

**Compute**: Two Minisforum MS-01s (i9-13900H) and a custom EPYC 7502P server handle all the workloads. The MS-01s are surprisingly capable for their size—one runs most of my containers, the other handles Frigate and home automation.

**Storage**: A mix of TrueNAS and Unraid across the nodes. The EPYC server will eventually become the primary NAS once I finish migrating data from the old Supermicro box.

**Network**: Ubiquiti everything—UDM Pro, a few managed switches, and access points throughout the house. Probably more network gear than a house this size needs, but it's been rock solid.

## What It Runs

The usual self-hosted stuff: Plex, Home Assistant, Nextcloud, Pi-hole. But also some less common things—Gitea for version control, N8N for automation workflows, MLflow for tracking experiments, and a handful of local LLM tools I'm still figuring out.

Everything runs in Docker containers managed through Portainer. Renovate keeps dependencies updated automatically, and I've set up a deployment pipeline using GitHub Actions and webhooks that makes pushing changes pretty painless.

## Why Bother

Partly for learning—running your own infrastructure teaches you things you don't pick up any other way. Partly for privacy—I like knowing where my data lives. And partly because it's fun to build systems that just work.
