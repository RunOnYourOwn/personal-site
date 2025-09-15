---
title: 'Homelab Infrastructure'
description: 'Comprehensive self-hosted infrastructure with 3-node Proxmox cluster, 250TB storage, and full automation pipeline.'
year: 2025
tags:
  [
    'Proxmox',
    'Docker',
    'Portainer',
    'SWAG',
    'Self-hosting',
    'Infrastructure',
    'DevOps',
    'Automation',
  ]
featured: true
status: 'in-progress'
heroImage: '../../assets/homeserver-rack.jpeg'
---

## Infrastructure Overview

<div class="diagram-container" style="margin: 2rem 0; text-align: center; background: var(--bg-secondary); padding: 1rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
  <img 
    src="/images/homelab-infrastructure.svg" 
    alt="Homelab Infrastructure Diagram"
    class="homelab-diagram"
    style="width: 100%; max-width: 1400px; height: auto; display: block; margin: 0 auto; border-radius: 4px;"
  />
</div>

## Current Infrastructure

### Network Architecture

The foundation of my homelab is a solid network setup that keeps everything connected and running smoothly.

**Network Equipment:**

- UDM Pro - Primary router and security gateway
- Switch Aggregation - Core network switching
- Pro Max 24 PoE - Power-over-Ethernet switching for access points and USW Minis
- US 8 60W - Additional PoE switching for cameras
- Pro Max 24 - Standard switching for servers
- Wireless Access Points - AP-AC-PRO, U6-Lite (x2)

### Storage Layer (NAS)

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin: 1rem 0;">

<div>

#### Potter (Current NAS - Unraid)

- **Hardware**: Supermicro X9DRD-7N4F, 2x E5-2650v2, 192GB DDR3 ECC
- **Storage**: 176TB usable storage
- **Status**: Active (will be decommissioned after data migration)
- **Services**:

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin: 0.5rem 0;">

<div>

- Home Assistant
- Jackett
- Netdata
- nzbget
- Plex

</div>

<div>

- Radarr
- Sonarr
- Swag
- Tautulli
- Transmission

</div>

</div>

</div>

<div>

#### Dumbledore (Future NAS - TrueNAS virtualized)

- **Hardware**: Supermicro H12SSL-i, EPYC 7502P, 128GB DDR4 ECC, 2x2TB NVMe
- **Storage**: ~192TB initially
- **Services**:
  - Netdata
  - OpenWebUI
  - Ollama
  - LlamaCPP
  - vllm
  - TrueNAS Scale

</div>

</div>

### Application Layer (Proxmox Cluster)

I run a 3-node cluster that keeps everything highly available and distributes the workload:

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin: 1rem 0;">

<div>

**Granger:**

- **Hardware**: i9-13900H, 32GB DDR5, 2x2TB NVMe
- **Services**:

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin: 0.5rem 0;">

<div>

- Tautulli
- N8N
- Gitea
- Grafana
- InfluxDB
- Pi-hole
- Nginx Proxy Manager
- Prometheus
- Home Assistant
- Plex
- PostgreSQL
- Ubooquity
- Trilium
- Commafeed

</div>

<div>

- Nextcloud
- Whisper-Piper
- Vikunja
- Kometa
- PlexTraktSync
- mlflow
- Actual Budget
- Karakeep
- TurfTracker
- Pinchflat
- Joplin
- Renovate
- Personal Site

</div>

</div>

</div>

<div>

**Malfoy:**

- **Hardware**: i9-13900H, 96GB DDR5, 2x2TB NVMe
- **Services**:
  - HiveMQ
  - ESPHome
  - Frigate
  - Zigbee2MQTT
  - Overseerr
  - Go2RTC
  - WakaTime Exporter
  - Portainer

</div>

</div>

**Beelink1-PVE:**

- **Hardware**: N95, 16GB DDR4, 500GB SSD
- **Services**:
  - FPP (Falcon Player)

## Key Features

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin: 1rem 0;">

<div>

### High Availability

- **3-Node Proxmox Cluster** - Automatic failover and load balancing
- **Redundant Storage** - Multiple storage systems with 3-2-1 backup strategy
- **Network Redundancy** - Multiple switches and access points

### Automation & DevOps

- **Container Orchestration** - Docker and Portainer make managing services easy
- **CI/CD Pipelines** - Automated deployment and updates keep everything current
- **Monitoring** - Grafana and Prometheus help me keep an eye on everything
- **Backup Strategy** - Automated 3-2-1 backup keeps my data safe

</div>

<div>

### Home Automation

- **Home Assistant** - Central hub that ties all my smart home devices together
- **Zigbee2MQTT** - Manages all my Zigbee devices
- **ESPHome** - Custom ESP32/ESP8266 device integration
- **MQTT Broker** - HiveMQ handles all the IoT communication

### Media & Entertainment

- **Plex Media Server** - Streams all my media to any device
- **Overseerr** - Handles media requests from family and friends
- **Sonarr/Radarr** - Automatically downloads and organizes my media
- **Tautulli** - Tracks Plex usage and analytics

### Development & AI

- **AI Processing** - OpenWebUI, Ollama, LlamaCPP for running AI models locally
- **Development Tools** - N8N workflows and PostgreSQL databases
- **Version Control** - Git repositories with automated dependency updates
- **Personal Website** - This site runs on the infrastructure

</div>

</div>

## Future Plans

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin: 1rem 0;">

<div>

### Expansion Goals

- **GPU Integration** - Add dedicated GPU for enhanced AI/ML processing
- **Additional Storage** - Expand storage capacity for media and backups
- **New NAS** - Dumbledore will eventually take over from Potter once decommissioned

</div>

<div>

### Service Additions

- **Local LLMs** - Local LLM workflows through N8N

</div>

</div>

This setup lets me experiment with new technologies while keeping everything I need running smoothly. It's been a great way to learn and apply enterprise-level practices in a personal environment.
