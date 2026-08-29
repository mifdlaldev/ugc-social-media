# Proposal: Social Media Post Generation with Real-time Research

## Context

MVP saat ini menggunakan model "artikel panjang" (Judul, Ringkasan, Isi Artikel 10.000 karakter) yang dikonversi jadi prompt infografis. User (owner) menginginkan perubahan besar: **bukan artikel, melainkan postingan social media** yang langsung digenerate dari riset AI real-time.

## Problem

Model artikel tidak cocok untuk konten social media yang butuh:
- Hook kuat di slide pertama
- Struktur carousel (multi-slide, 3-7 image)
- Data up-to-date dari lapangan (harga, spec, tren)
- Tone yang bisa dipilih: detail, observatif, informatif, menjual, creative
- Prompt yang disesuaikan per provider image generator (GPT Image 2.0, Nano Banana/Gemini, Recraft, dll)

## Solution

Ubah fundamental dari "artikel → prompt" menjadi:

```
User input topic (e.g. "Bata merah vs bata ringan")
    ↓
AI Research (You.com only) → collect facts, data, prices, comparisons
    ↓
User pilih: platform (IG/FB/LinkedIn), tone (detail/observatif/informatif/menjual/creative), slide_count (3-7)
    ↓
AI Generate: N prompt slides (carousel) dengan struktur per-slide:
  - Hook / Problem statement
  - Data / Facts / Comparison
  - Solution / Recommendation
  - CTA / Info kontak
    ↓
Tiap prompt punya variant per provider:
  - GPT Image 2.0: rich text, detailed composition
  - Nano Banana / Gemini: visual-heavy, minimal text
  - Recraft: style-consistent, brand-aligned
    ↓
User copy prompt ke external generator, generate image, post ke social media
```

## Scope

### In Scope
- Hapus field artikel lama (ringkasan, isi_artikel 10.000 char)
- Tambah field post social media: topic, platform, tone, slide_count
- Integrasi You.com MCP untuk riset (serverless-friendly, sudah ada di opencode)
- AI pipeline: research → synthesis → multi-prompt generation → provider variants
- UI: form post baru, preset tone/platform, hasil carousel dengan copy per provider
- Schema DB baru: post_research_sources, prompt_slides, provider_variants

### Out of Scope (deferred)
- Auto-post ke social media (hanya generate prompt, bukan post)
- Image generation internal (tetap external tool)
- Analytics / engagement tracking
- Multi-user (tetap single-owner MVP)

## Success Criteria
- User bisa input topic "Bata merah vs bata ringan" → dalam 2 menit dapat 5 prompt siap copy ke GPT Image / Nano Banana / Recraft
- Tiap prompt mengandung: hook, problem, data, solution, CTA
- Data factual (harga, spec) berasal dari riset real-time, bukan hallucination
- Tone sesuai pilihan user (menjual = hard sell CTA, informatif = educational)

## Risks
- You.com MCP sudah tersedia, tidak perlu setup tambahan
- You.com MCP sebagai fallback mungkin tidak selalu tersedia
- Prompt per provider butuh testing manual untuk quality

## Timeline Estimate
- Spec + Design: 1 sesi
- Schema + DB migration: 1 sesi
- Research service + AI pipeline: 2 sesi
- UI (form + hasil carousel): 2 sesi
- Testing + refinement: 1 sesi
- Total: ~7 sesi
