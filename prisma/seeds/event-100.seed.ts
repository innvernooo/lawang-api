import slugify from 'slugify';
import { prisma } from '../../src/configs/prisma-client.config';
import { EventCategory } from '../../src/generated/prisma/client';

// Seed 100 event untuk 5 organizer seed, tersebar di 15 kategori EventCategory.
// price 0 = FREE (dapat satu "Free Ticket", sama seperti EventService.create),
// price > 0 = PAID (dapat 2-3 tipe tiket). Aman dijalankan ulang: slug yang
// sudah ada dilewati.

type Row = [name: string, city: string, venue: string, price: number, seats: number];

const ORGANIZERS = ['nadasenja', 'kreasipanggung', 'ruanggerak', 'lenterakreatif', 'soraksorai'];

const WITA = ['Denpasar', 'Mataram', 'Makassar', 'Balikpapan', 'Manado', 'Kupang', 'Samarinda', 'Banjarmasin'];

const unsplash = (id: string) => `https://images.unsplash.com/photo-${id}?w=1200&q=80`;

const CATEGORIES: Record<
  EventCategory,
  { time: string; hours: number; tickets: [string, string, string]; mult: [number, number]; images: string[]; desc: (r: Row) => string; rows: Row[] }
> = {
  MUSIK: {
    time: '19:00', hours: 4, tickets: ['Regular', 'VIP', 'VVIP'], mult: [1.8, 2.8],
    images: ['1501281668745-f7f57925c3b4', '1415201364774-f6f0bb35f28f', '1493225457124-a3eb161ffa5f', '1516450360452-9312f5e86fc7', '1506157786151-b8491531f063', '1459749411175-04bf5292ceea', '1514320291840-2e0a9bf2a9ae'],
    desc: ([n, c, v]) => `${n} menghadirkan penampilan musisi pilihan di ${v}, ${c}. Datang lebih awal dan nikmati suasananya.`,
    rows: [
      ['Senja Akustik Fest', 'Jakarta Selatan', 'Lapangan Blok M Square', 150000, 500],
      ['Jazz Malam Kota Tua', 'Jakarta Barat', 'Plaza Museum Fatahillah', 125000, 400],
      ['Konser Akustik Bogor Hujan', 'Bogor', 'Amfiteater Kebun Raya Bogor', 0, 250],
      ['Indie Night Bekasi', 'Bekasi', 'Summarecon Mall Bekasi Hall', 90000, 350],
      ['Pesta Musik Pantai Losari', 'Makassar', 'Anjungan Pantai Losari', 0, 2000],
      ['Festival Musik Tepi Danau Batam', 'Batam', 'Ocarina Park Batam', 175000, 1500],
      ['Orkestra Simfoni Surabaya', 'Surabaya', 'Gedung Cak Durasim', 200000, 600],
    ],
  },
  WORKSHOP: {
    time: '09:00', hours: 4, tickets: ['Early Bird', 'Regular', 'Premium'], mult: [1.3, 1.8],
    images: ['1531058020387-3be344556be6', '1552664730-d307ca884978', '1524178232363-1fb2b075b655', '1517245386807-bb43f82c33c4', '1556761175-5973dc0f32e7'],
    desc: ([n, c, v]) => `${n} di ${v}, ${c}. Materi praktis dibawakan fasilitator berpengalaman, tempat terbatas.`,
    rows: [
      ['Workshop Sablon Kaos untuk Pemula', 'Yogyakarta', 'Ruang Gerak Studio, Prawirotaman', 0, 40],
      ['Workshop Fotografi Ponsel', 'Yogyakarta', 'Ruang Gerak Studio, Prawirotaman', 150000, 35],
      ['Bootcamp Startup Akhir Pekan', 'Surabaya', 'Koridor Coworking Space', 350000, 80],
      ['Workshop UI/UX untuk Pemula', 'Bandung', 'Bandung Digital Valley', 200000, 60],
      ['Kelas Menulis Kreatif', 'Malang', 'Perpustakaan Kota Malang', 75000, 50],
      ['Workshop Kerajinan Rotan', 'Banjarmasin', 'Rumah Kreatif Banjarmasin', 0, 30],
      ['Kelas Barista Rumahan', 'Medan', 'Kopi Kawan Studio', 125000, 25],
    ],
  },
  KOMEDI: {
    time: '20:00', hours: 2.5, tickets: ['Regular', 'Front Row', 'VIP'], mult: [1.8, 2.8],
    images: ['1527224857830-43a7acc85260', '1585699324551-f6c309eedeca', '1516280440614-37939bbacd81'],
    desc: ([n, c, v]) => `${n} di ${v}, ${c}. Malam penuh tawa bersama komika pilihan, siapkan perut kamu.`,
    rows: [
      ['Lentera Open Mic Vol. 9', 'Surabaya', 'Lentera Hall, Tunjungan', 0, 100],
      ['Stand-Up Gelak Tawa Malang', 'Malang', 'Gedung Kesenian Gajayana', 75000, 250],
      ['Komedi Tunggal Spesial', 'Jakarta Selatan', 'Kota Kasablanka Hall', 180000, 800],
      ['Roasting Battle Semarang', 'Semarang', 'Gedung Oudetrap Kota Lama', 85000, 200],
      ['Komedi Keliling Balikpapan', 'Balikpapan', 'Dome Balikpapan', 0, 1000],
      ['Malam Komedi Palembang', 'Palembang', 'Palembang Indah Mall Hall', 60000, 300],
      ['Open Mic Kampus Depok', 'Depok', 'Aula Universitas Indonesia', 0, 300],
    ],
  },
  OLAHRAGA: {
    time: '06:00', hours: 5, tickets: ['Regular', 'VIP', 'VVIP'], mult: [1.8, 2.8],
    images: ['1452626038306-9aae5e071dd3', '1546519638-68e109498ffc', '1574629810360-7efbbe195018', '1530549387789-4c1017266635', '1517649763962-0c623066013b', '1461896836934-ffe607ba8211', '1517836357463-d25dfeac3438'],
    desc: ([n, c, v]) => `${n} di ${v}, ${c}. Terbuka untuk peserta dan penonton, ayo dukung semangat olahraga.`,
    rows: [
      ['Denpasar Half Marathon', 'Denpasar', 'Lapangan Puputan Badung', 250000, 2000],
      ['Turnamen Basket 3x3 Bali', 'Denpasar', 'GOR Lila Bhuana', 0, 500],
      ['Liga Futsal Antar Kampus', 'Makassar', 'GOR Sudiang', 35000, 800],
      ['Kejuaraan Renang Terbuka Mataram', 'Mataram', 'Kolam Renang GOR Turide', 0, 400],
      ['Bandung Cycling Challenge', 'Bandung', 'Lapangan Gasibu', 300000, 600],
      ['Fun Run 10K Jakarta', 'Jakarta Pusat', 'Kawasan GBK Senayan', 175000, 3000],
      ['Kompetisi Angkat Beban Terbuka', 'Surakarta', 'GOR Manahan', 50000, 300],
    ],
  },
  SENI: {
    time: '10:00', hours: 6, tickets: ['Regular', 'Premium', 'VIP'], mult: [1.8, 2.8],
    images: ['1503095396549-807759245b35', '1531243269054-5ebf6f34081e', '1547891654-e66ed7ebb968', '1513364776144-60967b0f800f', '1578301978693-85fa9c0320b9', '1460661419201-fd4cecdf8a8b'],
    desc: ([n, c, v]) => `${n} mengajak kamu menikmati karya seniman lokal di ${v}, ${c}.`,
    rows: [
      ['Teater Malam Braga: Kisah Sangkuriang', 'Bandung', 'Gedung Kesenian Rumentang Siang', 75000, 300],
      ['Pameran Lukis Jalanan Braga', 'Bandung', 'Jalan Braga', 0, 500],
      ['Pameran Mural Kota Cimahi', 'Cimahi', 'Taman Kartini Cimahi', 0, 400],
      ['Kelas Melukis Cat Air Akhir Pekan', 'Bandung', 'Selasar Sunaryo Art Space', 175000, 30],
      ['Pameran Lukisan Lanskap Nusantara', 'Yogyakarta', 'Jogja National Museum', 30000, 600],
      ['Pentas Tari Kontemporer Surakarta', 'Surakarta', 'Taman Budaya Jawa Tengah', 60000, 200],
      ['Galeri Malam Kota Lama Semarang', 'Semarang', 'Kawasan Kota Lama Semarang', 0, 300],
    ],
  },
  GAMES: {
    time: '10:00', hours: 9, tickets: ['Day Pass', 'VIP Pass', 'VVIP Pass'], mult: [1.8, 2.8],
    images: ['1542751371-adc38448a05e', '1550745165-9bc0b252726f', '1612287230202-1ff1d85d1bdf', '1538481199705-c710c4e965fc'],
    desc: ([n, c, v]) => `${n} di ${v}, ${c}. Turnamen, area main bebas, dan booth komunitas gamer dalam satu acara.`,
    rows: [
      ['Bali E-Sports Championship', 'Denpasar', 'GOR Lila Bhuana', 100000, 1000],
      ['Retro Gaming Expo Surabaya', 'Surabaya', 'Grand City Convex', 60000, 1500],
      ['Mobile Gaming Cup Jakarta', 'Jakarta Pusat', 'JIExpo Kemayoran Hall', 75000, 2500],
      ['Turnamen PC Gaming Pontianak', 'Pontianak', 'Aula Universitas Tanjungpura', 0, 150],
      ['Malam Main Game Konsol Yogyakarta', 'Yogyakarta', 'Jogja City Mall Hall', 0, 80],
      ['LAN Party Bandung', 'Bandung', 'Bandung Creative Hub', 50000, 200],
      ['Kompetisi Speedrun Medan', 'Medan', 'Centre Point Mall Hall', 0, 300],
    ],
  },
  SPIRITUALITAS: {
    time: '06:30', hours: 4, tickets: ['Regular', 'Premium', 'VIP'], mult: [1.5, 2.2],
    images: ['1506126613408-eca07ce68773', '1545389336-cf090694435e', '1528715471579-d1bcf0ba5e83'],
    desc: ([n, c, v]) => `${n} di ${v}, ${c}. Ruang tenang untuk mengistirahatkan pikiran dan kembali terhubung dengan diri sendiri.`,
    rows: [
      ['Retret Meditasi Akhir Pekan', 'Bogor', 'Puncak Retreat Center', 450000, 40],
      ['Meditasi Pagi di Pantai Sanur', 'Denpasar', 'Pantai Sanur', 0, 100],
      ['Kelas Mindfulness untuk Pekerja', 'Jakarta Selatan', 'Ruang Hening, Kemang', 150000, 30],
      ['Yoga Matahari Terbit Batu', 'Batu', 'Paralayang Gunung Banyak', 0, 80],
      ['Sharing Spiritual Komunitas Muda', 'Semarang', 'Taman Indonesia Kaya', 0, 200],
      ['Retret Hening Lereng Merapi', 'Magelang', 'Omah Hening Ketep', 600000, 25],
    ],
  },
  K_POP: {
    time: '13:00', hours: 6, tickets: ['Regular', 'VIP', 'VVIP'], mult: [1.8, 2.8],
    images: ['1429962714451-bb934ecdc4ec', '1524368535928-5b5e00ddc76b', '1540039155733-5bb30b53aa14', '1492684223066-81342ee5ff30', '1528489496900-d841974f5290', '1514533212735-5df27d970db0', '1563841930606-67e2bce48b78'],
    desc: ([n, c, v]) => `${n} di ${v}, ${c}. Kumpul bareng sesama K-Popers, bawa lightstick dan semangat kamu.`,
    rows: [
      ['K-Pop Random Dance Play Jakarta', 'Jakarta Selatan', 'Taman Literasi Martha Tiahahu', 0, 500],
      ['Kompetisi Dance Cover K-Pop Bandung', 'Bandung', 'Trans Studio Mall Atrium', 50000, 800],
      ['Festival Budaya Korea Surabaya', 'Surabaya', 'Tunjungan Plaza Convention Hall', 75000, 2000],
      ['Malam Karaoke K-Pop Yogyakarta', 'Yogyakarta', 'Jogja City Mall Hall', 35000, 300],
      ['Nobar Konser K-Pop Medan', 'Medan', 'Centre Point Mall Hall', 60000, 250],
      ['K-Pop Cupsleeve Event Makassar', 'Makassar', 'Mall Panakkukang Atrium', 0, 400],
      ['K-Pop Dance Workshop Tangerang', 'Tangerang Selatan', 'Studio Gerak BSD', 125000, 40],
    ],
  },
  KELUARGA: {
    time: '09:00', hours: 6, tickets: ['Anak', 'Dewasa', 'Paket Keluarga'], mult: [1.6, 3],
    images: ['1511895426328-dc8714191300', '1484665754804-74b091211472', '1502086223501-7ea6ecd79368'],
    desc: ([n, c, v]) => `${n} di ${v}, ${c}. Acara seru untuk seluruh anggota keluarga, dari si kecil sampai kakek nenek.`,
    rows: [
      ['Festival Keluarga Akhir Pekan', 'Jakarta Timur', 'Taman Mini Indonesia Indah', 0, 3000],
      ['Piknik Keluarga di Kebun Raya', 'Bogor', 'Kebun Raya Bogor', 25000, 1500],
      ['Pertunjukan Boneka untuk Anak', 'Bandung', 'Taman Budaya Jawa Barat', 50000, 250],
      ['Lomba Mewarnai Anak Se-Kota', 'Semarang', 'Mall Paragon Atrium', 0, 300],
      ['Hari Keluarga di Pantai Kuta', 'Denpasar', 'Pantai Kuta', 0, 1000],
      ['Karnaval Anak Surabaya', 'Surabaya', 'Taman Bungkul', 0, 2000],
      ['Family Movie Night Outdoor', 'Tangerang Selatan', 'Lapangan Terbuka Alam Sutera', 40000, 400],
    ],
  },
  ALAM_TERBUKA: {
    time: '07:00', hours: 8, tickets: ['Regular', 'Premium', 'VIP'], mult: [1.5, 2.2],
    images: ['1501555088652-021faa106b9b', '1464822759023-fed622ff2c3b', '1504280390367-361c6d9f38f4', '1478131143081-80f7f84ca84d'],
    desc: ([n, c, v]) => `${n} di ${v}, ${c}. Hirup udara segar, jelajahi alam, dan kenalan dengan teman baru.`,
    rows: [
      ['Hiking Santai Bukit Paralayang', 'Batu', 'Gunung Banyak', 75000, 80],
      ['Kemah Akhir Pekan Tepi Danau', 'Bandung', 'Bumi Perkemahan Ranca Upas', 250000, 100],
      ['Api Unggun dan Cerita Malam', 'Batu', 'Coban Rondo Camp Ground', 150000, 80],
      ['Jelajah Ngarai Sianok', 'Bukittinggi', 'Ngarai Sianok', 0, 120],
      ['Bersih Pantai Bersama', 'Makassar', 'Pantai Akkarena', 0, 300],
      ['Trekking Pantai Lasiana', 'Kupang', 'Pantai Lasiana', 0, 150],
      ['Glamping Lereng Merapi', 'Yogyakarta', 'Kaliurang Glamping Ground', 400000, 50],
    ],
  },
  SAINS: {
    time: '09:00', hours: 5, tickets: ['Regular', 'Premium', 'VIP'], mult: [1.6, 2.4],
    images: ['1532094349884-543bc11b234d', '1507413245164-6160d8298b31', '1446776811953-b23d57bd21aa', '1581093588401-fbb62a02f120'],
    desc: ([n, c, v]) => `${n} di ${v}, ${c}. Belajar sains dengan cara yang seru lewat demo, eksperimen, dan diskusi.`,
    rows: [
      ['Malam Observasi Bintang', 'Bandung', 'Observatorium Bosscha, Lembang', 75000, 150],
      ['Pameran Sains Interaktif Anak', 'Jakarta Timur', 'Pusat Peragaan IPTEK TMII', 30000, 500],
      ['Seminar Antariksa untuk Pelajar', 'Surabaya', 'Aula ITS Surabaya', 0, 400],
      ['Kelas Eksperimen Kimia Seru', 'Malang', 'Lab Terbuka Universitas Brawijaya', 100000, 30],
      ['Festival Sains dan Teknologi', 'Bandung', 'Sasana Budaya Ganesha', 0, 1500],
      ['Diskusi Robotika dan AI', 'Jakarta Selatan', 'Gedung Kuningan City', 150000, 200],
    ],
  },
  PENDIDIKAN: {
    time: '09:00', hours: 6, tickets: ['Regular', 'Premium', 'VIP'], mult: [1.5, 2.2],
    images: ['1503676260728-1c00da094a0b', '1497633762265-9d179a990aa6', '1540575467063-178a50c2df87', '1524178232363-1fb2b075b655'],
    desc: ([n, c, v]) => `${n} di ${v}, ${c}. Informasi dan bekal belajar untuk pelajar, mahasiswa, dan pendidik.`,
    rows: [
      ['Pameran Pendidikan Tinggi', 'Jakarta Pusat', 'Jakarta Convention Center', 0, 5000],
      ['Seminar Beasiswa Luar Negeri', 'Yogyakarta', 'Grha Sabha Pramana UGM', 0, 1000],
      ['Kelas Persiapan UTBK Intensif', 'Surabaya', 'Gedung Bimbel Cendekia', 250000, 100],
      ['Workshop Mengajar Kreatif untuk Guru', 'Semarang', 'Aula Universitas Negeri Semarang', 100000, 150],
      ['Festival Literasi Anak', 'Medan', 'Perpustakaan Provinsi Sumatera Utara', 0, 400],
      ['Seminar Literasi Keuangan Anak Muda', 'Palembang', 'Hotel Aryaduta Ballroom', 0, 300],
    ],
  },
  BUDAYA: {
    time: '16:00', hours: 4, tickets: ['Regular', 'Premium', 'VIP'], mult: [1.8, 2.8],
    images: ['1555400038-63f5ba517a47', '1537996194471-e657df975ab4', '1518548419970-58e3b4079ab2'],
    desc: ([n, c, v]) => `${n} di ${v}, ${c}. Rayakan kekayaan budaya Nusantara lewat pertunjukan, kuliner, dan kerajinan.`,
    rows: [
      ['Festival Seni Budaya Denpasar', 'Denpasar', 'Lapangan Niti Mandala Renon', 0, 3000],
      ['Pertunjukan Tari Kecak Senja', 'Denpasar', 'Taman Budaya Bali', 100000, 500],
      ['Gelar Budaya Lereng Merbabu', 'Magelang', 'Lapangan Ketep', 0, 1000],
      ['Pagelaran Wayang Kulit Semalam Suntuk', 'Surakarta', 'Pendapa Taman Budaya Jawa Tengah', 0, 600],
      ['Festival Kuliner Nusantara', 'Jakarta Barat', 'Plaza Museum Fatahillah', 25000, 2000],
      ['Pentas Tari Saman', 'Medan', 'Taman Budaya Sumatera Utara', 50000, 400],
      ['Festival Tenun Nusantara', 'Kupang', 'Taman Nostalgia Kupang', 0, 800],
    ],
  },
  KESEHATAN: {
    time: '07:00', hours: 3, tickets: ['Regular', 'Premium', 'VIP'], mult: [1.5, 2.2],
    images: ['1571019613454-1cb2f99b2d8b', '1576091160399-112ba8d25d1d', '1544367567-0f2fcb009e0b', '1490645935967-10de6ba17061'],
    desc: ([n, c, v]) => `${n} di ${v}, ${c}. Langkah kecil untuk hidup lebih sehat, bersama ahli dan komunitas.`,
    rows: [
      ['Senam Sehat Minggu Pagi', 'Jakarta Pusat', 'Lapangan Monas', 0, 2000],
      ['Seminar Kesehatan Mental Remaja', 'Bandung', 'Aula Universitas Padjadjaran', 0, 500],
      ['Kelas Yoga Pemula', 'Denpasar', 'Studio Yoga Sanur', 120000, 30],
      ['Pemeriksaan Kesehatan Gratis Komunitas', 'Surabaya', 'Balai Pemuda Surabaya', 0, 400],
      ['Workshop Pola Makan Sehat', 'Jakarta Selatan', 'Dapur Sehat Kemang', 175000, 30],
      ['Kickoff Bootcamp Kebugaran 30 Hari', 'Tangerang Selatan', 'GOR BSD', 200000, 150],
    ],
  },
  OTOMOTIF: {
    time: '10:00', hours: 8, tickets: ['Regular', 'VIP', 'VVIP'], mult: [1.8, 2.8],
    images: ['1492144534655-ae79c964c9d7', '1503376780353-7e6692767b70', '1558981806-ec527fa84c39', '1494976388531-d1058494cdd8', '1533473359331-0135ef1b58bf'],
    desc: ([n, c, v]) => `${n} di ${v}, ${c}. Pameran, kontes, dan kopdar untuk para pencinta otomotif.`,
    rows: [
      ['Pameran Mobil Klasik Jakarta', 'Jakarta Utara', 'PIK Avenue Atrium', 50000, 2000],
      ['Kontes Modifikasi Motor', 'Bandung', 'Lapangan Gasibu', 0, 1500],
      ['Touring Motor Pantai Selatan', 'Yogyakarta', 'Titik Kumpul Tugu Jogja', 150000, 100],
      ['Expo Kendaraan Listrik', 'Tangerang', 'ICE BSD', 75000, 5000],
      ['Drag Race Amatir Surabaya', 'Surabaya', 'Sirkuit Kenjeran', 100000, 1000],
      ['Kopdar Komunitas Mobil Samarinda', 'Samarinda', 'Big Mall Samarinda', 0, 500],
    ],
  },
};

const round5k = (n: number) => Math.round(n / 5000) * 5000;

async function main() {
  const organizers = await prisma.organizer.findMany({
    where: { username: { in: ORGANIZERS } },
    select: { id: true, username: true },
  });

  // urutkan round-robin antar kategori supaya tanggal & organizer tercampur
  const entries = Object.entries(CATEGORIES) as [EventCategory, (typeof CATEGORIES)[EventCategory]][];
  const queue: { category: EventCategory; row: Row; idx: number }[] = [];
  for (let k = 0; queue.length < 100; k++)
    for (const [category, conf] of entries)
      if (conf.rows[k]) queue.push({ category, row: conf.rows[k], idx: k });

  const firstDate = new Date('2026-11-05T00:00:00Z');
  let created = 0;

  for (const [i, { category, row, idx }] of queue.entries()) {
    const conf = CATEGORIES[category];
    const [name, city, venue, price, seats] = row;
    const organizer = organizers.find((o) => o.username === ORGANIZERS[i % ORGANIZERS.length]);
    if (!organizer) continue;

    const slug = slugify(name, { lower: true, strict: true });
    if (await prisma.event.findUnique({ where: { slug } })) {
      console.log(`- ${slug} sudah ada, dilewati`);
      continue;
    }

    const day = new Date(firstDate.getTime() + i * 4 * 86400000).toISOString().slice(0, 10);
    const offset = WITA.includes(city) ? '+08:00' : '+07:00';
    const startDate = new Date(`${day}T${conf.time}:00${offset}`);
    const endDate = new Date(startDate.getTime() + conf.hours * 3600000);
    const endSale = new Date(startDate.getTime() - 86400000);
    const paid = price > 0;

    let tickets;
    if (!paid) {
      tickets = [{ name: 'Free Ticket', price: 0, quota: seats, available: seats, endSale: null }];
    } else if (seats >= 500) {
      const q1 = Math.round(seats * 0.6);
      const q2 = Math.round(seats * 0.3);
      tickets = [
        { name: conf.tickets[0], price, quota: q1, available: q1, endSale },
        { name: conf.tickets[1], price: round5k(price * conf.mult[0]), quota: q2, available: q2, endSale },
        { name: conf.tickets[2], price: round5k(price * conf.mult[1]), quota: seats - q1 - q2, available: seats - q1 - q2, endSale },
      ];
    } else {
      const q1 = Math.round(seats * 0.8);
      tickets = [
        { name: conf.tickets[0], price, quota: q1, available: q1, endSale },
        { name: conf.tickets[1], price: round5k(price * conf.mult[0]), quota: seats - q1, available: seats - q1, endSale },
      ];
    }

    await prisma.event.create({
      data: {
        organizerId: organizer.id,
        name,
        slug,
        description: conf.desc(row),
        category,
        city,
        venue,
        imageUrl: unsplash(conf.images[idx % conf.images.length]),
        pricingType: paid ? 'PAID' : 'FREE',
        startDate,
        endDate,
        totalSeats: seats,
        availableSeats: seats,
        ticketTypes: { create: tickets },
      },
    });

    created++;
    console.log(`✔ ${day} ${category.padEnd(13)} ${paid ? 'PAID' : 'FREE'} ${tickets.length} tiket  ${slug}`);
  }

  console.log(`\n${created} event baru, total event sekarang: ${await prisma.event.count()}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
