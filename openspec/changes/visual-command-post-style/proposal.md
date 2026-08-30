# Proposal: Replace Post Tone with a Curated Visual Command

## Context

Setiap post saat ini menyimpan `tone` dengan lima nilai: `detail`, `observatif`, `informatif`, `menjual`, `creative` (`drizzle/schema.ts`). Nilai tersebut dipakai `promptGenerator.ts` hanya sebagai kata sifat di dalam template provider (`Tone: ${ctx.tone}`, `Mood: ${ctx.tone}`).

Owner menyediakan dua PDF referensi yang sudah diekstraksi verbatim ke `docs/prompt-command-reference.md`:

- `500 Perintah Rahasia ChatGPT.pdf` — 500 perintah, Bagian 3 (201–300) adalah bagian prompt gambar AI, Bagian 1 (1–100) berisi perintah visualisasi dan tata letak.
- `kumpulan command.pdf` — 50 perintah oleh Ahmad Fauzi, masing-masing dengan bentuk "Prompt singkat" dan "Prompt detail".

## Problem

`tone` tidak menentukan bentuk visual. Untuk konten teknik sipil, konstruksi, dan arsitektur, keputusan yang penting adalah **bentuk penyajian visual** (potongan, isometrik, diagram proses, perbandingan), bukan nada bicara. Owner ingin pilihan itu ditetapkan **saat membuat post**, bukan di halaman generate.

## Solution

Ganti field `tone` pada post menjadi `visual_command`: satu nilai dari daftar terkurasi 18 perintah yang diambil dari `docs/prompt-command-reference.md` dan disetujui owner.

18 perintah yang disetujui (semuanya ada di katalog; nomor merujuk ke `docs/prompt-command-reference.md`):

| Command | Sumber | Deskripsi katalog (verbatim) |
| --- | --- | --- |
| `/infographic` | 500 §Bagian 1 no. 4 | Tata letak infografis |
| `/scientificdiagram` | 50 no. 8 | Memvisualisasikan mekanisme atau fenomena ilmiah menjadi diagram yang informatif dan mudah dipahami. |
| `/diagram` | 500 §Bagian 1 no. 5 | Menggambar diagram konsep |
| `/schematic` | 500 §Bagian 1 no. 39 | Skema teknis sederhana |
| `/flowchart` | 500 §Bagian 1 no. 6 | Bagan alur langkah demi langkah |
| `/process` | 500 §Bagian 1 no. 19 | Menjelaskan proses lengkap |
| `/comparison` | 500 §Bagian 1 no. 23 | Perbandingan berdampingan (side-by-side) |
| `/timeline` | 500 §Bagian 1 no. 12 | Lini masa kronologis |
| `/conceptmap` | 50 no. 25 | Memvisualisasikan hubungan antara berbagai konsep secara hierarkis dan saling terhubung. |
| `/anatomy` | 500 §Bagian 1 no. 15 | Menjelaskan seluruh bagian/struktur |
| `/blueprint` | 500 §Bagian 1 no. 9 | Cetak biru teknis (technical blueprint) |
| `/isometric` | 500 §Bagian 1 no. 40 | Ilustrasi isometrik 3D |
| `/explodedview` | 500 §Bagian 1 no. 10 | Membongkar objek menjadi komponen-komponennya |
| `/cutaway` | 500 §Bagian 1 no. 14 | Ilustrasi potongan melintang (cutaway) |
| `/crosssection` | 500 §Bagian 1 no. 31 | Ilustrasi irisan melintang |
| `/layers` | 500 §Bagian 1 no. 16 | Arsitektur lapis demi lapis |
| `/scale` | 500 §Bagian 1 no. 25 | Membandingkan ukuran secara visual |
| `/handwrittennotes` | 50 no. 10 | Mengubah materi menjadi catatan belajar bergaya tulisan tangan dengan anotasi, garis, panah, dan highlight. |

Pemilihan dilakukan di `/owner/new` dan `/owner/edit/[id]/detail`, lalu nilainya dibawa ke pipeline generate.

## Scope

### In Scope

- Migrasi `posts.tone` → `posts.visual_command` dengan 18 nilai enum di atas.
- Katalog perintah di kode sebagai satu sumber tunggal (nilai, label, deskripsi katalog, kategori).
- UI: dropdown pada `/owner/new` dan `/owner/edit/[id]/detail` menampilkan label + deskripsi katalog.
- UI: badge di daftar `/owner` dan detail post menampilkan `visual_command`.
- API: `POST /api/posts` dan `PUT /api/posts/:id` menerima `visual_command`, menolak nilai di luar enum.
- `promptGenerator.ts` memakai `visual_command` sebagai arahan bentuk visual, menggantikan pemakaian `tone`.

### Out of Scope

- Menambahkan sisa perintah dari kedua PDF ke UI (hanya 18 yang disetujui).
- Bentuk "Prompt singkat vs Prompt detail" sebagai pilihan pengguna — belum disetujui, ditunda.
- Perubahan `platform`, `slide_count`, `post_status`, alur riset, atau Prompt Block Schema (`DESIGN.md` §6).
- Kemampuan native provider apa pun. Slash command adalah konvensi penulisan prompt, bukan API command.

## Success Criteria

- Owner memilih satu dari 18 perintah saat membuat post, dan pilihan itu tersimpan.
- Nilai lama `tone` termigrasi ke `visual_command` tanpa menghilangkan post.
- `POST`/`PUT` menolak nilai di luar 18 enum dengan status 422.
- Prompt yang dihasilkan mengandung arahan bentuk visual sesuai perintah terpilih.
- Tidak ada fakta teknis baru yang masuk dari katalog perintah; fakta tetap hanya dari riset dan topik.

## Risks

- Nilai `tone` lama tidak punya padanan bentuk visual satu-ke-satu. Mitigasi: petakan semuanya ke satu default netral (`/infographic`) dan catat di design.md, bukan menebak niat owner per post.
- SQLite tidak mendukung `ALTER TABLE ... ALTER COLUMN`. Mitigasi: rencana migrasi tabel-baru + copy + rename didefinisikan di design.md.
- Perubahan template prompt bisa menurunkan kualitas output. Mitigasi: uji manual satu post per kategori sebelum arsip.
