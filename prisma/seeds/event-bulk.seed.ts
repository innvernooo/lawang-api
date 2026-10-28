import slugify from 'slugify';
import { prisma } from '../../src/configs/prisma-client.config';
import { EventCategory } from '../../src/generated/prisma/client';

// Seed tambahan: 39 event untuk 5 organizer seed (melengkapi event.seed.ts
// sehingga total event menjadi 50). Aman dijalankan ulang: slug yang sudah
// ada dilewati.

type Row = {
  org: string;
  name: string;
  category: EventCategory;
  city: string;
  venue: string;
  img: string;
  price: number; // 0 = FREE
  date: string; // YYYY-MM-DD
  time: string; // HH:mm (waktu lokal kota)
  hours: number;
  seats: number;
};

const unsplash = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=1200&q=80`;

const IMG = {
  saxophone: '1415201364774-f6f0bb35f28f',
  singer: '1493225457124-a3eb161ffa5f',
  concert: '1516450360452-9312f5e86fc7',
  microphone: '1511671782779-c97d3d27a1d4',
  festival: '1506157786151-b8491531f063',
  drums: '1514320291840-2e0a9bf2a9ae',
  crowdHearts: '1429962714451-bb934ecdc4ec',
  crowd: '1524368535928-5b5e00ddc76b',
  mural: '1547891654-e66ed7ebb968',
  theater: '1503095396549-807759245b35',
  paint: '1513364776144-60967b0f800f',
  landscape: '1578301978693-85fa9c0320b9',
  brushes: '1460661419201-fd4cecdf8a8b',
  gallery: '1531243269054-5ebf6f34081e',
  stage: '1585699324551-f6c309eedeca',
  audience: '1515187029135-18ee286d815b',
  laptopClass: '1517245386807-bb43f82c33c4',
  classroom: '1524178232363-1fb2b075b655',
  teamwork: '1552664730-d307ca884978',
  conference: '1540575467063-178a50c2df87',
  talk: '1556761175-5973dc0f32e7',
  hall: '1531058020387-3be344556be6',
  micDark: '1516280440614-37939bbacd81',
  laugh: '1527224857830-43a7acc85260',
  marathon: '1452626038306-9aae5e071dd3',
  basketball: '1546519638-68e109498ffc',
  soccer: '1574629810360-7efbbe195018',
  swimming: '1530549387789-4c1017266635',
  cycling: '1517649763962-0c623066013b',
  retroGames: '1550745165-9bc0b252726f',
  controller: '1612287230202-1ff1d85d1bdf',
};

const rows: Row[] = [
  // --- nadasenja (musik) ---
  { org: 'nadasenja', name: 'Jazz Senja di Kota Tua', category: 'MUSIC', city: 'Jakarta Barat', venue: 'Plaza Museum Fatahillah', img: IMG.saxophone, price: 125000, date: '2026-11-14', time: '18:30', hours: 4, seats: 400 },
  { org: 'nadasenja', name: 'Konser Akustik Bogor Hujan', category: 'MUSIC', city: 'Bogor', venue: 'Amfiteater Kebun Raya Bogor', img: IMG.singer, price: 0, date: '2026-11-22', time: '16:00', hours: 3, seats: 250 },
  { org: 'nadasenja', name: 'Indie Night Bekasi', category: 'MUSIC', city: 'Bekasi', venue: 'Summarecon Mall Bekasi Hall', img: IMG.concert, price: 90000, date: '2026-12-04', time: '19:00', hours: 4, seats: 350 },
  { org: 'nadasenja', name: 'Malam Puisi dan Musik Depok', category: 'MUSIC', city: 'Depok', venue: 'Taman Lembah Gurame', img: IMG.microphone, price: 0, date: '2026-12-18', time: '19:30', hours: 3, seats: 150 },
  { org: 'nadasenja', name: 'Festival Malam Tahun Baru Ancol', category: 'MUSIC', city: 'Jakarta Utara', venue: 'Pantai Ancol', img: IMG.festival, price: 275000, date: '2026-12-31', time: '17:00', hours: 7, seats: 3000 },
  { org: 'nadasenja', name: 'Drum Clinic dan Jam Session', category: 'MUSIC', city: 'Tangerang Selatan', venue: 'BSD Music Studio', img: IMG.drums, price: 150000, date: '2027-02-06', time: '13:00', hours: 4, seats: 60 },
  { org: 'nadasenja', name: 'Senja Pop Medan', category: 'MUSIC', city: 'Medan', venue: 'Lapangan Merdeka Medan', img: IMG.crowdHearts, price: 110000, date: '2027-03-13', time: '17:00', hours: 5, seats: 1500 },
  { org: 'nadasenja', name: 'Gema Nusantara Makassar', category: 'MUSIC', city: 'Makassar', venue: 'Panggung Pantai Losari', img: IMG.crowd, price: 0, date: '2027-04-24', time: '18:00', hours: 4, seats: 2000 },

  // --- kreasipanggung (seni) ---
  { org: 'kreasipanggung', name: 'Pameran Mural Kota Cimahi', category: 'ARTS', city: 'Cimahi', venue: 'Taman Kartini Cimahi', img: IMG.mural, price: 0, date: '2026-11-08', time: '10:00', hours: 8, seats: 400 },
  { org: 'kreasipanggung', name: 'Teater Rakyat: Si Kabayan', category: 'ARTS', city: 'Bandung', venue: 'Gedung Kesenian Rumentang Siang', img: IMG.theater, price: 85000, date: '2026-12-12', time: '19:00', hours: 2.5, seats: 300 },
  { org: 'kreasipanggung', name: 'Kelas Melukis Cat Air Akhir Pekan', category: 'ARTS', city: 'Bandung', venue: 'Selasar Sunaryo Art Space', img: IMG.paint, price: 175000, date: '2027-01-16', time: '09:00', hours: 4, seats: 30 },
  { org: 'kreasipanggung', name: 'Pameran Lukisan Lanskap Nusantara', category: 'ARTS', city: 'Yogyakarta', venue: 'Jogja National Museum', img: IMG.landscape, price: 30000, date: '2027-01-23', time: '10:00', hours: 9, seats: 600 },
  { org: 'kreasipanggung', name: 'Festival Seni Rupa Cirebon', category: 'ARTS', city: 'Cirebon', venue: 'Alun-Alun Keraton Kasepuhan', img: IMG.brushes, price: 0, date: '2027-02-20', time: '09:00', hours: 9, seats: 800 },
  { org: 'kreasipanggung', name: 'Galeri Malam Kota Lama Semarang', category: 'ARTS', city: 'Semarang', venue: 'Kawasan Kota Lama Semarang', img: IMG.gallery, price: 0, date: '2027-03-06', time: '18:00', hours: 4, seats: 300 },
  { org: 'kreasipanggung', name: 'Panggung Teater Remaja Bandung', category: 'ARTS', city: 'Bandung', venue: 'Taman Budaya Jawa Barat', img: IMG.stage, price: 50000, date: '2027-04-10', time: '19:00', hours: 2, seats: 250 },
  { org: 'kreasipanggung', name: 'Pentas Tari Kontemporer Surakarta', category: 'ARTS', city: 'Surakarta', venue: 'Taman Budaya Jawa Tengah', img: IMG.audience, price: 60000, date: '2027-05-15', time: '19:30', hours: 2, seats: 200 },

  // --- ruanggerak (workshop) ---
  { org: 'ruanggerak', name: 'Workshop Fotografi Ponsel', category: 'WORKSHOP', city: 'Yogyakarta', venue: 'Ruang Gerak Studio, Prawirotaman', img: IMG.laptopClass, price: 150000, date: '2026-11-21', time: '09:00', hours: 4, seats: 35 },
  { org: 'ruanggerak', name: 'Kelas Desain Grafis Dasar', category: 'WORKSHOP', city: 'Yogyakarta', venue: 'Ruang Gerak Studio, Prawirotaman', img: IMG.classroom, price: 0, date: '2026-11-29', time: '13:00', hours: 3, seats: 40 },
  { org: 'ruanggerak', name: 'Bootcamp Startup Akhir Pekan', category: 'WORKSHOP', city: 'Surabaya', venue: 'Koridor Coworking Space', img: IMG.teamwork, price: 350000, date: '2026-12-05', time: '09:00', hours: 9, seats: 80 },
  { org: 'ruanggerak', name: 'Seminar Literasi Keuangan Anak Muda', category: 'WORKSHOP', city: 'Semarang', venue: 'Ballroom Hotel Gumaya', img: IMG.conference, price: 0, date: '2026-12-13', time: '09:00', hours: 4, seats: 300 },
  { org: 'ruanggerak', name: 'Workshop Menulis Kreatif', category: 'WORKSHOP', city: 'Malang', venue: 'Perpustakaan Kota Malang', img: IMG.talk, price: 75000, date: '2027-01-09', time: '13:00', hours: 3, seats: 50 },
  { org: 'ruanggerak', name: 'Kelas Public Speaking Lanjutan', category: 'WORKSHOP', city: 'Yogyakarta', venue: 'Ruang Gerak Studio, Prawirotaman', img: IMG.hall, price: 120000, date: '2027-02-13', time: '13:00', hours: 3, seats: 50 },
  { org: 'ruanggerak', name: 'Workshop UI/UX untuk Pemula', category: 'WORKSHOP', city: 'Bandung', venue: 'Bandung Digital Valley', img: IMG.teamwork, price: 200000, date: '2027-03-20', time: '09:00', hours: 6, seats: 60 },
  { org: 'ruanggerak', name: 'Diskusi Komunitas Kreatif Kupang', category: 'WORKSHOP', city: 'Kupang', venue: 'Taman Nostalgia Kupang', img: IMG.audience, price: 0, date: '2027-05-08', time: '15:00', hours: 3, seats: 120 },

  // --- lenterakreatif (komedi) ---
  { org: 'lenterakreatif', name: 'Stand-Up Surabaya Gelak Tawa', category: 'COMEDY', city: 'Surabaya', venue: 'Lentera Hall, Tunjungan', img: IMG.micDark, price: 75000, date: '2026-11-20', time: '20:00', hours: 2.5, seats: 200 },
  { org: 'lenterakreatif', name: 'Open Mic Kampus Malang', category: 'COMEDY', city: 'Malang', venue: 'Aula Universitas Brawijaya', img: IMG.laugh, price: 0, date: '2026-12-10', time: '19:00', hours: 3, seats: 300 },
  { org: 'lenterakreatif', name: 'Komedi Tunggal Spesial Akhir Tahun', category: 'COMEDY', city: 'Jakarta Selatan', venue: 'Kota Kasablanka Hall', img: IMG.stage, price: 180000, date: '2026-12-27', time: '19:30', hours: 3, seats: 800 },
  { org: 'lenterakreatif', name: 'Lentera Open Mic Vol. 8', category: 'COMEDY', city: 'Surabaya', venue: 'Lentera Hall, Tunjungan', img: IMG.micDark, price: 0, date: '2027-01-02', time: '20:00', hours: 2.5, seats: 100 },
  { org: 'lenterakreatif', name: 'Malam Komedi Mojokerto', category: 'COMEDY', city: 'Mojokerto', venue: 'Gedung Seni Majapahit', img: IMG.microphone, price: 50000, date: '2027-01-30', time: '19:30', hours: 2.5, seats: 250 },
  { org: 'lenterakreatif', name: 'Roasting Battle Surabaya', category: 'COMEDY', city: 'Surabaya', venue: 'Lentera Hall, Tunjungan', img: IMG.laugh, price: 85000, date: '2027-02-27', time: '20:00', hours: 3, seats: 200 },
  { org: 'lenterakreatif', name: 'Komedi Keliling Balikpapan', category: 'COMEDY', city: 'Balikpapan', venue: 'Dome Balikpapan', img: IMG.stage, price: 0, date: '2027-03-27', time: '19:00', hours: 3, seats: 1000 },
  { org: 'lenterakreatif', name: 'Musik dan Komedi Alun-Alun Pasuruan', category: 'COMEDY', city: 'Pasuruan', venue: 'Alun-Alun Pasuruan', img: IMG.crowd, price: 0, date: '2027-04-17', time: '19:00', hours: 3, seats: 1500 },

  // --- soraksorai (olahraga & games) ---
  { org: 'soraksorai', name: 'Turnamen Basket 3x3 Bali', category: 'SPORTS', city: 'Denpasar', venue: 'GOR Lila Bhuana', img: IMG.basketball, price: 0, date: '2026-11-28', time: '08:00', hours: 10, seats: 500 },
  { org: 'soraksorai', name: 'Liga Futsal Antar Kampus', category: 'SPORTS', city: 'Makassar', venue: 'GOR Sudiang', img: IMG.soccer, price: 35000, date: '2027-01-17', time: '09:00', hours: 9, seats: 800 },
  { org: 'soraksorai', name: 'Denpasar Half Marathon 2027', category: 'SPORTS', city: 'Denpasar', venue: 'Lapangan Puputan Badung', img: IMG.marathon, price: 250000, date: '2027-02-14', time: '05:00', hours: 5, seats: 2000 },
  { org: 'soraksorai', name: 'Retro Gaming Expo Surabaya', category: 'GAMES', city: 'Surabaya', venue: 'Grand City Convex', img: IMG.retroGames, price: 60000, date: '2027-02-28', time: '10:00', hours: 9, seats: 1500 },
  { org: 'soraksorai', name: 'Kejuaraan Renang Terbuka Mataram', category: 'SPORTS', city: 'Mataram', venue: 'Kolam Renang GOR Turide', img: IMG.swimming, price: 0, date: '2027-03-07', time: '07:00', hours: 8, seats: 400 },
  { org: 'soraksorai', name: 'Bali Cycling Challenge', category: 'SPORTS', city: 'Denpasar', venue: 'Lapangan Renon', img: IMG.cycling, price: 300000, date: '2027-04-04', time: '05:30', hours: 6, seats: 600 },
  { org: 'soraksorai', name: 'Mobile Gaming Cup Jakarta', category: 'GAMES', city: 'Jakarta Pusat', venue: 'JIExpo Kemayoran Hall', img: IMG.controller, price: 75000, date: '2027-05-22', time: '10:00', hours: 10, seats: 2500 },
];

const WITA = ['Denpasar', 'Mataram', 'Kupang', 'Makassar', 'Balikpapan'];

const ticketNames: Record<EventCategory, [string, string]> = {
  MUSIC: ['Regular', 'VIP'],
  ARTS: ['Regular', 'Premium'],
  WORKSHOP: ['Early Bird', 'Regular'],
  COMEDY: ['Regular', 'Front Row'],
  SPORTS: ['Regular', 'VIP'],
  GAMES: ['Day Pass', 'VIP Pass'],
};

const descriptions: Record<EventCategory, (r: Row) => string> = {
  MUSIC: (r) =>
    `${r.name} menghadirkan penampilan musisi pilihan di ${r.venue}, ${r.city}. Datang lebih awal, nikmati suasananya, dan bernyanyi bersama.`,
  ARTS: (r) =>
    `${r.name} mengajak kamu menikmati karya seniman lokal di ${r.venue}, ${r.city}. Cocok untuk pencinta seni maupun yang baru ingin mengenal.`,
  WORKSHOP: (r) =>
    `${r.name} di ${r.venue}, ${r.city}. Materi praktis dibawakan fasilitator berpengalaman, tempat terbatas.`,
  COMEDY: (r) =>
    `${r.name} di ${r.venue}, ${r.city}. Malam penuh tawa bersama komika pilihan, siapkan perut kamu.`,
  SPORTS: (r) =>
    `${r.name} di ${r.venue}, ${r.city}. Terbuka untuk peserta dan penonton, ayo dukung semangat olahraga.`,
  GAMES: (r) =>
    `${r.name} di ${r.venue}, ${r.city}. Turnamen, area main bebas, dan booth komunitas gamer dalam satu acara.`,
};

const round5k = (n: number) => Math.round(n / 5000) * 5000;

async function main() {
  const organizers = await prisma.organizer.findMany({
    where: { username: { in: [...new Set(rows.map((r) => r.org))] } },
    select: { id: true, username: true },
  });

  let created = 0;

  for (const r of rows) {
    const organizer = organizers.find((o) => o.username === r.org);
    if (!organizer) {
      console.log(`✘ organizer ${r.org} tidak ditemukan, dilewati`);
      continue;
    }

    const slug = slugify(r.name, { lower: true, strict: true });
    if (await prisma.event.findUnique({ where: { slug } })) {
      console.log(`- ${slug} sudah ada, dilewati`);
      continue;
    }

    const offset = WITA.includes(r.city) ? '+08:00' : '+07:00';
    const startDate = new Date(`${r.date}T${r.time}:00${offset}`);
    const endDate = new Date(startDate.getTime() + r.hours * 60 * 60 * 1000);
    const endSale = new Date(startDate.getTime() - 24 * 60 * 60 * 1000);
    const paid = r.price > 0;

    const [firstName, secondName] = ticketNames[r.category];
    const firstQuota = Math.round(r.seats * 0.8);
    const secondPrice = round5k(r.price * (r.category === 'WORKSHOP' ? 1.3 : 1.8));

    const tickets = paid
      ? [
          { name: firstName, price: r.price, quota: firstQuota, available: firstQuota, endSale },
          { name: secondName, price: secondPrice, quota: r.seats - firstQuota, available: r.seats - firstQuota, endSale },
        ]
      : [{ name: 'Free Ticket', price: 0, quota: r.seats, available: r.seats, endSale: null }];

    const discount = Math.max(5000, round5k(r.price * 0.15));
    const voucherCode = `${slug.split('-').slice(0, 2).join('-').toUpperCase()}-${discount / 1000}K`;

    await prisma.event.create({
      data: {
        organizerId: organizer.id,
        name: r.name,
        slug,
        description: descriptions[r.category](r),
        category: r.category,
        city: r.city,
        venue: r.venue,
        imageUrl: unsplash(r.img),
        pricingType: paid ? 'PAID' : 'FREE',
        startDate,
        endDate,
        totalSeats: r.seats,
        availableSeats: r.seats,
        ticketTypes: { create: tickets },
        ...(paid && {
          vouchers: {
            create: {
              code: voucherCode,
              discountAmount: discount,
              quota: Math.min(100, Math.max(10, Math.round(r.seats * 0.1))),
              startDate: new Date(),
              endDate: endSale,
            },
          },
        }),
      },
    });

    created++;
    console.log(`✔ ${slug} [${paid ? 'PAID' : 'FREE'}]${paid ? ` voucher ${voucherCode}` : ''}`);
  }

  console.log(`\n${created} event baru, total event sekarang: ${await prisma.event.count()}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
