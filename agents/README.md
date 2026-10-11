# agents/

This project's agent/skill definitions live here -- a plain directory
tracked like any other content (no nested git repo, no .gitignore entry, no
submodule). Argus's skill-sync scans this folder once the project registry's
agents_path points at this directory's working-tree location on the sync
host, e.g. /home/aaron/projects/<slug>/agents (the tdarr convention).

## Layout

    agents/
      README.md          -- this file
      <skill-name>/
        SKILL.md          -- the skill definition skill-sync discovers

## Adding a skill

Create agents/<skill-name>/SKILL.md with YAML frontmatter (name,
description, and optionally executable, exec_tier, command, project,
notify, runner) followed by the skill body, then land it via a normal PR.

Seeded by Argus onboarding (ARGUS-750): this repo had no tracked agents/
folder when it was attached. The example/ folder below is a placeholder --
replace it with a real skill, or delete it once this project has its own.
