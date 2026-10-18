# Product Requirement Document (PRD)
**Nama Produk/Modul:** ClearBG Editor - Modul Manajemen Pengguna & Dashboard Sistem  
**Dokumen Version:** 1.1  
**Status:** Draft — siap untuk estimasi setelah keputusan pada bagian 1 disetujui  
**Target Platform:** Web Application (Responsive Desktop-First, min. resolution 1280x720)  

---

## 1. Product Overview

### Latar Belakang
Seiring bertumbuhnya basis pengguna ClearBG Editor, manajemen kuota kredit, autentikasi pengguna, dan pemantauan performa server AI berbasis GPU menjadi faktor kunci keberlanjutan bisnis. Tanpa visibilitas yang jelas, risiko kebocoran biaya infrastruktur GPU dan penanganan isu akun pengguna menjadi tinggi. Modul ini menyediakan antarmuka terintegrasi bagi Admin dan Executive Owner untuk mengontrol operasional dan finansial secara *real-time*.

### Tujuan Bisnis
* Memaksimalkan margin keuntungan operasional hingga **80%+**.
* Mengoptimalkan alokasi kuota foto AI dan mencegah pemborosan sumber daya server.
* Mencegah akses ilegal serta aktivitas manipulasi akun/kuota.

### Success Metrics (KPI)
* **System Uptime:** $\ge 99.9\%$ untuk antarmuka manajemen dan pipeline pemrosesan AI.
* **Customer Support Resolution Time:** Penurunan waktu penanganan keluhan akun/kuota hingga **40%**.
* **Cost Efficiency:** Efisiensi biaya operasional GPU hingga **14%** melalui auto-scaling dan alokasi yang presisi.

### Definisi Pengukuran KPI
* **Uptime:** Persentase waktu layanan dashboard dan pipeline AI dapat menerima serta memproses request, diukur bulanan. Maintenance terjadwal harus dilaporkan terpisah, bukan dihapus diam-diam dari hasil.
* **Waktu resolusi keluhan akun/kuota:** Median durasi dari tiket dibuat sampai status selesai; bandingkan periode setelah rilis dengan baseline 30 hari sebelumnya.
* **Efisiensi biaya GPU:** Penurunan biaya GPU per foto berhasil diproses dibanding baseline 30 hari sebelum auto-scaling aktif, dengan volume dan kualitas layanan yang sebanding.
* **Margin keuntungan 80%+:** Target bisnis, bukan komitmen hasil fitur. Formula, sumber omzet, dan biaya yang dimasukkan harus disepakati Finance sebelum KPI dipakai sebagai dasar keputusan.

### Asumsi Produk
* Dashboard adalah aplikasi internal dengan akses terautentikasi. Hanya Admin, Owner, dan Tech Admin yang dapat masuk ke dashboard ini; pelanggan/end-user tetap menggunakan aplikasi ClearBG Editor.
* Data finansial dan telemetry disediakan backend/layanan billing dan monitoring. Modul ini menampilkan data tersebut dan tidak menjadi sumber pencatatan transaksi atau telemetry.
* Semua waktu di UI ditampilkan dalam zona waktu yang dikonfigurasi organisasi; waktu penyimpanan dan audit menggunakan UTC.
* Penghapusan pengguna dilakukan sebagai **soft delete/nonaktifkan akun** agar transaksi dan audit historis tetap utuh. Hard delete memerlukan kebijakan retensi dan persetujuan terpisah.

### Keputusan yang Dibutuhkan Sebelum Release
* Finance menetapkan formula laba bersih, pendapatan yang diakui, mata uang, perlakuan pajak/refund, dan sumber biaya server.
* Product/Operations menetapkan batas kuota, perubahan maksimum per aksi, batas `batch size`/`timeout`, dan kebijakan auto-scaling yang aman per model.
* Security menetapkan retensi audit log, masa sesi, kanal pengiriman password-reset, dan kebijakan data pribadi/IP.
* Engineering menetapkan sumber metrik, interval refresh dan batas keterlambatan data yang dapat diterima untuk status “real-time”.

---

## 2. User Personas & User Journey

### User Personas
* **Ahmad (Admin Operasional):** Membutuhkan akses cepat untuk mengelola data akun pengguna, memperbarui kuota kredit, mereset password, dan menonaktifkan akun bermasalah.
* **Budi (Executive Owner):** Membutuhkan ringkasan eksekutif finansial (omzet vs biaya server GPU), performa penjualan paket, dan proyeksi laba bersih.
* **Rian (Tech Lead / DevOps):** Membutuhkan pemantauan status GPU cluster secara *real-time*, *latency render*, pengaturan *rate limiting*, dan alur *failover*.

### Matriks Akses Awal (RBAC)
| Kemampuan | User | Admin | Owner | Tech Admin |
| :--- | :---: | :---: | :---: | :---: |
| Mengakses aplikasi pelanggan sendiri | Ya | Ya | Ya | Ya |
| Melihat dan mengubah pengguna/kuota | Tidak | Ya | Tidak | Tidak |
| Melihat dashboard finansial dan ekspor laporan | Tidak | Tidak | Ya | Tidak |
| Melihat status infrastruktur AI | Tidak | Baca saja | Baca saja | Ya |
| Mengubah konfigurasi model/auto-scaling | Tidak | Tidak | Tidak | Ya |
| Melihat audit log | Tidak | Ya | Baca saja | Baca saja |
| Mengubah role Owner/Admin/Tech Admin | Tidak | Tidak | Tidak | Tidak |

Hak `Admin` tidak secara otomatis mencakup akses finansial atau konfigurasi infrastruktur. Pengelolaan role istimewa dilakukan melalui proses provisioning di luar UI rilis ini. Form manajemen pengguna pada rilis ini hanya membuat dan mengelola akun pelanggan ber-role `User`; Admin tidak dapat menaikkan role pelanggan atau mengubah role istimewa. Semua pemeriksaan izin wajib diterapkan di backend, bukan hanya menyembunyikan kontrol di frontend.

### User Journey (End-to-End)
1. **Login & Authentication:** User mengakses halaman portal, memasukkan kredensial, dan sistem memvalidasi sesi via JWT token.
2. **Role-Based Redirect:** System mengarahkan user ke *landing view* sesuai hak akses (Owner $\rightarrow$ Dashboard Finansial; Admin $\rightarrow$ Tabel Pengguna; Tech Lead $\rightarrow$ GPU Monitoring).
3. **Action & Execution:**
   * **Admin:** Cari user di tabel $\rightarrow$ Buka modal edit $\rightarrow$ Sesuaikan kuota $\rightarrow$ Simpan.
   * **Owner:** Filter grafik rentang waktu $\rightarrow$ Analisis tren laba vs biaya $\rightarrow$ Unduh laporan PDF/Excel.
   * **Tech Lead:** Pantau *latency* GPU $\rightarrow$ Sesuaikan ambang batas *auto-scaling* / *batch size* $\rightarrow$ Simpan konfigurasi.
4. **Confirmation & Audit:** Sistem menampilkan *toast notification* (sukses/gagal) dan mencatat seluruh aksi ke dalam *Audit Log*.

---

## 3. Functional Requirements

### Must-Have (Prioritas Utama / Sprint 1)

* **FR-MH-01: Manajemen Pengguna (CRUD & Kuota)**
  * **Deskripsi:** Modal form interaktif dan tabel data untuk menambah, melihat, mengedit, serta mengubah status/kuota pengguna.
  * **User Story:** *As an Admin, I want to update user details and adjust credit quotas so that customer issues can be resolved immediately.*
  * **Kriteria Penerimaan:**
    * Fitur pencarian (*search bar*) dan filter berdasarkan Role/Status.
    * Pagination tabel (10, 25, 50 baris per halaman).
    * Tabel menampilkan Nama, Email, Role, Status, sisa Kuota, dan waktu pembuatan akun; pencarian mencocokkan nama/email dan filter dapat digabung.
    * Modal tambah/edit memvalidasi nama wajib diisi, email valid dan unik, kuota bilangan bulat non-negatif, serta role/status yang didukung.
    * Pembuatan akun memulai alur undangan atau aktivasi melalui kanal terverifikasi; Admin tidak membuat, melihat, atau mengirim password secara manual. Role akun yang dibuat adalah `User`; role istimewa tidak dapat dipilih atau diubah melalui form ini.
    * Perubahan kuota dicatat sebagai delta tambah/kurang dengan alasan wajib; UI menampilkan kuota sebelumnya, perubahan, dan kuota akhir sebelum konfirmasi. Kuota tidak boleh menjadi negatif.
    * Pengguna tidak dapat mengubah role dirinya sendiri atau menonaktifkan/menghapus akun istimewa melalui alur ini.
    * Aksi hapus menampilkan nama/email akun pada dialog konfirmasi; konfirmasi menonaktifkan akun dan mencabut sesi aktif. Tabel diperbarui setelah backend mengonfirmasi sukses.
    * Saat simpan gagal, modal dan input tetap terbuka; tombol simpan kembali aktif dan pesan error yang dapat ditindaklanjuti ditampilkan.
    * Untuk 10.000 pengguna, pencarian, filter, pengurutan, dan pagination dijalankan server-side; state halaman kembali ke awal jika filter berubah.

* **FR-MH-02: Executive Financial Dashboard**
  * **Deskripsi:** Visualisasi *key metrics* (Total Pendapatan, Biaya Server AI, Laba Bersih, Cost per Photo) dan grafik omzet vs biaya (6 bulan terakhir).
  * **User Story:** *As an Executive Owner, I want to see net profit and server cost comparisons so that I can make data-driven financial decisions.*
  * **Kriteria Penerimaan:**
    * 4 Card KPI utama di bagian atas.
    * Grafik kombinasi (Line/Bar Chart) untuk Omzet vs Biaya GPU.
    * Pemilih rentang tanggal (Date Range Picker).
    * Setiap KPI menampilkan nilai, mata uang, periode, waktu pembaruan terakhir, serta perbandingan dengan periode sebelumnya bila tersedia.
    * Grafik membedakan pendapatan dan biaya dengan legenda/tooltip; nilai kosong, nol, dan gagal dimuat memiliki state yang berbeda.
    * Filter rentang waktu memperbarui seluruh KPI dan grafik menggunakan rentang yang sama; rentang default adalah enam bulan kalender terakhir.
    * Cost per Photo dihitung dari total biaya pemrosesan AI dibagi jumlah foto yang berhasil diproses pada periode terpilih. Jika denominator nol, tampilkan “Tidak tersedia”, bukan nilai tak terhingga.
    * Dashboard hanya tersedia bagi Owner; permintaan langsung ke endpoint sebagai role lain ditolak.

* **FR-MH-03: Authentication & Role-Based Access Control (RBAC)**
  * **Deskripsi:** Pembatasan hak akses halaman dan endpoint API berdasarkan peran pengguna (User, Admin, Owner, Tech Admin).
  * **User Story:** *As a System Administrator, I want to enforce strict role-based access so that sensitive financial and server data remains secure.*
  * **Kriteria Penerimaan:**
    * User tanpa otoritas yang mengakses URL terproteksi akan di-redirect ke halaman `403 Forbidden`.
    * Menu navigasi di sidebar disesuaikan secara dinamis sesuai Role.
    * Pengguna tanpa sesi diarahkan ke login; sesi kedaluwarsa meminta autentikasi ulang dan tidak mengulang operasi mutasi secara otomatis.
    * Backend memvalidasi izin untuk setiap endpoint dan objek yang diminta; respons tidak membocorkan data terlarang.
    * Setelah role/status dicabut atau akun dinonaktifkan, sesi terkait tidak dapat melakukan request berikutnya.

* **FR-MH-04: AI Infrastructure Monitoring**
  * **Deskripsi:** Tampilan status GPU Cluster (Node Aktif, VRAM Usage, Latency) dan kontrol batas konfigurasi model AI (*batch size*, *timeout*).
  * **User Story:** *As a Tech Lead, I want to adjust batch limits and view processing latency so that the AI pipeline remains fast and stable.*
  * **Kriteria Penerimaan:**
    * Gauge / Progress Bar untuk VRAM & CPU Usage.
    * Form input parameter *batch size* dan *timeout* dengan tombol "Apply Changes".
    * Widget menampilkan status cluster/node, jumlah node aktif, penggunaan VRAM, latency p50/p95, dan waktu telemetry terakhir; unit dan ambang normal/peringatan/gagal ditampilkan.
    * Parameter konfigurasi menampilkan nilai aktif dan rentang valid per model. Nilai di luar batas ditolak sebelum dikirim.
    * Perubahan konfigurasi menampilkan ringkasan nilai lama dan baru, meminta konfirmasi, lalu menunjukkan status penerapan (berhasil/gagal/tertunda). Nilai aktif tidak berubah di UI sebelum backend mengonfirmasi.
    * Kegagalan telemetry tidak ditampilkan sebagai nilai nol; gunakan fallback state dan tombol coba lagi.

### Should-Have (Sprint 2)

* **FR-SH-01: System Audit Logging**
  * **User Story:** *As an Admin, I want to view an audit log of user activity so that I can trace back configuration changes and login history.*
  * **Kriteria Penerimaan:** Tabel log menyimpan Timestamp, Actor ID/Role, IP Address sesuai kebijakan privasi, Jenis Aksi, target, hasil, dan ringkasan perubahan sebelum/sesudah. Perubahan kuota mencakup delta serta alasan.
  * Log bersifat append-only bagi pengguna dashboard, dapat difilter berdasarkan periode/aktor/aksi/target, dan mencatat login berhasil/gagal serta operasi istimewa.

* **FR-SH-02: Instant Password Reset Trigger**
  * **User Story:** *As an Admin, I want to trigger a password reset for a user so that locked-out users can regain account access safely.*
  * **Kriteria Penerimaan:** Tombol "Reset Password" meminta konfirmasi, membuat tautan sekali pakai yang kedaluwarsa, dan mengirimkannya melalui kanal reset terverifikasi. Admin tidak pernah melihat atau menetapkan password baru.
  * UI hanya mengonfirmasi bahwa permintaan reset diterima, bukan mengungkap apakah alamat email dapat digunakan, dan aksi tercatat pada audit log.

* **FR-SH-03: Export Financial & Operational Report**
  * **User Story:** *As an Owner, I want to download financial reports in PDF/Excel format so that I can share them with stakeholders.*
  * **Kriteria Penerimaan:** Owner dapat mengekspor PDF dan Excel/CSV sesuai format yang disepakati, mengikuti periode/filter aktif serta mencantumkan mata uang, zona waktu, waktu generasi, dan definisi metrik.
  * Ekspor mematuhi izin akses yang sama dengan dashboard dan kegagalan ekspor menampilkan opsi untuk mencoba kembali.

### Nice-to-Have (Backlog / Future Release)

* **FR-NTH-01: Auto-Failover Notification (Webhook/Telegram)**
  * Sistem mengirim notifikasi instan ke grup Telegram DevOps jika GPU Node mengalami kegagalan berkala (> 3x consecutive errors).
* **FR-NTH-02: Dark/Light Theme Toggle**
  * Opsi sakelar mode tampilan antarmuka (Default: Dark Mode Slate `#0f172a`).

---

## 4. Non-Functional Requirements

### Performa
* **API Response Time:** Query tabel pengguna p95 $< 300\text{ ms}$ untuk halaman berukuran maksimal 50 baris pada kondisi beban normal; definisi beban dan lingkungan ukur ditetapkan saat uji performa.
* **UI Rendering:** Modal yang datanya telah tersedia menampilkan frame pertama dalam $< 100\text{ ms}$ pada perangkat referensi yang disepakati.
* **Data Processing:** Mampu menangani hingga 10.000 entri data pengguna dengan *server-side pagination*.
* **Dashboard freshness:** Tampilkan waktu pembaruan; interval refresh otomatis dan batas keterlambatan telemetry/finansial ditentukan bersama pemilik sumber data.

### Keamanan
* **Autentikasi:** Bearer Token (JWT) dengan masa akses maksimum 8 jam dan mekanisme refresh yang aman; token tidak disimpan di `localStorage`. Durasi final mengikuti kebijakan Security.
* **Enkripsi:** Seluruh komunikasi data wajib menggunakan HTTPS dengan sertifikat TLS 1.3.
* **Data Privacy:** Password tidak pernah ditampilkan atau dicatat; gunakan hashing password yang sesuai praktik keamanan. Token/secret harus di-redact dari log. Akses dan retensi IP mengikuti kebijakan privasi.
* **Proteksi mutasi:** Endpoint sensitif memvalidasi role, input, dan kepemilikan; perubahan kuota/config memiliki audit trail dan proteksi terhadap request ganda.
* **Sesi:** Logout mencabut/menutup sesi sesuai mekanisme backend; akun nonaktif tidak boleh memperoleh token baru.

### Kompatibilitas
* **Browser:** Kompatibel penuh pada Chrome, Edge, Firefox, dan Safari versi terbaru.
* **Layar:** Responsif untuk resolusi $1280 \times 720\text{ px}$ hingga $4\text{K}$.
* **Aksesibilitas:** Alur utama dapat digunakan dengan keyboard, fokus modal terperangkap dan dikembalikan saat modal ditutup, input memiliki label/error yang terbaca screen reader, serta status tidak mengandalkan warna saja.

---

## 5. UI/UX & Design Guidelines

### Skema Warna (Dark Mode Theme)
* **Background Utama:** Slate Navy `#0f172a`
* **Container / Card / Modal:** Dark Slate `#1e293b`
* **Border & Divider:** Slate Gray `#334155`
* **Warna Aksen:**
  * Primary Accent: Royal Blue `#2563eb`
  * Secondary Accent: Sky Cyan `#38bdf8`
  * Success / Active: Emerald Green `#10b981`
  * Warning / Owner Tag: Amber Yellow `#facc15`
  * Danger / Error: Rose Red `#ef4444`

### Structure & Layout Design
* **Top Navigation Bar:**
  * Sisi Kiri: Logo ClearBG Editor + Indicator Status Sistem (Green Dot = All Operational).
  * Sisi Kanan: Profile Avatar, Role Badge (misal: "Owner" warna Kuning), Button Logout.
* **Sidebar Navigation (Left):**
  * Menu Items: Dashboard, User Management, AI Infrastructure, Audit Log, Settings.
  * State active ditandai dengan background `#2563eb` dan indikator garis menyala di sebelah kiri.
* **Main Content Area:**
  * Memakai sistem *Grid Flexible* (3 atau 4 Kolom untuk KPI Cards).
  * Modal overlay berada tepat di tengah layar (*center-aligned*) dengan latar belakang *backdrop blur* (`backdrop-filter: blur(8px)`).

### User Interaction Flow (Modal Action)
```
[Klik Tombol Aksi] ──> [Modal Overlay Muncul] ──> [Form Pre-filled Auto]
                                                          │
[Toast Error / Field Red] <── (Gagal) <── [Klik Simpan] <──┘
           │                                      │
    [Perbaiki Input]                              └──> (Sukses) ──> [Button Loading State] ──> [Toast Success] ──> [Modal Close & Auto Reload Table]
```

  ### UI States Wajib
  * **Tabel/dashboard:** loading (skeleton), data tersedia, kosong (dengan tindakan yang relevan), error (coba lagi), dan data stale bila sumber belum diperbarui sesuai SLA.
  * **Form:** pristine, dirty, valid, invalid, submitting, berhasil, dan gagal. Cegah penutupan modal yang memiliki perubahan belum tersimpan tanpa konfirmasi.
  * **Aksi destruktif:** tampilkan dampak, target yang jelas, dan tombol konfirmasi yang tidak menjadi default fokus.
  * **Responsive:** pada viewport di bawah 1280 px, sidebar dapat diciutkan; tabel mempertahankan kolom identitas dan aksi penting dengan pola scroll/kolom responsif yang konsisten.

---

## 6. Edge Cases & Error Handling

| Skenario Edge Case | Potensi Masalah | Solusi & Penanganan Sistem |
| :--- | :--- | :--- |
| **Koneksi Terputus saat Simpan Data** | Request gagal dikirim ke backend, input pengguna berisiko hilang. | Tampilkan *Toast Error*: *"Koneksi terputus. Perubahan belum tersimpan."* Jaga modal tetap terbuka dan input data tidak di-reset. |
| **Input Kuota Negatif / Email Invalid** | Data corrupt atau kegagalan sistem backend. | Validasi *client-side* seketika. Blokir tombol *"Simpan"*, berikan *border* merah (`#ef4444`) dan teks error di bawah bidang input. |
| **API Server GPU Down / Timeout** | Widget monitoring tidak mendapatkan data. | Tampilkan *Fallback State* pada Card Widget dengan indikator *"Gagal mengambil data server"* dan sediakan tombol *"Coba Lagi"*. |
| **Penghapusan Akun Pengguna** | Ketidaksengajaan klik tombol hapus. | Wajibkan *Confirmation Dialog* (Modal Sekunder) dengan konfirmasi ketik teks nama akun atau tombol bahaya berwarna merah. |
| **Email sudah digunakan** | Dua akun memakai identitas email yang sama. | Backend mengembalikan konflik; tandai field email, pertahankan input lain, dan jangan membuat akun kedua. |
| **Konflik perubahan bersamaan** | Data akun/kuota berubah setelah modal dibuka oleh admin lain. | Backend menolak update stale (misalnya versi/updated_at tidak cocok); tampilkan data terbaru dan minta admin meninjau ulang sebelum menyimpan lagi. |
| **Klik simpan berulang / timeout ambigu** | Mutasi mungkin sudah diproses meski respons tidak diterima. | Nonaktifkan tombol saat request berjalan dan gunakan idempotency key untuk mutasi; setelah timeout, verifikasi status sebelum mengulang. |
| **Sumber finansial/telemetry stale** | Angka lama disalahartikan sebagai data real-time. | Tampilkan timestamp dan indikator stale; jangan mengganti data lama dengan nol atau menyatakan status operasional sehat tanpa telemetry terbaru. |
| **Akses role dicabut saat sesi aktif** | Pengguna masih membuka halaman yang sebelumnya diizinkan. | Tolak request berikutnya di backend, bersihkan state sensitif, dan arahkan ke halaman akses ditolak/login sesuai status sesi. |

---

## 7. Out of Scope (Tidak Masuk dalam Rilis Ini)

* Integrasi payment gateway langsung di sisi *client-side* (ditangani modul Billing terpisah).
* Fitur *Live Chat Support* / *Ticketing System* langsung antar Admin dan Pelanggan.
* Aplikasi Mobile Native (iOS/Android) khusus modul Admin & Management ini.

---

## 8. Release Readiness & Definition of Done
* Seluruh acceptance criteria Must-Have lulus pada staging untuk setiap role, termasuk percobaan akses endpoint tanpa izin.
* Test mencakup validasi form, pagination/filter/search, perubahan kuota, disable user, konfigurasi model, serta error jaringan/API.
* Tidak ada defect Severity 1/2 terbuka; audit event tersedia untuk mutasi istimewa.
* Dashboard menampilkan definisi sumber data, mata uang/periode, dan timestamp freshness; Finance menyetujui formula finansial.
* Observability, alerting, rollback konfigurasi model, dan prosedur pemulihan akses admin didokumentasikan sebelum production.
* Review Security dan verifikasi aksesibilitas alur utama selesai; hasil uji performa memenuhi target NFR.

## 9. Dependencies & Risiko
* **Dependencies:** Identity/auth service, user/credit service, billing atau ledger, GPU telemetry/cluster manager, email reset provider, dan layanan ekspor.
* **Kualitas data:** Definisi pendapatan/biaya yang belum seragam dapat membuat dashboard menyesatkan; Finance harus menyetujui formula dan sumber sebelum angka laba dipublikasikan.
* **Risiko operasional:** Perubahan batch/timeout atau auto-scaling yang salah dapat menurunkan kualitas dan menaikkan biaya; terapkan batas server-side, audit, konfirmasi, dan mekanisme rollback.
* **Risiko keamanan:** RBAC frontend saja tidak cukup; semua kontrol harus ditegakkan dan diuji di API.
* **Risiko privasi:** IP login dan audit data memiliki kewajiban retensi/pembatasan akses yang perlu ditetapkan Security/Legal.