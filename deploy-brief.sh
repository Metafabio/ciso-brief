#!/bin/bash
# Committa il nuovo brief.json e pusha — Netlify rideploya automaticamente
cd "$(dirname "$0")"

git add public/brief.json
git commit -m "brief: update week $(date +%V) — $(date +%Y-%m-%d)"
git push origin main
