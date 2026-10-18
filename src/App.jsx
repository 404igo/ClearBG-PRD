import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity, ArrowUpRight, Bell, Check, ChevronDown,
  ChevronLeft, ChevronRight, CircleHelp, Clock3, Cpu, Download,
  FileClock, Gauge, LayoutDashboard, LogOut, Menu, MoreHorizontal,
  Pencil, Plus, RefreshCw, Search, Server, Settings2, ShieldCheck,
  SlidersHorizontal, Sparkles, Trash2, UsersRound, X, Zap,
} from "lucide-react";

const initialUsers = [
  ["Nadia Putri", "nadia.putri@gmail.com", "Aktif", 240, "12 Okt 2025"],
  ["Rizky Pratama", "rizky.p@studio.co", "Aktif", 86, "10 Okt 2025"],
  ["Maya Sari", "maya.sari@mail.com", "Aktif", 512, "08 Okt 2025"],
  ["Dimas Saputra", "dimas@creative.id", "Pending", 50, "06 Okt 2025"],
  ["Siti Rahma", "siti.rahma@gmail.com", "Aktif", 1280, "04 Okt 2025"],
  ["Fajar Nugraha", "fajar.n@agency.co", "Aktif", 24, "02 Okt 2025"],
  ["Kevin Wijaya", "kevin.w@design.id", "Nonaktif", 0, "28 Sep 2025"],
  ["Alya Permata", "alya.permata@mail.com", "Aktif", 340, "25 Sep 2025"],
  ["Bima Aditya", "bima.a@studio.co", "Aktif", 98, "22 Sep 2025"],
  ["Clara Anindya", "clara@creative.id", "Pending", 100, "20 Sep 2025"],
  ["Rafi Hidayat", "rafi.h@mail.com", "Aktif", 675, "18 Sep 2025"],
  ["Intan Maharani", "intan.m@agency.co", "Aktif", 42, "15 Sep 2025"],
].map(([name, email, status, credits, joined], index) => ({
  id: index + 1, name, email, role: "User", status, credits, joined,
  initials: name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase(),
  color: ["violet", "blue", "orange", "green", "pink", "cyan"][index % 6],
}));

const roles = {
  User: { name: "Rina Pratiwi", initials: "US", className: "user" },
  Admin: { name: "Ahmad Pratama", initials: "AD", className: "admin" },
  Developer: { name: "Rian Saputra", initials: "DV", className: "developer" },
};

const navigation = [
  { id: "editor", label: "Remove Background", icon: Sparkles, roles: ["User", "Admin", "Developer"] },
  { id: "users", label: "Manajemen Pengguna", icon: UsersRound, roles: ["Admin"] },
  { id: "finance", label: "Dashboard Operasional", icon: LayoutDashboard, roles: ["Admin", "Developer"] },
  { id: "infra", label: "Developer Tools", icon: Cpu, roles: ["Developer", "Admin"] },
  { id: "audit", label: "Audit Log", icon: FileClock, roles: ["Admin", "Developer"] },
];

const sampleAudit = [
  { actor: "Ahmad Pratama", role: "Admin", action: "Menyesuaikan kuota", target: "Nadia Putri", detail: "+100 kredit · Koreksi paket", time: "10:42" },
  { actor: "Sistem", role: "System", action: "Undangan pengguna", target: "Dimas Saputra", detail: "Undangan demo disiapkan", time: "09:18" },
  { actor: "Rian Saputra", role: "Developer", action: "Konfigurasi model", target: "BG-Remove-v2", detail: "Batch 8 → 12", time: "08:54" },
  { actor: "Ahmad Pratama", role: "Admin", action: "Login", target: "Portal demo", detail: "Sesi simulasi dibuat", time: "08:12" },
];

const monthly = [
  { month: "Mei", revenue: 62, cost: 37 },
  { month: "Jun", revenue: 74, cost: 43 },
  { month: "Jul", revenue: 68, cost: 39 },
  { month: "Agu", revenue: 88, cost: 49 },
  { month: "Sep", revenue: 81, cost: 46 },
  { month: "Okt", revenue: 96, cost: 53 },
];

const currency = (value) => new Intl.NumberFormat("id-ID", {
  style: "currency", currency: "IDR", maximumFractionDigits: 0,
}).format(value);

export default function App() {
  const [role, setRole] = useState("User");
  const [page, setPage] = useState("editor");
  const [users, setUsers] = useState(initialUsers);
  const [editorState, setEditorState] = useState({
    fileName: "",
    originalUrl: "",
    processedUrl: "",
    tolerance: 28,
    backgroundColor: "#ffffff",
    status: "Belum ada gambar yang dipilih.",
    error: "",
  });
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Semua status");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [audit, setAudit] = useState(sampleAudit);
  const [mobileNav, setMobileNav] = useState(false);
  const [infraLoaded, setInfraLoaded] = useState(true);
  const [config, setConfig] = useState({ batch: 12, timeout: 45 });
  const [draft, setDraft] = useState({ batch: 12, timeout: 45 });

  const accessibleNav = navigation.filter((item) => item.roles.includes(role));
  const filtered = useMemo(() => users.filter((user) => {
    const matches = `${user.name} ${user.email}`.toLowerCase().includes(query.trim().toLowerCase());
    return matches && (status === "Semua status" || user.status === status);
  }), [users, query, status]);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(pageNumber, pages);
  const pageUsers = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const notify = (message, type = "success") => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 3300);
  };

  const handleEditorUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isAccepted = ["image/jpeg", "image/png"].includes(file.type) || /\.(jpe?g|png)$/i.test(file.name);
    if (!isAccepted) {
      notify("Format gambar hanya boleh JPG atau PNG.", "error");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setEditorState((current) => ({
        ...current,
        fileName: file.name,
        originalUrl: String(reader.result || ""),
        processedUrl: "",
        error: "",
        status: "Gambar berhasil diunggah. Siap menjalankan remove background.",
      }));
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const applyBackgroundRemoval = () => {
    if (!editorState.originalUrl) {
      notify("Silakan upload gambar terlebih dahulu.", "error");
      return;
    }

    const image = new Image();
    image.onload = () => {
      const maxSize = 1400;
      const scale = Math.min(1, maxSize / image.width, maxSize / image.height);
      const sourceCanvas = document.createElement("canvas");
      const sourceContext = sourceCanvas.getContext("2d");
      sourceCanvas.width = Math.max(1, Math.round(image.width * scale));
      sourceCanvas.height = Math.max(1, Math.round(image.height * scale));

      sourceContext.drawImage(image, 0, 0, sourceCanvas.width, sourceCanvas.height);
      const imageData = sourceContext.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
      const pixels = imageData.data;

      const samples = [
        [0, 0], [sourceCanvas.width * 0.5, 0], [sourceCanvas.width - 1, 0],
        [0, sourceCanvas.height * 0.5], [sourceCanvas.width - 1, sourceCanvas.height * 0.5],
        [0, sourceCanvas.height - 1], [sourceCanvas.width * 0.5, sourceCanvas.height - 1], [sourceCanvas.width - 1, sourceCanvas.height - 1],
      ];

      const sampleColors = [];
      samples.forEach(([x, y]) => {
        const index = (Math.floor(y) * sourceCanvas.width + Math.floor(x)) * 4;
        sampleColors.push([pixels[index], pixels[index + 1], pixels[index + 2]]);
      });

      const average = sampleColors.reduce((acc, [r, g, b]) => {
        acc.r += r; acc.g += g; acc.b += b; return acc;
      }, { r: 0, g: 0, b: 0 });
      average.r /= sampleColors.length;
      average.g /= sampleColors.length;
      average.b /= sampleColors.length;

      for (let index = 0; index < pixels.length; index += 4) {
        const r = pixels[index];
        const g = pixels[index + 1];
        const b = pixels[index + 2];
        const alpha = pixels[index + 3];
        const distance = Math.sqrt((r - average.r) ** 2 + (g - average.g) ** 2 + (b - average.b) ** 2);
        const brightness = (r + g + b) / 3;
        const approxBackground = distance <= editorState.tolerance + (brightness > 180 ? 12 : 0);

        if (approxBackground && alpha > 0) {
          pixels[index + 3] = 0;
        }
      }

      sourceContext.putImageData(imageData, 0, 0);

      const outputCanvas = document.createElement("canvas");
      outputCanvas.width = sourceCanvas.width;
      outputCanvas.height = sourceCanvas.height;
      const outputContext = outputCanvas.getContext("2d");
      outputContext.fillStyle = editorState.backgroundColor;
      outputContext.fillRect(0, 0, outputCanvas.width, outputCanvas.height);
      outputContext.drawImage(sourceCanvas, 0, 0);

      setEditorState((current) => ({
        ...current,
        processedUrl: outputCanvas.toDataURL("image/png"),
        status: "Background berhasil dihapus dan warna latar telah disesuaikan.",
        error: "",
      }));
      notify("Background berhasil dihapus.");
    };

    image.src = editorState.originalUrl;
  };

  const resetEditorState = () => {
    setEditorState((current) => ({
      ...current,
      fileName: "",
      originalUrl: "",
      processedUrl: "",
      status: "Belum ada gambar yang dipilih.",
      error: "",
    }));
  };

  const downloadEditorResult = () => {
    if (!editorState.processedUrl) {
      notify("Belum ada hasil yang bisa diunduh.", "error");
      return;
    }
    const link = document.createElement("a");
    link.href = editorState.processedUrl;
    const baseName = (editorState.fileName || "remove-bg-result").replace(/\.[^.]+$/, "");
    link.download = `${baseName}-${editorState.backgroundColor.replace("#", "")}.png`;
    link.click();
    notify("File PNG hasil remove background berhasil diunduh.");
  };

  const addAudit = (action, target, detail) => {
    const time = new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit" }).format(new Date());
    setAudit((rows) => [{ actor: roles[role].name, role, action, target, detail, time }, ...rows]);
  };

  const selectRole = (nextRole) => {
    setRole(nextRole);
    setPage(nextRole === "User" ? "editor" : nextRole === "Admin" ? "users" : "infra");
    setMobileNav(false);
  };

  const saveUser = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim().toLowerCase();
    const credits = Number(form.get("credits"));
    const userStatus = String(form.get("status") || "Pending");
    const reason = String(form.get("reason") || "").trim();
    const edited = modal.type === "edit" ? modal.user : null;
    if (!name) {
      setModal((value) => ({ ...value, error: "Nama wajib diisi.", errorField: "name" }));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setModal((value) => ({ ...value, error: "Masukkan format email yang valid.", errorField: "email" }));
      return;
    }
    if (!Number.isInteger(credits) || credits < 0) {
      setModal((value) => ({ ...value, error: "Kredit harus bilangan bulat non-negatif.", errorField: "credits" }));
      return;
    }
    if (!["Aktif", "Pending", "Nonaktif"].includes(userStatus)) {
      setModal((value) => ({ ...value, error: "Status pengguna tidak valid.", errorField: "status" }));
      return;
    }
    if (users.some((item) => item.email.toLowerCase() === email && item.id !== edited?.id)) {
      setModal((value) => ({ ...value, error: "Email sudah digunakan akun lain.", errorField: "email" }));
      return;
    }
    if (edited && credits !== edited.credits && !reason) {
      setModal((value) => ({ ...value, error: "Alasan penyesuaian kredit wajib diisi.", errorField: "reason" }));
      return;
    }
    if (edited) {
      const delta = credits - edited.credits;
      setUsers((rows) => rows.map((item) => item.id === edited.id
        ? { ...item, name, email, credits, status: userStatus, initials: name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() }
        : item));
      const changes = [];
      if (delta) changes.push(`${delta > 0 ? "+" : ""}${delta} kredit · ${reason}`);
      if (userStatus !== edited.status) changes.push(`Status ${edited.status} → ${userStatus}`);
      if (name !== edited.name || email !== edited.email) changes.push("Profil diperbarui");
      addAudit(delta ? "Menyesuaikan kuota" : "Memperbarui pengguna", name, changes.join(" · ") || "Profil ditinjau");
      notify("Perubahan pengguna berhasil disimpan.");
    } else {
      const initials = name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
      setUsers((rows) => [{ id: Date.now(), name, email, role: "User", status: "Pending", credits, joined: "12 Okt 2026", initials, color: "blue" }, ...rows]);
      addAudit("Mengundang pengguna", name, `Undangan demo · ${credits} kredit`);
      notify("Undangan pengguna demo berhasil disiapkan.");
    }
    setModal(null);
  };

  const deactivate = (user) => {
    setUsers((rows) => rows.map((item) => item.id === user.id ? { ...item, status: "Nonaktif" } : item));
    addAudit("Menonaktifkan akun", user.name, "Simulasi pencabutan sesi");
    setModal(null);
    notify("Akun demo berhasil dinonaktifkan.");
  };

  const downloadCsv = (filename, rows) => {
    const escapeCell = (cell) => {
      const value = String(cell);
      const safeValue = /^[\t\r\n ]*[=+\-@]/.test(value) ? `'${value}` : value;
      return `"${safeValue.replaceAll('"', '""')}"`;
    };
    const csv = rows.map((row) => row.map(escapeCell).join(",")).join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" }));
    link.download = filename;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(link.href), 0);
  };

  const exportUsers = () => {
    const rows = [["Nama", "Email", "Role", "Status", "Kredit"], ...filtered.map(({ name, email, role: userRole, status: userStatus, credits }) => [name, email, userRole, userStatus, credits])];
    downloadCsv("clearbg-users-demo.csv", rows);
    notify("Ekspor data demo selesai.");
  };

  const exportFinance = () => {
    downloadCsv("clearbg-finance-demo.csv", [
      ["Metrik", "Nilai", "Mata uang", "Periode"],
      ["Total pendapatan", 128450000, "IDR", "Mei–Okt 2026 · DEMO"],
      ["Biaya server AI", 26840000, "IDR", "Mei–Okt 2026 · DEMO"],
      ["Laba bersih", 101610000, "IDR", "Mei–Okt 2026 · DEMO"],
      ["Biaya per foto", 42, "IDR", "Mei–Okt 2026 · DEMO"],
    ]);
    notify("Laporan finansial simulasi berhasil diekspor.");
  };

  const exportAudit = () => {
    downloadCsv("clearbg-audit-demo.csv", [
      ["Waktu", "Aktor", "Role", "Aksi", "Target", "Detail", "Status"],
      ...audit.map(({ time, actor, role: auditRole, action, target, detail }) => [time, actor, auditRole, action, target, detail, "Berhasil"]),
    ]);
    notify("Audit log simulasi berhasil diekspor.");
  };

  const applyConfig = () => {
    if (!Number.isInteger(Number(draft.batch)) || draft.batch < 1 || draft.batch > 32
      || !Number.isInteger(Number(draft.timeout)) || draft.timeout < 10 || draft.timeout > 120) {
      notify("Batch harus 1–32 dan timeout 10–120 detik.", "error");
      return;
    }
    setConfig({ batch: Number(draft.batch), timeout: Number(draft.timeout) });
    addAudit("Simulasi konfigurasi model", "BG-Remove-v2", `Batch ${config.batch} → ${draft.batch}; timeout ${config.timeout}s → ${draft.timeout}s`);
    setModal(null);
    notify("Konfigurasi demo diterapkan secara lokal.");
  };

  const setFilter = (setter, value) => { setter(value); setPageNumber(1); };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
        <a className="brand" href="#" onClick={(event) => event.preventDefault()}>
          <span className="brand-mark"><Sparkles size={19} /></span>
          <span className="brand-name">clearbg<span>editor</span></span><span className="brand-version">OPS</span>
        </a>
        <div className="workspace-label">WORKSPACE</div>
        <div className="workspace-picker"><span className="workspace-icon"><i /></span><span className="workspace-text"><strong>ClearBG Studio</strong><small>Professional plan</small></span><ChevronDown size={15} /></div>
        <div className="nav-section-label">MENU UTAMA</div>
        <nav className="side-nav" aria-label="Navigasi utama">{accessibleNav.map(({ id, label, icon: Icon }) => (
          <button key={id} className={`nav-item ${page === id ? "nav-active" : ""}`} onClick={() => { setPage(id); setMobileNav(false); }}>
            <Icon size={17} /><span>{label}</span>{id === "users" && <span className="nav-count">{users.length}</span>}
          </button>
        ))}</nav>
        <div className="sidebar-spacer" />
        <div className="help-card"><span className="help-icon"><CircleHelp size={17} /></span><span><strong>Butuh bantuan?</strong><small>Hubungi tim support kami</small></span><ChevronRight size={14} /></div>
        <button className="settings-link" onClick={() => notify("Pengaturan belum tersedia di prototype.", "info")}><Settings2 size={17} /> Pengaturan</button>
        <div className="profile-card"><Avatar role={role} /><span className="profile-copy"><strong>{roles[role].name}</strong><small>{role === "Developer" ? "Engineering" : role === "Admin" ? "Operasional" : "User"}</small></span><button className="icon-button" aria-label="Keluar" onClick={() => notify("Mode demo tidak menggunakan autentikasi.", "info")}><LogOut size={15} /></button></div>
        <button className="mobile-close" aria-label="Tutup navigasi" onClick={() => setMobileNav(false)}><X size={19} /></button>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left"><button className="icon-button mobile-menu-button" aria-label="Buka navigasi" onClick={() => setMobileNav(true)}><Menu size={18} /></button><div className="breadcrumb"><span>ClearBG Studio</span><ChevronRight size={14} /><strong>{navigation.find((item) => item.id === page)?.label}</strong></div></div>
          <div className="topbar-actions"><div className="system-pill"><i />Semua sistem normal</div><button className="icon-button notification-button" aria-label="Notifikasi" onClick={() => notify("Belum ada notifikasi baru.", "info")}><Bell size={17} /><i /></button><span className="topbar-divider" /><label className="role-switcher"><span>Mode demo</span><select value={role} onChange={(event) => selectRole(event.target.value)} aria-label="Simulasikan peran"><option>User</option><option>Admin</option><option>Developer</option></select><ChevronDown size={13} /></label><Avatar role={role} small /></div>
        </header>
        <div className="content-area">
          <div className="prototype-banner"><span><Zap size={14} /> PROTOTYPE DATA</span><p>Data dan aksi halaman ini adalah simulasi lokal, bukan sistem production.</p><button aria-label="Tentang prototype" onClick={() => notify("Data hanya disimpan di state browser selama sesi ini.", "info")}><CircleHelp size={15} /></button></div>
          {page === "editor" && <EditorPage
            fileName={editorState.fileName}
            imageUrl={editorState.originalUrl}
            processedUrl={editorState.processedUrl}
            status={editorState.status}
            error={editorState.error}
            tolerance={editorState.tolerance}
            backgroundColor={editorState.backgroundColor}
            setTolerance={(value) => setEditorState((current) => ({ ...current, tolerance: value }))}
            setBackgroundColor={(value) => setEditorState((current) => ({ ...current, backgroundColor: value }))}
            onUpload={handleEditorUpload}
            onApply={applyBackgroundRemoval}
            onReset={resetEditorState}
            onDownload={downloadEditorResult}
          />}
          {page === "users" && role === "Admin" && <UsersPage
            users={pageUsers} allUsers={users} totalUsers={users.length} totalFiltered={filtered.length}
            query={query} setQuery={(value) => setFilter(setQuery, value)}
            status={status} setStatus={(value) => setFilter(setStatus, value)}
            page={currentPage} pages={pages} pageSize={pageSize}
            setPageSize={(value) => { setPageSize(Number(value)); setPageNumber(1); }}
            setPage={setPageNumber} onCreate={() => setModal({ type: "create" })}
            onEdit={(user) => setModal({ type: "edit", user })}
            onDeactivate={(user) => setModal({ type: "deactivate", user })}
            onReset={(user) => setModal({ type: "reset", user })} onExport={exportUsers}
          />}
          {page === "finance" && (role === "Admin" || role === "Developer") && <FinancePage onExport={exportFinance} onPrint={() => window.print()} />}
          {page === "infra" && <InfrastructurePage
            role={role} loaded={infraLoaded} onRetry={() => { setInfraLoaded(true); notify("Telemetry demo berhasil dimuat ulang."); }}
            onFail={() => setInfraLoaded(false)}
            config={config} draft={draft} setDraft={setDraft} onApply={() => setModal({ type: "config" })}
          />}
          {page === "audit" && <AuditPage rows={audit} onExport={exportAudit} />}
        </div>
        <footer className="page-footer"><span>© 2026 ClearBG Editor</span><span><i /> API demo · Updated just now</span></footer>
      </main>
      {mobileNav && <button className="mobile-backdrop" aria-label="Tutup navigasi" onClick={() => setMobileNav(false)} />}
      {modal && <AppModal
        modal={modal} onClose={() => setModal(null)} onSave={saveUser}
        onClearError={() => setModal((value) => ({ ...value, error: null, errorField: null }))}
        onDeactivate={deactivate}
        onReset={() => {
          addAudit("Meminta reset password", modal.user.name, "Simulasi lokal — email tidak dikirim");
          setModal(null); notify("Simulasi reset: email tidak dikirim.", "info");
        }}
        onApply={applyConfig} config={config} draft={draft}
      />}
      {toast && <div className={`toast toast-${toast.type}`} role="status"><span>{toast.type === "error" ? "!" : <Check size={14} />}</span>{toast.message}<button aria-label="Tutup notifikasi" onClick={() => setToast(null)}><X size={15} /></button></div>}
    </div>
  );
}

function Avatar({ role, small = false }) {
  return <span className={`avatar avatar-${roles[role].className} ${small ? "avatar-small" : ""}`}>{roles[role].initials}</span>;
}

function Heading({ eyebrow, title, subtitle, children }) {
  return <div className="page-heading"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{subtitle}</p></div>{children && <div className="heading-actions">{children}</div>}</div>;
}

function EditorPage({ fileName, imageUrl, processedUrl, status, error, tolerance, backgroundColor, setTolerance, setBackgroundColor, onUpload, onApply, onReset, onDownload }) {
  return <>
    <Heading eyebrow="REMOVE BG" title="Editor remove background" subtitle="Unggah gambar JPG atau PNG, lalu hapus latar belakang dan sesuaikan warna background baru.">
      <button className="button button-secondary" onClick={onReset}><RefreshCw size={14} /> Reset</button>
    </Heading>
    <section className="editor-page">
      <div className="upload-panel panel">
        <div className="panel-header"><div><h2>Upload gambar</h2><p>Format yang didukung: JPG dan PNG</p></div><span className="subtle-tag">MAX 1400px</span></div>
        <label className="upload-dropzone" htmlFor="image-upload">
          {imageUrl ? <img src={imageUrl} alt="Preview original" className="preview-image" /> : <div className="upload-placeholder"><Plus size={24} /><span>Pilih gambar JPG / PNG</span></div>}
        </label>
        <input id="image-upload" type="file" accept=".jpg,.jpeg,.png,image/jpeg,image/png" hidden onChange={onUpload} />
        <div className="upload-actions">
          <label htmlFor="image-upload" className="button button-primary"><Plus size={14} /> Pilih file</label>
          <span>{fileName || "Belum ada file dipilih"}</span>
        </div>
      </div>

      <div className="tool-panel panel">
        <div className="panel-header"><div><h2>Pengaturan</h2><p>Sesuaikan sensitifitas hasil otomatis</p></div></div>
        <div className="editor-controls">
          <label className="range-control">
            <span>Toleransi warna</span>
            <strong>{tolerance}</strong>
            <input type="range" min="8" max="80" value={tolerance} onChange={(event) => setTolerance(Number(event.target.value))} />
          </label>
          <label className="color-control">
            <span>Warna background</span>
            <div className="color-input-wrap">
              <input type="color" value={backgroundColor} onChange={(event) => setBackgroundColor(event.target.value)} />
              <strong>{backgroundColor.toUpperCase()}</strong>
            </div>
          </label>
          {error && <div className="form-error" role="alert">{error}</div>}
          <div className="tool-actions">
            <button className="button button-primary" onClick={onApply}><Sparkles size={14} /> Hapus background</button>
            <button className="button button-secondary" onClick={onDownload}><Download size={14} /> Download PNG</button>
          </div>
          <p className="editor-status">{status}</p>
        </div>
      </div>

      <div className="result-panel panel">
        <div className="panel-header"><div><h2>Hasil preview</h2><p>Output siap dipakai dengan background baru</p></div></div>
        <div className="result-stage" style={{ backgroundColor }}>
          {processedUrl ? <img src={processedUrl} alt="Preview result" className="preview-image result-image" /> : <div className="result-placeholder">Belum ada hasil remove background</div>}
        </div>
      </div>
    </section>
  </>;
}

function MiniStat({ label, value, note, icon: Icon, tone }) {
  return <div className="mini-stat"><span className={`mini-stat-icon tone-${tone}`}><Icon size={16} /></span><span className="mini-stat-copy"><small>{label}</small><strong>{value}</strong><em>{note}</em></span><MoreHorizontal size={16} className="mini-more" /></div>;
}

function UsersPage({ users, allUsers, totalUsers, totalFiltered, query, setQuery, status, setStatus, page, pages, pageSize, setPageSize, setPage, onCreate, onEdit, onDeactivate, onReset, onExport }) {
  const activeCount = allUsers.filter((user) => user.status === "Aktif").length;
  const pendingCount = allUsers.filter((user) => user.status === "Pending").length;
  const creditTotal = allUsers.reduce((sum, user) => sum + user.credits, 0);
  return <>
    <Heading eyebrow="MANAJEMEN AKUN" title="Pengguna" subtitle="Kelola akun, status, dan alokasi kredit pelanggan.">
      <button className="button button-secondary" onClick={onExport}><Download size={15} /> Ekspor CSV</button><button className="button button-primary" onClick={onCreate}><Plus size={16} /> Tambah pengguna</button>
    </Heading>
    <div className="summary-strip">
      <MiniStat label="Total pengguna" value={totalUsers.toLocaleString("id-ID")} note="+12% bulan ini" icon={UsersRound} tone="blue" />
      <MiniStat label="Akun aktif" value={activeCount} note="Berstatus aktif" icon={Activity} tone="green" />
      <MiniStat label="Menunggu aktivasi" value={pendingCount} note="Undangan demo" icon={Clock3} tone="amber" />
      <MiniStat label="Kredit teralokasi" value={creditTotal.toLocaleString("id-ID")} note="Saldo sample" icon={Zap} tone="purple" />
    </div>
    <section className="panel user-panel">
      <div className="panel-header"><div><h2>Semua pengguna</h2><p>Kelola akses dan kredit akun pelanggan</p></div><button className="icon-button filter-button" aria-label="Bersihkan filter" onClick={() => { setStatus("Semua status"); setQuery(""); }}><SlidersHorizontal size={16} /></button></div>
      <div className="table-toolbar"><label className="search-field"><Search size={15} /><input aria-label="Cari nama atau email" placeholder="Cari nama atau email..." value={query} onChange={(event) => setQuery(event.target.value)} />{query && <button aria-label="Hapus pencarian" onClick={() => setQuery("")}><X size={13} /></button>}<kbd>⌘ K</kbd></label><div className="toolbar-filters"><label className="select-control"><span>Status:</span><select value={status} onChange={(event) => setStatus(event.target.value)}><option>Semua status</option><option>Aktif</option><option>Pending</option><option>Nonaktif</option></select><ChevronDown size={13} /></label><label className="select-control"><select aria-label="Baris per halaman" value={pageSize} onChange={(event) => setPageSize(event.target.value)}><option value={8}>8 / halaman</option><option value={10}>10 / halaman</option><option value={25}>25 / halaman</option><option value={50}>50 / halaman</option></select><ChevronDown size={13} /></label></div></div>
      <div className="table-wrap"><table className="users-table"><thead><tr><th>PENGGUNA</th><th>ROLE</th><th>STATUS</th><th>KREDIT TERSEDIA</th><th>BERGABUNG</th><th /></tr></thead><tbody>
        {users.map((user) => <tr key={user.id}><td><div className="user-cell"><span className={`user-avatar user-${user.color}`}>{user.initials}</span><span><strong>{user.name}</strong><small>{user.email}</small></span></div></td><td><span className="customer-role">{user.role}</span></td><td><StatusBadge status={user.status} /></td><td><span className="credit-cell"><strong>{user.credits.toLocaleString("id-ID")}</strong><small>kredit</small></span></td><td className="joined-cell">{user.joined}</td><td><div className="row-actions"><button className="icon-button" aria-label={`Edit ${user.name}`} onClick={() => onEdit(user)}><Pencil size={14} /></button><button className="icon-button" aria-label={`Reset password ${user.name}`} onClick={() => onReset(user)}><MoreHorizontal size={17} /></button><button className="icon-button danger-icon" aria-label={`Nonaktifkan ${user.name}`} disabled={user.status === "Nonaktif"} onClick={() => onDeactivate(user)}><Trash2 size={14} /></button></div></td></tr>)}
        {!users.length && <tr><td colSpan="6"><div className="empty-state"><Search size={23} /><strong>Tidak ada pengguna ditemukan</strong><span>Ubah kata kunci atau filter status Anda.</span></div></td></tr>}
      </tbody></table></div>
      <div className="table-footer"><span>Menampilkan <strong>{totalFiltered ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, totalFiltered)}</strong> dari <strong>{totalFiltered}</strong> pengguna</span><div className="pagination"><button className="icon-button" aria-label="Halaman sebelumnya" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}><ChevronLeft size={15} /></button><span>Halaman <b>{page}</b> dari <b>{pages}</b></span><button className="icon-button" aria-label="Halaman berikutnya" disabled={page >= pages} onClick={() => setPage((value) => Math.min(pages, value + 1))}><ChevronRight size={15} /></button></div></div>
    </section>
    <div className="below-note"><ShieldCheck size={14} /> Data contoh; perubahan tidak dikirim ke server.</div>
  </>;
}

function StatusBadge({ status }) {
  const kind = status === "Aktif" ? "active" : status === "Pending" ? "pending" : "inactive";
  return <span className={`status-badge status-${kind}`}><i />{status}</span>;
}

function FinancePage({ onExport, onPrint }) {
  const kpis = [
    ["Total pendapatan", currency(128450000), "+12,8%", "vs. 6 bulan sebelumnya", "blue", ArrowUpRight],
    ["Biaya server AI", currency(26840000), "+4,2%", "vs. 6 bulan sebelumnya", "purple", Server],
    ["Laba bersih", currency(101610000), "+15,4%", "Margin demo 79,1%", "green", ArrowUpRight],
    ["Biaya per foto", currency(42), "-8,1%", "per foto sukses", "cyan", Gauge],
  ];
  return <>
    <Heading eyebrow="RINGKASAN BISNIS" title="Dashboard Eksekutif" subtitle="Pantau kesehatan finansial ClearBG Studio.">
      <button className="button button-secondary"><Clock3 size={14} /> 6 bulan terakhir <ChevronDown size={13} /></button><button className="button button-secondary" onClick={onPrint}><Download size={15} /> Cetak / PDF</button><button className="button button-primary" onClick={onExport}><Download size={15} /> Unduh CSV</button>
    </Heading>
    <Notice>Angka finansial di bawah adalah <strong>data simulasi</strong>. Validasi sumber data dan formula dengan Finance.</Notice>
    <div className="kpi-grid">{kpis.map(([label, value, change, note, tone, Icon]) => <article className="kpi-card" key={label}><div className="kpi-top"><span>{label}</span><i className={`kpi-icon kpi-${tone}`}><Icon size={15} /></i></div><strong className="kpi-value">{value}</strong><div className="kpi-foot"><b><ArrowUpRight size={12} />{change}</b><span>{note}</span></div></article>)}</div>
    <section className="panel chart-panel"><div className="panel-header"><div><h2>Pendapatan vs biaya server</h2><p>Tren bulanan · Rupiah</p></div><button className="icon-button" aria-label="Opsi grafik"><MoreHorizontal size={17} /></button></div><div className="chart-legend"><span><i className="legend-revenue" />Pendapatan</span><span><i className="legend-cost" />Biaya server AI</span><small>DATA SIMULASI</small></div><div className="chart-area"><div className="chart-y-labels"><span>Rp 30 jt</span><span>Rp 20 jt</span><span>Rp 10 jt</span><span>Rp 0</span></div><div className="chart-plot"><div className="chart-grid"><i /><i /><i /><i /></div><div className="chart-columns">{monthly.map((item) => <div className="chart-month" key={item.month}><div className="bar-group"><i className="chart-bar bar-revenue" style={{ height: `${item.revenue}%` }} /><i className="chart-bar bar-cost" style={{ height: `${item.cost}%` }} /></div><span>{item.month}</span></div>)}</div></div></div><div className="chart-footer"><span><i /> Data billing simulasi</span><span>Mei – Okt 2026</span></div></section>
    <div className="finance-lower"><section className="panel lower-panel"><div className="panel-header"><div><h2>Ringkasan operasional</h2><p>Periode berjalan · data demo</p></div><small className="subtle-tag">DEMO</small></div><div className="ops-list"><div><span><i className="ops-blue" />Foto berhasil diproses</span><b>642.850</b></div><div><span><i className="ops-green" />Pengguna aktif</span><b>8.429</b></div><div><span><i className="ops-purple" />Paket terlaris</span><b>Pro Monthly</b></div></div></section><section className="insight-card"><span><Sparkles size={17} /></span><div><small>INSIGHT DEMO</small><h3>Efisiensi meningkat</h3><p>Biaya per foto turun 8,1% dari periode sebelumnya pada data simulasi.</p></div></section></div>
  </>;
}

function Notice({ children }) {
  return <div className="financial-notice"><CircleHelp size={15} /><span>{children}</span><small><Clock3 size={12} /> Updated 5 menit lalu</small></div>;
}

function InfrastructurePage({ role, loaded, onRetry, onFail, config, draft, setDraft, onApply }) {
  const metrics = [["Penggunaan GPU", "68", "%", "Rata-rata cluster", 68, "blue"], ["Penggunaan VRAM", "21.8", "GB", "dari 32 GB tersedia", 68, "purple"], ["Latency render", "1.24", "s", "p95 · target < 2.0s", 62, "green"], ["Foto diproses", "2,486", "", "Dalam 24 jam", 76, "cyan"]];
  return <>
    <Heading eyebrow="STATUS PLATFORM" title="Infrastruktur AI" subtitle="Pantau kesehatan cluster dan performa pemrosesan gambar."><button className="button button-secondary" onClick={onFail}><Server size={14} /> Simulasikan API down</button><button className="button button-secondary" onClick={onRetry}><RefreshCw size={14} /> Segarkan data</button></Heading>
    <Notice>Telemetry dan status cluster adalah <strong>data simulasi statis</strong>, bukan koneksi GPU sungguhan.</Notice>
    {!loaded ? <section className="panel error-panel"><Server size={28} /><h2>Gagal mengambil data server</h2><p>Telemetry demo tidak tersedia.</p><button className="button button-primary" onClick={onRetry}><RefreshCw size={14} /> Coba lagi</button></section> : <>
      <div className="cluster-banner"><span className="cluster-mark"><Cpu size={21} /></span><div className="cluster-copy"><div><h2>GPU Cluster — Jakarta</h2><span className="cluster-status"><i /> Semua node beroperasi</span></div><p>Cluster utama · Region ap-southeast-3 · Sinkronisasi simulasi</p></div><div className="cluster-nodes"><b>04<small> / 04</small></b><span>NODE AKTIF</span></div></div>
      <div className="infra-metrics">{metrics.map(([label, value, unit, caption, percent, tone]) => <article className="infra-metric" key={label}><div className={`metric-gauge gauge-${tone}`} style={{ "--progress": `${percent}%` }}><span>{value}<small>{unit}</small></span></div><div><small>{label}</small><b>{value}<i>{unit}</i></b><p>{caption}</p></div></article>)}</div>
      <div className="infra-grid"><section className="panel node-panel"><div className="panel-header"><div><h2>Status node GPU</h2><p>Detail kesehatan setiap node</p></div><small className="subtle-tag">4 NODES</small></div><div className="node-list">{[["gpu-node-01", "38%", "healthy"], ["gpu-node-02", "72%", "healthy"], ["gpu-node-03", "84%", "warning"], ["gpu-node-04", "51%", "healthy"]].map(([name, usage, state]) => <div className="node-row" key={name}><span className={`node-icon ${state}`}><Cpu size={15} /></span><span className="node-name"><b>{name}</b><small>NVIDIA A10G</small></span><span className="node-load"><i><b style={{ width: usage }} /></i><small>GPU {usage}</small></span><span className={`node-state ${state}`}><i />{state === "warning" ? "Beban tinggi" : "Sehat"}</span></div>)}</div></section>
        <section className="panel config-panel"><div className="panel-header"><div><h2>Konfigurasi model</h2><p>BG-Remove-v2 · nilai demo</p></div><span className="config-shield"><ShieldCheck size={16} /></span></div><ConfigRange label="Batch size" value={draft.batch} min={1} max={32} unit=" images / batch" disabled={role !== "Developer"} onChange={(value) => setDraft((current) => ({ ...current, batch: value }))} /><ConfigRange label="Timeout pemrosesan" value={draft.timeout} min={10} max={120} step={5} unit=" detik" disabled={role !== "Developer"} onChange={(value) => setDraft((current) => ({ ...current, timeout: value }))} /><div className="config-applied"><span>Konfigurasi aktif</span><b>Batch {config.batch} · Timeout {config.timeout}s</b></div><button className="button button-primary config-apply" disabled={role !== "Developer" || (config.batch === Number(draft.batch) && config.timeout === Number(draft.timeout))} onClick={onApply}>{role === "Developer" ? "Terapkan perubahan demo" : "Hanya Developer dapat mengubah"}</button><p className="config-hint"><ShieldCheck size={13} /> Perubahan mengubah state lokal prototype.</p></section></div>
    </>}
    <div className="infra-footer"><span><i /> Snapshot telemetry contoh</span><span><Clock3 size={12} /> 12 Okt 2026, 13:00 WIB</span></div>
  </>;
}

function ConfigRange({ label, value, min, max, step = 1, unit, disabled, onChange }) {
  return <label className="config-control"><span>{label}<b>{value}<small>{unit}</small></b></span><input type="range" min={min} max={max} step={step} value={value} disabled={disabled} onChange={(event) => onChange(Number(event.target.value))} /><small><i>{min}</i><i>Maksimum {max}</i></small></label>;
}

function AuditPage({ rows, onExport }) {
  const [query, setQuery] = useState("");
  const filteredRows = rows.filter((row) =>
    `${row.actor} ${row.role} ${row.action} ${row.target} ${row.detail}`.toLowerCase().includes(query.trim().toLowerCase()));
  return <>
    <Heading eyebrow="KEAMANAN & KEPATUHAN" title="Audit Log" subtitle="Riwayat aktivitas administratif dan perubahan sistem."><button className="button button-secondary" onClick={() => window.print()}><Download size={15} /> Cetak log</button></Heading>
    <div className="audit-stats"><MiniStat label="Total aktivitas" value={String(rows.length).padStart(2, "0")} note="Pada sesi prototype" icon={Activity} tone="blue" /><MiniStat label="Aktivitas berhasil" value={String(rows.length).padStart(2, "0")} note="Event dicatat lokal" icon={ShieldCheck} tone="green" /><MiniStat label="Gagal / ditolak" value="00" note="Simulasi lokal" icon={ShieldCheck} tone="amber" /></div>
    <section className="panel audit-panel"><div className="panel-header"><div><h2>Aktivitas terbaru</h2><p>Event simulasi sesi browser saat ini</p></div><button className="button button-secondary compact-button" onClick={onExport}><Download size={13} /> Ekspor CSV</button></div><div className="audit-toolbar"><label className="search-field"><Search size={15} /><input aria-label="Cari audit log" placeholder="Cari aktor, aksi, target..." value={query} onChange={(event) => setQuery(event.target.value)} />{query && <button aria-label="Hapus pencarian audit" onClick={() => setQuery("")}><X size={13} /></button>}</label><span>Rentang demo: sesi ini</span></div><div className="table-wrap"><table className="audit-table"><thead><tr><th>AKTIVITAS</th><th>AKTOR</th><th>DETAIL</th><th>WAKTU</th><th>STATUS</th></tr></thead><tbody>{filteredRows.map((row, index) => <tr key={`${row.time}-${index}`}><td><span className="audit-action"><i><Activity size={14} /></i><span><b>{row.action}</b><small>{row.target}</small></span></span></td><td><span className="actor-name">{row.actor}</span><small className="actor-role">{row.role}</small></td><td>{row.detail}</td><td>{row.time} WIB</td><td><span className="audit-success"><i />Berhasil</span></td></tr>)}{filteredRows.length === 0 && <tr><td colSpan="5"><div className="empty-state"><Search size={22} /><strong>Tidak ada aktivitas yang cocok</strong><span>Coba kata kunci lain.</span></div></td></tr>}</tbody></table></div><div className="table-footer"><span>Menampilkan <b>{filteredRows.length}</b> dari <b>{rows.length}</b> event demo</span><span className="immutable-label"><ShieldCheck size={13} /> Tidak persisten</span></div></section>
  </>;
}

function AppModal({ modal, onClose, onSave, onClearError, onDeactivate, onReset, onApply, config, draft }) {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [creditValue, setCreditValue] = useState(modal.user?.credits ?? 100);
  const dialogRef = useRef(null);
  const user = modal.user;
  const title = { create: "Undang pengguna", edit: "Edit pengguna", deactivate: "Nonaktifkan akun?", reset: "Reset password?", config: "Terapkan konfigurasi?" }[modal.type];
  const submit = (event) => { setBusy(true); onSave(event); window.setTimeout(() => setBusy(false), 300); };

  useEffect(() => {
    const previousFocus = document.activeElement;
    const dialog = dialogRef.current;
    const firstControl = dialog?.querySelector("input, button");
    firstControl?.focus();
    const handleKeys = (event) => {
      if (event.key === "Escape") {
        onClose();
      } else if (event.key === "Tab" && dialog) {
        const controls = [...dialog.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex="0"]')];
        if (controls.length === 0) return;
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKeys);
    return () => {
      document.removeEventListener("keydown", handleKeys);
      previousFocus?.focus?.();
    };
  }, []);

  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="modal-card" ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-heading"><div><small className="eyebrow">{modal.type === "config" ? "INFRASTRUKTUR" : "MANAJEMEN PENGGUNA"}</small><h2 id="modal-title">{title}</h2></div><button className="icon-button" aria-label="Tutup modal" onClick={onClose}><X size={16} /></button></div>
    {(modal.type === "create" || modal.type === "edit") && <form onSubmit={submit} noValidate>
      {modal.error && <div className="form-error" role="alert">{modal.error}</div>}
      <label className="form-field"><span>Nama lengkap <i>*</i></span><input name="name" aria-invalid={modal.errorField === "name"} className={modal.errorField === "name" ? "field-invalid" : ""} defaultValue={user?.name || ""} placeholder="Contoh: Nadia Putri" onChange={() => modal.error && onClearError()} /></label>
      <label className="form-field"><span>Alamat email <i>*</i></span><input name="email" type="email" aria-invalid={modal.errorField === "email"} className={modal.errorField === "email" ? "field-invalid" : ""} defaultValue={user?.email || ""} placeholder="nama@email.com" onChange={() => modal.error && onClearError()} /></label>
      {modal.type === "edit" && <label className="form-field"><span>Role pengguna</span><div className="readonly-field"><UsersRound size={14} /> User <small>Role pelanggan dikelola sistem</small></div></label>}
      {modal.type === "edit" && <label className="form-field"><span>Status akun</span><select className={`status-select ${modal.errorField === "status" ? "field-invalid" : ""}`} aria-invalid={modal.errorField === "status"} name="status" defaultValue={user.status} onChange={() => modal.error && onClearError()}><option>Aktif</option><option>Pending</option><option>Nonaktif</option></select></label>}
      <label className="form-field"><span>{modal.type === "edit" ? "Saldo kredit" : "Kredit awal"} <i>*</i></span><div className={`input-suffix ${modal.errorField === "credits" ? "field-invalid" : ""}`}><input name="credits" type="number" min="0" step="1" aria-invalid={modal.errorField === "credits"} value={creditValue} onChange={(event) => { setCreditValue(event.target.value); if (modal.error) onClearError(); }} /><small>kredit</small></div></label>
      {modal.type === "edit" && <><label className="form-field"><span>Alasan penyesuaian <small className="inline-hint">wajib jika saldo berubah</small></span><input name="reason" aria-invalid={modal.errorField === "reason"} className={modal.errorField === "reason" ? "field-invalid" : ""} value={reason} onChange={(event) => { setReason(event.target.value); if (modal.error) onClearError(); }} placeholder="Contoh: Koreksi pembelian paket" /></label><div className="credit-preview"><span>Saldo saat ini <b>{user.credits.toLocaleString("id-ID")}</b></span><span>Saldo setelah perubahan <b>{Number(creditValue || 0).toLocaleString("id-ID")}</b></span></div></>}
      {modal.type === "create" && <p className="modal-hint">Undangan aktivasi hanya disimulasikan. Tidak ada email yang dikirim.</p>}
      <div className="modal-actions"><button type="button" className="button button-secondary" onClick={onClose}>Batal</button><button type="submit" className="button button-primary" disabled={busy}>{busy ? <><RefreshCw className="spin" size={14} /> Menyimpan...</> : modal.type === "create" ? "Buat undangan" : "Simpan perubahan"}</button></div>
    </form>}
    {modal.type === "deactivate" && <div className="confirm-body"><span className="confirm-icon danger"><Trash2 size={18} /></span><p>Akun <b>{user.name}</b> akan dinonaktifkan. Histori tetap dipertahankan.</p><div className="confirm-target">{user.email}</div><div className="modal-actions"><button className="button button-secondary" onClick={onClose}>Batal</button><button className="button button-danger" onClick={() => onDeactivate(user)}>Nonaktifkan akun</button></div></div>}
    {modal.type === "reset" && <div className="confirm-body"><span className="confirm-icon"><ShieldCheck size={18} /></span><p>Simulasikan permintaan reset password untuk <b>{user.name}</b>?</p><div className="confirm-target">{user.email}</div><p className="modal-hint">Tidak ada email yang dikirim atau password yang diubah.</p><div className="modal-actions"><button className="button button-secondary" onClick={onClose}>Batal</button><button className="button button-primary" onClick={onReset}>Simulasikan permintaan</button></div></div>}
    {modal.type === "config" && <div className="confirm-body"><span className="confirm-icon"><Cpu size={18} /></span><p>Konfirmasi konfigurasi demo model <b>BG-Remove-v2</b>.</p><div className="config-diff"><span>Batch size <b>{config.batch} → {draft.batch}</b></span><span>Timeout <b>{config.timeout}s → {draft.timeout}s</b></span></div><p className="modal-hint">State lokal saja. Production perlu validasi server, audit, dan mekanisme rollback.</p><div className="modal-actions"><button className="button button-secondary" onClick={onClose}>Batal</button><button className="button button-primary" onClick={onApply}>Terapkan demo</button></div></div>}
  </section></div>;
}
