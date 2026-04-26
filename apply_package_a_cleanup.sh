#!/usr/bin/env bash
set -euo pipefail

rm -f Rank-Scout-Logo.webp
rm -f public/rank-scout-logo.webp
rm -f public/big-threes/rank-scout-logo.webp
rm -f public/big-threes/forum_magazin_herobild_rank-scout.webp
rm -f public/big-threes/versicherungen_vergleich_rank-scout_startseitenbild.webp
rm -f public/big-threes/versicherungen_vergleich_rank-scout_startseitenbild1.webp
rm -f rank_scout_db.sql
rm -rf supabase/functions/rank-scout-ai

echo "TierTarif Paket A Cleanup: alte Rank-Scout-Dateien entfernt."
