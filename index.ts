export {};
interface Film {
  id: number;
  baslik: string;
  tur: string;
  yil: number;
  puan: number;
  durum: "izlendi" | "izlenecek" | "izleniyor";
  notlar: string;
}

class FilmTakip {
  private filmler: Film[] = [];
  private sonId: number = 0;

  filmEkle(baslik: string, tur: string, yil: number, durum: Film["durum"] = "izlenecek"): Film {
    const film: Film = {
      id: ++this.sonId,
      baslik,
      tur,
      yil,
      puan: 0,
      durum,
      notlar: ""
    };
    this.filmler.push(film);
    console.log(`✅ Eklendi: ${baslik} (${yil})`);
    return film;
  }

  puanVer(id: number, puan: number): void {
    const film = this.filmler.find(f => f.id === id);
    if (!film) { console.log("❌ Film bulunamadı!"); return; }
    if (puan < 1 || puan > 10) { console.log("❌ Puan 1-10 arasında olmalı!"); return; }
    film.puan = puan;
    film.durum = "izlendi";
    console.log(`⭐ ${film.baslik} → ${puan}/10`);
  }

  listele(filtre?: Film["durum"]): void {
    const liste = filtre ? this.filmler.filter(f => f.durum === filtre) : this.filmler;
    if (liste.length === 0) { console.log("📭 Liste boş!"); return; }
    console.log(`\n${"=".repeat(60)}`);
    console.log(filtre ? `📋 ${filtre.toUpperCase()} FİLMLER` : "📋 TÜM FİLMLER");
    console.log("=".repeat(60));
    liste.forEach(f => {
      const puan = f.puan > 0 ? `⭐ ${f.puan}/10` : "⭐ -";
      const durum = f.durum === "izlendi" ? "✅" : f.durum === "izleniyor" ? "▶️" : "📌";
      console.log(`${durum} [${f.id}] ${f.baslik} (${f.yil}) | ${f.tur} | ${puan}`);
    });
    console.log("=".repeat(60));
  }

  istatistik(): void {
    const toplam = this.filmler.length;
    const izlendi = this.filmler.filter(f => f.durum === "izlendi").length;
    const izlenecek = this.filmler.filter(f => f.durum === "izlenecek").length;
    const puanlilar = this.filmler.filter(f => f.puan > 0);
    const ortalama = puanlilar.length > 0
      ? puanlilar.reduce((s, f) => s + f.puan, 0) / puanlilar.length
      : 0;

    console.log(`\n📊 İSTATİSTİKLER`);
    console.log(`Toplam: ${toplam} | İzlendi: ${izlendi} | İzlenecek: ${izlenecek}`);
    console.log(`Ortalama Puan: ${ortalama.toFixed(1)}/10`);

    if (puanlilar.length > 0) {
      const enIyi = puanlilar.reduce((a, b) => a.puan > b.puan ? a : b);
      console.log(`En İyi Film: ${enIyi.baslik} (${enIyi.puan}/10)`);
    }
  }

  turAnaliz(): void {
    const turler: { [key: string]: number } = {};
    this.filmler.forEach(f => {
      turler[f.tur] = (turler[f.tur] || 0) + 1;
    });
    console.log(`\n🎭 TÜR ANALİZİ`);
    Object.entries(turler)
      .sort((a, b) => b[1] - a[1])
      .forEach(([tur, sayi]) => console.log(`  ${tur}: ${sayi} film`));
  }
}

// Test
const takip = new FilmTakip();

takip.filmEkle("Interstellar", "Bilim Kurgu", 2014, "izlendi");
takip.filmEkle("The Dark Knight", "Aksiyon", 2008, "izlendi");
takip.filmEkle("Inception", "Bilim Kurgu", 2010, "izlendi");
takip.filmEkle("Parasite", "Dram", 2019, "izlendi");
takip.filmEkle("Dune", "Bilim Kurgu", 2021, "izlenecek");
takip.filmEkle("Oppenheimer", "Dram", 2023, "izlenecek");
takip.filmEkle("Breaking Bad", "Dram", 2008, "izleniyor");

takip.puanVer(1, 10);
takip.puanVer(2, 10);
takip.puanVer(3, 9);
takip.puanVer(4, 9);

takip.listele();
takip.listele("izlenecek");
takip.istatistik();
takip.turAnaliz();
