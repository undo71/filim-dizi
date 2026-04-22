import express from "express";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

interface Film {
  id: number;
  baslik: string;
  tur: string;
  yil: number;
  puan: number;
  durum: "izlendi" | "izlenecek" | "izleniyor";
  notlar: string;
  afis: string;
}

interface Oneri {
  id: number;
  gonderen: string;
  baslik: string;
  aciklama: string;
  zaman: string;
  begeni: number;
}

let filmler: Film[] = [
  { id: 1, baslik: "Interstellar", tur: "Bilim Kurgu", yil: 2014, puan: 10, durum: "izlendi", notlar: "Muhteşem!", afis: "🚀" },
  { id: 2, baslik: "The Dark Knight", tur: "Aksiyon", yil: 2008, puan: 10, durum: "izlendi", notlar: "Joker efsane!", afis: "🦇" },
  { id: 3, baslik: "Inception", tur: "Bilim Kurgu", yil: 2010, puan: 9, durum: "izlendi", notlar: "Zihin büküyor", afis: "🌀" },
  { id: 4, baslik: "Parasite", tur: "Dram", yil: 2019, puan: 9, durum: "izlendi", notlar: "Oscar'a layık", afis: "🏠" },
  { id: 5, baslik: "Dune", tur: "Bilim Kurgu", yil: 2021, puan: 0, durum: "izlenecek", notlar: "", afis: "🏜️" },
  { id: 6, baslik: "Oppenheimer", tur: "Dram", yil: 2023, puan: 0, durum: "izlenecek", notlar: "", afis: "💣" },
  { id: 7, baslik: "Breaking Bad", tur: "Dram", yil: 2008, puan: 0, durum: "izleniyor", notlar: "", afis: "🧪" },
];

let oneriler: Oneri[] = [
  { id: 1, gonderen: "Ahmet", baslik: "The Shawshank Redemption", aciklama: "Kesinlikle izlenmeli, çok etkileyici!", zaman: "23/04/2026 10:00", begeni: 5 },
  { id: 2, gonderen: "Ayşe", baslik: "Spirited Away", aciklama: "Miyazaki'nin şaheseri!", zaman: "23/04/2026 11:00", begeni: 3 },
];

let sonId = 7;
let sonOneriId = 2;

const HTML = (icerik: string, aktifSayfa: string): string => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Film Takip</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial; background: #0d0d1a; color: white; }
    .header { background: linear-gradient(135deg, #1a0533, #2d1b69); padding: 18px 40px; display: flex; justify-content: space-between; align-items: center; }
    .header h1 { font-size: 22px; color: #e040fb; }
    .nav { display: flex; gap: 8px; flex-wrap: wrap; }
    .nav a { color: white; text-decoration: none; background: rgba(255,255,255,0.1); padding: 8px 14px; border-radius: 6px; font-size: 13px; }
    .nav a.aktif { background: #e040fb; }
    .nav a:hover { background: rgba(255,255,255,0.2); }
    .container { max-width: 1100px; margin: 25px auto; padding: 0 20px; }
    .card { background: #1a1a2e; border-radius: 12px; padding: 20px; border: 1px solid #2a2a3e; margin-bottom: 20px; }
    .card h2 { color: #e040fb; margin-bottom: 15px; font-size: 17px; }
    .grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 20px; }
    .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
    .ozet { background: #1a1a2e; border-radius: 10px; padding: 18px; text-align: center; border: 1px solid #2a2a3e; }
    .ozet .sayi { font-size: 28px; font-weight: bold; color: #e040fb; }
    .ozet .label { font-size: 12px; color: #888; margin-top: 4px; }
    .film-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
    .film-kart { background: #0d0d1a; border: 1px solid #2a2a3e; border-radius: 10px; padding: 15px; transition: transform 0.2s; }
    .film-kart:hover { transform: translateY(-3px); border-color: #e040fb; }
    .film-afis { font-size: 48px; text-align: center; margin-bottom: 10px; }
    .film-baslik { font-weight: bold; font-size: 14px; margin-bottom: 5px; }
    .film-bilgi { font-size: 12px; color: #888; }
    .durum-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: bold; margin-top: 6px; }
    .izlendi { background: #1b5e2044; color: #00e676; border: 1px solid #00e676; }
    .izlenecek { background: #1a237e44; color: #82b1ff; border: 1px solid #82b1ff; }
    .izleniyor { background: #f57f1744; color: #ffab40; border: 1px solid #ffab40; }
    .yildiz { color: #ffd700; font-size: 13px; }
    input, select, textarea { width: 100%; padding: 10px; background: #0d0d1a; border: 1px solid #2a2a3e; border-radius: 6px; color: white; font-size: 14px; margin-top: 5px; margin-bottom: 12px; }
    label { font-size: 13px; color: #aaa; }
    .btn { padding: 11px 20px; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; width: 100%; font-weight: bold; }
    .btn-purple { background: #e040fb; color: white; }
    .btn-red { background: #ff5252; color: white; margin-top: 5px; }
    .btn-green { background: #00e676; color: #000; }
    .btn-blue { background: #82b1ff; color: #000; }
    .btn-sm { padding: 5px 10px; font-size: 12px; width: auto; }
    .tur-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #2a2a3e; }
    .tur-bar { height: 6px; background: #e040fb; border-radius: 3px; margin-top: 4px; }
    .bos { text-align: center; color: #888; padding: 40px; }
    .arama-bar { display: flex; gap: 10px; margin-bottom: 20px; }
    .arama-bar input { margin: 0; flex: 1; }
    .arama-bar select { margin: 0; width: auto; }
    .top10-item { display: flex; align-items: center; gap: 15px; padding: 12px; border-bottom: 1px solid #2a2a3e; }
    .top10-no { font-size: 24px; font-weight: bold; color: #e040fb; width: 40px; }
    .top10-no.altin { color: #ffd700; }
    .top10-no.gumus { color: #c0c0c0; }
    .top10-no.bronz { color: #cd7f32; }
    .oneri-kart { background: #0d0d1a; border: 1px solid #2a2a3e; border-radius: 8px; padding: 15px; margin: 10px 0; }
    .oneri-kart:hover { border-color: #e040fb; }
    .duzenle-form { background: #0d0d1a; border: 1px solid #e040fb; border-radius: 8px; padding: 15px; margin-top: 10px; display: none; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎬 Film & Dizi Takip</h1>
    <div class="nav">
      <a href="/" class="${aktifSayfa === "ana" ? "aktif" : ""}">🏠 Ana</a>
      <a href="/ara" class="${aktifSayfa === "ara" ? "aktif" : ""}">🔍 Ara</a>
      <a href="/top10" class="${aktifSayfa === "top10" ? "aktif" : ""}">🏆 Top 10</a>
      <a href="/izlendi" class="${aktifSayfa === "izlendi" ? "aktif" : ""}">✅ İzlendi</a>
      <a href="/izleniyor" class="${aktifSayfa === "izleniyor" ? "aktif" : ""}">▶️ İzleniyor</a>
      <a href="/izlenecek" class="${aktifSayfa === "izlenecek" ? "aktif" : ""}">📌 İzlenecek</a>
      <a href="/ekle" class="${aktifSayfa === "ekle" ? "aktif" : ""}">➕ Ekle</a>
      <a href="/oneriler" class="${aktifSayfa === "oneriler" ? "aktif" : ""}">👥 Öneriler</a>
      <a href="/istatistik" class="${aktifSayfa === "istatistik" ? "aktif" : ""}">📊 İstatistik</a>
    </div>
  </div>
  <div class="container">${icerik}</div>
  <script>
    function duzenleAc(id) {
      const form = document.getElementById('duzenle-' + id);
      if (form) form.style.display = form.style.display === 'none' ? 'block' : 'none';
    }
  </script>
</body>
</html>`;

function filmKart(f: Film): string {
  const yildiz = f.puan > 0 ? "⭐".repeat(Math.round(f.puan / 2)) : "—";
  return `
  <div class="film-kart">
    <div class="film-afis">${f.afis || "🎬"}</div>
    <div class="film-baslik">${f.baslik}</div>
    <div class="film-bilgi">${f.tur} | ${f.yil}</div>
    <div class="yildiz">${yildiz} ${f.puan > 0 ? f.puan + "/10" : ""}</div>
    <span class="durum-badge ${f.durum}">${f.durum}</span>
    ${f.notlar ? `<div style="font-size:11px;color:#888;margin-top:5px;">${f.notlar}</div>` : ""}
    <button onclick="duzenleAc(${f.id})" class="btn btn-blue" style="font-size:12px;padding:5px;margin-top:8px;">✏️ Düzenle</button>
    <div id="duzenle-${f.id}" class="duzenle-form">
      <form method="POST" action="/duzenle/${f.id}">
        <label>Puan</label>
        <input type="number" name="puan" value="${f.puan}" min="0" max="10">
        <label>Durum</label>
        <select name="durum">
          <option value="izlenecek" ${f.durum === "izlenecek" ? "selected" : ""}>📌 İzlenecek</option>
          <option value="izleniyor" ${f.durum === "izleniyor" ? "selected" : ""}>▶️ İzleniyor</option>
          <option value="izlendi" ${f.durum === "izlendi" ? "selected" : ""}>✅ İzlendi</option>
        </select>
        <label>Notlar</label>
        <input type="text" name="notlar" value="${f.notlar}">
        <button class="btn btn-purple" style="font-size:12px;padding:6px;">💾 Kaydet</button>
      </form>
    </div>
    <form method="POST" action="/sil/${f.id}" style="margin-top:5px;">
      <button class="btn btn-red" style="font-size:12px;padding:5px;">🗑️ Sil</button>
    </form>
  </div>`;
}

function ozetKartlar(): string {
  const izlendi = filmler.filter(f => f.durum === "izlendi").length;
  const izleniyor = filmler.filter(f => f.durum === "izleniyor").length;
  return `
  <div class="grid3" style="margin-bottom:20px;">
    <div class="ozet"><div class="sayi">${filmler.length}</div><div class="label">Toplam</div></div>
    <div class="ozet"><div class="sayi" style="color:#00e676">${izlendi}</div><div class="label">✅ İzlendi</div></div>
    <div class="ozet"><div class="sayi" style="color:#ffab40">${izleniyor}</div><div class="label">▶️ İzleniyor</div></div>
  </div>`;
}

// Ana sayfa
app.get("/", (req: express.Request, res: express.Response) => {
  const kartlar = filmler.map(filmKart).join("");
  const icerik = `
    ${ozetKartlar()}
    <div class="card">
      <h2>🎬 Tüm Filmler & Diziler (${filmler.length})</h2>
      ${filmler.length > 0 ? `<div class="film-grid">${kartlar}</div>` : '<div class="bos">Henüz film yok!</div>'}
    </div>`;
  res.send(HTML(icerik, "ana"));
});

// Arama
app.get("/ara", (req: express.Request, res: express.Response) => {
  const q = ((req.query as any).q || "").toLowerCase();
  const tur = (req.query as any).tur || "";
  const durum = (req.query as any).durum || "";
  let liste = [...filmler];
  if (q) liste = liste.filter(f => f.baslik.toLowerCase().includes(q));
  if (tur) liste = liste.filter(f => f.tur === tur);
  if (durum) liste = liste.filter(f => f.durum === durum);
  const turler = [...new Set(filmler.map(f => f.tur))];
  const kartlar = liste.map(filmKart).join("");
  const icerik = `
    <div class="card">
      <h2>🔍 Film & Dizi Ara</h2>
      <form method="GET" action="/ara">
        <div class="arama-bar">
          <input type="text" name="q" placeholder="Film adı ara..." value="${q}">
          <select name="tur">
            <option value="">Tüm Türler</option>
            ${turler.map(t => `<option value="${t}" ${tur === t ? "selected" : ""}>${t}</option>`).join("")}
          </select>
          <select name="durum">
            <option value="">Tüm Durumlar</option>
            <option value="izlendi" ${durum === "izlendi" ? "selected" : ""}>✅ İzlendi</option>
            <option value="izleniyor" ${durum === "izleniyor" ? "selected" : ""}>▶️ İzleniyor</option>
            <option value="izlenecek" ${durum === "izlenecek" ? "selected" : ""}>📌 İzlenecek</option>
          </select>
          <button class="btn btn-purple" style="width:auto;padding:10px 20px;" type="submit">🔍 Ara</button>
        </div>
      </form>
      <p style="color:#888;font-size:13px;margin-bottom:15px;">${liste.length} sonuç bulundu</p>
      ${liste.length > 0 ? `<div class="film-grid">${kartlar}</div>` : '<div class="bos">Sonuç bulunamadı!</div>'}
    </div>`;
  res.send(HTML(icerik, "ara"));
});

// Top 10
app.get("/top10", (req: express.Request, res: express.Response) => {
  const top = [...filmler].filter(f => f.puan > 0).sort((a, b) => b.puan - a.puan).slice(0, 10);
  const satirlar = top.map((f, i) => {
    const noClass = i === 0 ? "altin" : i === 1 ? "gumus" : i === 2 ? "bronz" : "";
    const madalya = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "";
    return `
    <div class="top10-item">
      <div class="top10-no ${noClass}">${madalya || "#" + (i + 1)}</div>
      <div style="font-size:30px;">${f.afis}</div>
      <div style="flex:1;">
        <div style="font-weight:bold;">${f.baslik}</div>
        <div style="font-size:12px;color:#888;">${f.tur} | ${f.yil}</div>
      </div>
      <div style="text-align:right;">
        <div style="font-size:20px;font-weight:bold;color:#ffd700;">${f.puan}/10</div>
        <div style="font-size:11px;color:#888;">${"⭐".repeat(Math.round(f.puan / 2))}</div>
      </div>
    </div>`;
  }).join("");
  const icerik = `
    <div class="card">
      <h2>🏆 Top 10 Film & Dizi</h2>
      ${top.length > 0 ? satirlar : '<div class="bos">Henüz puanlı film yok!</div>'}
    </div>`;
  res.send(HTML(icerik, "top10"));
});

// Durum sayfaları
["izlendi", "izleniyor", "izlenecek"].forEach((durum: string) => {
  app.get(`/${durum}`, (req: express.Request, res: express.Response) => {
    const liste = filmler.filter((f: Film) => f.durum === durum as Film["durum"]);
    const kartlar = liste.map(filmKart).join("");
    const emoji = durum === "izlendi" ? "✅" : durum === "izleniyor" ? "▶️" : "📌";
    const icerik = `
      <div class="card">
        <h2>${emoji} ${durum.toUpperCase()} (${liste.length})</h2>
        ${liste.length > 0 ? `<div class="film-grid">${kartlar}</div>` : '<div class="bos">Bu listede film yok!</div>'}
      </div>`;
    res.send(HTML(icerik, durum));
  });
});

// Ekle
app.get("/ekle", (req: express.Request, res: express.Response) => {
  const icerik = `
    <div class="card">
      <h2>➕ Yeni Film / Dizi Ekle</h2>
      <form method="POST" action="/ekle">
        <div class="grid2">
          <div>
            <label>Film/Dizi Adı</label>
            <input type="text" name="baslik" placeholder="Interstellar" required>
            <label>Tür</label>
            <select name="tur">
              <option>Bilim Kurgu</option><option>Aksiyon</option><option>Dram</option>
              <option>Komedi</option><option>Korku</option><option>Animasyon</option>
              <option>Belgesel</option><option>Romantik</option>
            </select>
            <label>Yıl</label>
            <input type="number" name="yil" placeholder="2024" min="1900" max="2030">
          </div>
          <div>
            <label>Durum</label>
            <select name="durum">
              <option value="izlenecek">📌 İzlenecek</option>
              <option value="izleniyor">▶️ İzleniyor</option>
              <option value="izlendi">✅ İzlendi</option>
            </select>
            <label>Puan (1-10)</label>
            <input type="number" name="puan" placeholder="0" min="0" max="10">
            <label>Afis Emojisi</label>
            <input type="text" name="afis" placeholder="🎬" maxlength="2">
            <label>Notlar</label>
            <textarea name="notlar" placeholder="Film hakkında notlar..." rows="2" style="resize:none;"></textarea>
          </div>
        </div>
        <button class="btn btn-purple">➕ Ekle</button>
      </form>
    </div>`;
  res.send(HTML(icerik, "ekle"));
});

app.post("/ekle", (req: express.Request, res: express.Response) => {
  const { baslik, tur, yil, durum, puan, notlar, afis } = req.body;
  filmler.push({
    id: ++sonId, baslik, tur,
    yil: parseInt(yil) || 2024,
    puan: parseInt(puan) || 0,
    durum: durum as Film["durum"],
    notlar: notlar || "",
    afis: afis || "🎬"
  });
  res.redirect("/");
});

// Düzenle
app.post("/duzenle/:id", (req: express.Request, res: express.Response) => {
  const id = parseInt((req.params as any).id);
  const film = filmler.find(f => f.id === id);
  if (film) {
    film.puan = parseInt(req.body.puan) || 0;
    film.durum = req.body.durum as Film["durum"];
    film.notlar = req.body.notlar || "";
  }
  res.redirect("/");
});

// Sil
app.post("/sil/:id", (req: express.Request, res: express.Response) => {
  const silId = parseInt((req.params as any).id);
  filmler = filmler.filter((f: Film) => f.id !== silId);
  res.redirect("/");
});

// Öneriler
app.get("/oneriler", (req: express.Request, res: express.Response) => {
  const oneriSatirlari = oneriler.map(o => `
    <div class="oneri-kart">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div>
          <div style="font-weight:bold;color:#e040fb;">🎬 ${o.baslik}</div>
          <div style="font-size:12px;color:#888;">👤 ${o.gonderen} | ${o.zaman}</div>
        </div>
        <form method="POST" action="/begeni/${o.id}" style="display:inline;">
          <button class="btn btn-purple" style="width:auto;padding:6px 14px;font-size:13px;">👍 ${o.begeni}</button>
        </form>
      </div>
      <div style="margin-top:8px;font-size:13px;color:#ccc;">${o.aciklama}</div>
      <form method="POST" action="/oneri-ekle-film/${o.id}" style="margin-top:8px;">
        <button class="btn btn-green" style="font-size:12px;padding:6px;">➕ Listeye Ekle</button>
      </form>
    </div>`).join("");
  const icerik = `
    <div class="grid2">
      <div class="card">
        <h2>👥 Arkadaş Önerileri (${oneriler.length})</h2>
        ${oneriler.length > 0 ? oneriSatirlari : '<div class="bos">Henüz öneri yok!</div>'}
      </div>
      <div class="card">
        <h2>➕ Öneri Gönder</h2>
        <form method="POST" action="/oneri-ekle">
          <label>Adın</label>
          <input type="text" name="gonderen" placeholder="Ahmet" required>
          <label>Film/Dizi Adı</label>
          <input type="text" name="baslik" placeholder="The Godfather" required>
          <label>Neden öneriyor sun?</label>
          <textarea name="aciklama" placeholder="Açıklama..." rows="3" style="resize:none;" required></textarea>
          <button class="btn btn-purple">📤 Öneri Gönder</button>
        </form>
      </div>
    </div>`;
  res.send(HTML(icerik, "oneriler"));
});

app.post("/oneri-ekle", (req: express.Request, res: express.Response) => {
  const { gonderen, baslik, aciklama } = req.body;
  oneriler.push({
    id: ++sonOneriId, gonderen, baslik, aciklama,
    zaman: new Date().toLocaleString("tr-TR"),
    begeni: 0
  });
  res.redirect("/oneriler");
});

app.post("/begeni/:id", (req: express.Request, res: express.Response) => {
  const id = parseInt((req.params as any).id);
  const oneri = oneriler.find(o => o.id === id);
  if (oneri) oneri.begeni++;
  res.redirect("/oneriler");
});

app.post("/oneri-ekle-film/:id", (req: express.Request, res: express.Response) => {
  const id = parseInt((req.params as any).id);
  const oneri = oneriler.find(o => o.id === id);
  if (oneri) {
    filmler.push({
      id: ++sonId, baslik: oneri.baslik, tur: "Dram",
      yil: 2024, puan: 0, durum: "izlenecek",
      notlar: `${oneri.gonderen} önerdi`, afis: "🎬"
    });
  }
  res.redirect("/");
});

// İstatistik
app.get("/istatistik", (req: express.Request, res: express.Response) => {
  const puanlilar = filmler.filter(f => f.puan > 0);
  const ortalama = puanlilar.length > 0
    ? (puanlilar.reduce((s, f) => s + f.puan, 0) / puanlilar.length).toFixed(1) : "0";
  const enIyi = [...puanlilar].sort((a, b) => b.puan - a.puan)[0];
  const turler: { [key: string]: number } = {};
  filmler.forEach(f => turler[f.tur] = (turler[f.tur] || 0) + 1);
  const maxTur = Math.max(...Object.values(turler), 1);
  const turSatirlar = Object.entries(turler)
    .sort((a, b) => b[1] - a[1])
    .map(([tur, sayi]) => `
      <div class="tur-item"><span>${tur}</span><span style="color:#e040fb;font-weight:bold;">${sayi}</span></div>
      <div class="tur-bar" style="width:${(sayi / maxTur * 100)}%"></div>
    `).join("");
  const icerik = `
    <div class="grid3">
      <div class="ozet"><div class="sayi">${ortalama}</div><div class="label">Ortalama Puan</div></div>
      <div class="ozet"><div class="sayi" style="color:#ffd700;font-size:16px;">${enIyi ? enIyi.baslik : "-"}</div><div class="label">En İyi (${enIyi ? enIyi.puan + "/10" : ""})</div></div>
      <div class="ozet"><div class="sayi">${Object.keys(turler).length}</div><div class="label">Farklı Tür</div></div>
    </div>
    <div class="card"><h2>🎭 Tür Analizi</h2>${turSatirlar}</div>`;
  res.send(HTML(icerik, "istatistik"));
});

app.listen(3000, () => {
  console.log("🎬 Film Takip: http://localhost:3000");
});