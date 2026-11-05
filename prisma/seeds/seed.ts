// Seed data sebelum deployment (README lawang, "Sebelum deployment" poin 4)
// Jalankan: npx tsx prisma/seeds/seed.ts
// Menghapus Event Organizer, event, tiket, voucher, transaksi, ulasan, dan Customer lama.
// Tabel artikel (readings) TIDAK disentuh.
import { randomBytes } from 'crypto';
import slugify from 'slugify';
import { prisma } from '../../src/configs/prisma-client.config';
import { Bcrypt } from '../../src/lib/bcrypt.lib';
import { EventCategory } from '../../src/generated/prisma/client';

const PASSWORD = '12345678';
const NOW = new Date();
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

// Waktu WIB, contoh: wib('2026-11-07T19:00')
const wib = (s: string) => new Date(`${s}:00+07:00`);
const round = (n: number, step = 5000) => Math.round(n / step) * step;

// Angka acak yang selalu sama setiap seed dijalankan
let rngState = 20261104;
const rand = () => {
  rngState = (rngState * 1103515245 + 12345) % 2147483648;
  return rngState / 2147483648;
};
const pick = <T>(list: T[]) => list[Math.floor(rand() * list.length)];

const img = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=1920&h=960&fit=crop&q=85&auto=format`;

// Gambar HD per kategori (sudah dicek: semua aktif dan sesuai tema)
const IMAGES: Record<EventCategory, string[]> = {
  MUSIK: ['1470229722913-7c0e2dbbafd3', '1501386761578-eac5c94b800a', '1493225457124-a3eb161ffa5f', '1459749411175-04bf5292ceea', '1511671782779-c97d3d27a1d4', '1514525253161-7a46d19cd819', '1506157786151-b8491531f063', '1415201364774-f6f0bb35f28f'],
  GAMES: ['1542751371-adc38448a05e', '1511512578047-dfb367046420', '1538481199705-c710c4e965fc', '1550745165-9bc0b252726f', '1593305841991-05c297ba4575'],
  SAINS: ['1532094349884-543bc11b234d', '1507413245164-6160d8298b31', '1446776811953-b23d57bd21aa', '1564325724739-bae0bd08762c', '1628595351029-c2bf17511435'],
  KOMEDI: ['1527224857830-43a7acc85260', '1585699324551-f6c309eedeca', '1516280440614-37939bbacd81'],
  OLAHRAGA: ['1452626038306-9aae5e071dd3', '1546519638-68e109498ffc', '1574629810360-7efbbe195018', '1530549387789-4c1017266635', '1517649763962-0c623066013b', '1461896836934-ffe607ba8211'],
  SENI: ['1513364776144-60967b0f800f', '1503095396549-807759245b35', '1547891654-e66ed7ebb968', '1531243269054-5ebf6f34081e', '1460661419201-fd4cecdf8a8b', '1578301978693-85fa9c0320b9'],
  SPIRITUALITAS: ['1506126613408-eca07ce68773', '1545389336-cf090694435e', '1528715471579-d1bcf0ba5e83'],
  KELUARGA: ['1511895426328-dc8714191300', '1484665754804-74b091211472', '1502086223501-7ea6ecd79368'],
  ALAM_TERBUKA: ['1504280390367-361c6d9f38f4', '1464822759023-fed622ff2c3b', '1501555088652-021faa106b9b', '1478131143081-80f7f84ca84d'],
  PENDIDIKAN: ['1540575467063-178a50c2df87', '1503676260728-1c00da094a0b', '1497633762265-9d179a990aa6', '1524178232363-1fb2b075b655'],
  OTOMOTIF: ['1492144534655-ae79c964c9d7', '1558981806-ec527fa84c39', '1503376780353-7e6692767b70', '1494976388531-d1058494cdd8', '1533473359331-0135ef1b58bf'],
  WORKSHOP: ['1552664730-d307ca884978', '1556761175-5973dc0f32e7', '1517245386807-bb43f82c33c4', '1531058020387-3be344556be6'],
  KESEHATAN: ['1571019613454-1cb2f99b2d8b', '1576091160399-112ba8d25d1d', '1544367567-0f2fcb009e0b', '1490645935967-10de6ba17061'],
  K_POP: ['1429962714451-bb934ecdc4ec', '1540039155733-5bb30b53aa14', '1524368535928-5b5e00ddc76b', '1492684223066-81342ee5ff30', '1528489496900-d841974f5290', '1514533212735-5df27d970db0', '1563841930606-67e2bce48b78'],
  BUDAYA: ['1537996194471-e657df975ab4', '1555400038-63f5ba517a47', '1518548419970-58e3b4079ab2'],
};

// ───────────────────────── Event Organizer (5)
const ORGANIZERS = [
  {
    key: 'nada',
    email: 'nadanusantara@example.com',
    username: 'nadanusantara',
    organizerName: 'Nada Nusantara Live',
    organizerType: 'COMPANY' as const,
    legalName: 'PT Nada Nusantara Kreasi',
    organizerBio: 'Promotor konser dan pertunjukan live sejak 2015. Kami menghadirkan konser musik, K-Pop, dan stand up comedy dengan produksi panggung berkualitas di berbagai kota di Indonesia.',
    websiteUrl: 'https://nadanusantara.example.com',
    instagramUrl: 'https://instagram.com/nadanusantara.live',
    npwp: '0123456789012345',
    nib: '9120001234567',
    picName: 'Bima Prasetyo',
    picNik: '3174051203880001',
    picPhoneNumber: '081211110001',
    officeAddress: 'Jl. Kemang Raya No. 18, Bangka, Mampang Prapatan',
    city: 'Jakarta Selatan',
    province: 'DKI Jakarta',
    postalCode: '12730',
    bankName: 'Bank Central Asia (BCA)',
    bankAccountNumber: '5271023456',
  },
  {
    key: 'karya',
    email: 'ruangkarya@example.com',
    username: 'ruangkarya',
    organizerName: 'Ruang Karya Kreatif',
    organizerType: 'COMPANY' as const,
    legalName: 'CV Ruang Karya Kreatif',
    organizerBio: 'Komunitas kreatif asal Bandung yang rutin menggelar workshop, pameran seni, dan kelas pengembangan diri untuk pelajar, mahasiswa, dan profesional muda.',
    websiteUrl: 'https://ruangkarya.example.com',
    instagramUrl: 'https://instagram.com/ruangkarya.id',
    npwp: '0234567890123456',
    nib: '9120002345678',
    picName: 'Sekar Ayuningtyas',
    picNik: '3273016507920002',
    picPhoneNumber: '081211110002',
    officeAddress: 'Jl. Braga No. 45, Sumur Bandung',
    city: 'Bandung',
    province: 'Jawa Barat',
    postalCode: '40111',
    bankName: 'Bank Mandiri',
    bankAccountNumber: '1300012345678',
  },
  {
    key: 'gerak',
    email: 'gerakaktif@example.com',
    username: 'gerakaktif',
    organizerName: 'Gerak Aktif Indonesia',
    organizerType: 'COMPANY' as const,
    legalName: 'PT Gerak Aktif Indonesia',
    organizerBio: 'Penyelenggara event olahraga, kesehatan, dan otomotif. Dari fun run, turnamen komunitas, sampai pameran kendaraan, semuanya kami kemas aman dan seru.',
    websiteUrl: 'https://gerakaktif.example.com',
    instagramUrl: 'https://instagram.com/gerakaktif.id',
    npwp: '0345678901234567',
    nib: '9120003456789',
    picName: 'Reza Mahendra',
    picNik: '3578022009850003',
    picPhoneNumber: '081211110003',
    officeAddress: 'Jl. Raya Darmo No. 101, Wonokromo',
    city: 'Surabaya',
    province: 'Jawa Timur',
    postalCode: '60241',
    bankName: 'Bank Rakyat Indonesia (BRI)',
    bankAccountNumber: '001201234567501',
  },
  {
    key: 'jelajah',
    email: 'jelajahnusantara@example.com',
    username: 'jelajahnusantara',
    organizerName: 'Jelajah Nusantara',
    organizerType: 'INDIVIDUAL' as const,
    legalName: 'Rina Kartika Sari',
    organizerBio: 'Menghadirkan pengalaman budaya, alam terbuka, dan kegiatan keluarga yang dekat dengan kearifan lokal Indonesia.',
    websiteUrl: undefined,
    instagramUrl: 'https://instagram.com/jelajah.nusantara',
    npwp: '0456789012345678',
    nib: undefined,
    picName: 'Rina Kartika Sari',
    picNik: '3471046811900004',
    picPhoneNumber: '081211110004',
    officeAddress: 'Jl. Prawirotaman No. 12, Mergangsan',
    city: 'Yogyakarta',
    province: 'DI Yogyakarta',
    postalCode: '55153',
    bankName: 'Bank Negara Indonesia (BNI)',
    bankAccountNumber: '0812345678',
  },
  {
    key: 'levelup',
    email: 'levelup@example.com',
    username: 'levelup.arena',
    organizerName: 'Level Up Arena',
    organizerType: 'COMPANY' as const,
    legalName: 'PT Level Up Arena Digital',
    organizerBio: 'Penyelenggara turnamen esports, gaming expo, dan event sains populer untuk generasi digital.',
    websiteUrl: 'https://levelup.example.com',
    instagramUrl: 'https://instagram.com/levelup.arena',
    npwp: '0567890123456789',
    nib: '9120005678901',
    picName: 'Kevin Wijaya',
    picNik: '3173031011930005',
    picPhoneNumber: '081211110005',
    officeAddress: 'Jl. Puri Indah Raya Blok U1, Kembangan',
    city: 'Jakarta Barat',
    province: 'DKI Jakarta',
    postalCode: '11610',
    bankName: 'Bank Central Asia (BCA)',
    bankAccountNumber: '5271098765',
  },
];

const ORGANIZER_BY_CATEGORY: Record<EventCategory, string> = {
  MUSIK: 'nada', K_POP: 'nada', KOMEDI: 'nada',
  WORKSHOP: 'karya', SENI: 'karya', PENDIDIKAN: 'karya',
  OLAHRAGA: 'gerak', KESEHATAN: 'gerak', OTOMOTIF: 'gerak',
  ALAM_TERBUKA: 'jelajah', BUDAYA: 'jelajah', SPIRITUALITAS: 'jelajah', KELUARGA: 'jelajah',
  GAMES: 'levelup', SAINS: 'levelup',
};

// ───────────────────────── Customer (10)
const CUSTOMERS = [
  ['Andi Pratama', 'andipratama', '081311110001', '3174011503970001'],
  ['Siti Rahmawati', 'sitirahma', '081311110002', '3273024408980002'],
  ['Rizky Maulana', 'rizkymaulana', '081311110003', '3578031206990003'],
  ['Dewi Lestari', 'dewilestari', '081311110004', '3471045702960004'],
  ['Fajar Nugroho', 'fajarnugroho', '081311110005', '3374052109950005'],
  ['Maya Putri', 'mayaputri', '081311110006', '3171066303000006'],
  ['Dimas Saputra', 'dimassaputra', '081311110007', '3275071808970007'],
  ['Nadia Safitri', 'nadiasafitri', '081311110008', '3578084511980008'],
  ['Bagus Wicaksono', 'baguswicak', '081311110009', '3404092701960009'],
  ['Laras Ayuningsih', 'larasayu', '081311110010', '5171106909990010'],
].map(([name, username, phoneNumber, nik]) => ({
  name,
  username,
  email: `${username}@example.com`,
  phoneNumber,
  nik,
}));

// ───────────────────────── Jenis tiket per kategori: [nama, pengali harga, porsi kuota]
type TicketTemplate = [string, number, number][];
const TICKETS: Record<EventCategory, TicketTemplate> = {
  MUSIK: [['Early Bird', 0.8, 0.2], ['Festival', 1, 0.5], ['VIP', 1.8, 0.2], ['VVIP', 3, 0.1]],
  K_POP: [['Early Bird', 0.85, 0.2], ['CAT 3', 1, 0.4], ['CAT 1', 1.6, 0.3], ['VIP Soundcheck', 2.8, 0.1]],
  KOMEDI: [['Reguler', 1, 0.6], ['Premium', 1.5, 0.3], ['VIP Meet & Greet', 2.5, 0.1]],
  SAINS: [['Pelajar', 0.6, 0.4], ['Umum', 1, 0.45], ['Paket Keluarga (4 orang)', 3.2, 0.15]],
  OLAHRAGA: [['Early Bird', 0.8, 0.25], ['Reguler', 1, 0.5], ['Premium Pack', 1.6, 0.25]],
  SENI: [['Pelajar', 0.6, 0.3], ['Umum', 1, 0.55], ['VIP', 2, 0.15]],
  SPIRITUALITAS: [['Kamar Bersama', 1, 0.5], ['Kamar Pribadi', 1.6, 0.3], ['Paket Berdua', 1.8, 0.2]],
  KELUARGA: [['Anak', 0.6, 0.4], ['Dewasa', 1, 0.4], ['Paket Keluarga (4 orang)', 3, 0.2]],
  ALAM_TERBUKA: [['Bawa Tenda Sendiri', 0.6, 0.25], ['Tenda Bersama', 1, 0.4], ['Tenda Pribadi', 1.5, 0.2], ['Paket Lengkap', 2, 0.15]],
  PENDIDIKAN: [['Pelajar', 0.7, 0.5], ['Umum', 1, 0.35], ['Paket Rombongan (5 orang)', 4, 0.15]],
  OTOMOTIF: [['Reguler', 1, 0.55], ['Weekend Pass', 1.5, 0.25], ['VIP Paddock', 3, 0.15], ['Paket Komunitas (5 orang)', 4.2, 0.05]],
  WORKSHOP: [['Early Bird', 0.8, 0.3], ['Reguler', 1, 0.5], ['Reguler + Sertifikat', 1.3, 0.2]],
  KESEHATAN: [['Reguler', 1, 0.6], ['Paket Berdua', 1.8, 0.25], ['Premium', 1.6, 0.15]],
  BUDAYA: [['Tribun', 0.7, 0.5], ['Reguler', 1, 0.35], ['VIP', 2, 0.15]],
  GAMES: [['Penonton', 1, 0.6], ['Penonton + Merchandise', 1.6, 0.25], ['VIP Pass', 2.5, 0.1], ['Peserta Tim (5 orang)', 4, 0.05]],
};

// ───────────────────────── 70 event
// [kategori, nama, kota, venue, mulai (WIB), durasi (jam), harga dasar (0 = gratis), kursi, deskripsi]
type Row = [EventCategory, string, string, string, string, number, number, number, string];
const FINISHED = new Set([
  'Malam Akustik Kemang',
  'Stand Up Comedy Night: Tawa Akhir Pekan',
  'Lawang Fun Run 10K',
  'Pameran Lukisan Kontemporer Ruang Warna',
  'Festival Keluarga Ceria',
]);

const EVENTS: Row[] = [
  // MUSIK (8)
  ['MUSIK', 'Malam Akustik Kemang', 'Jakarta Selatan', 'Amfiteater Kemang Village', '2026-10-10T19:00', 4, 150000, 400, 'Malam santai bersama deretan musisi akustik lokal di ruang terbuka Kemang. Nikmati lagu-lagu favorit yang dibawakan ulang dengan aransemen hangat, ditemani lampu temaram dan suasana yang intim.'],
  ['MUSIK', 'Jakarta Sound Festival 2026', 'Jakarta Utara', 'Lapangan Ecopark Ancol', '2026-11-07T15:00', 9, 350000, 3000, 'Festival musik tepi pantai dengan tiga panggung dan lebih dari 20 penampil dari genre pop, rock, sampai elektronik. Datang lebih awal untuk menikmati sunset sambil berburu kuliner di area festival.'],
  ['MUSIK', 'Senandung Senja: Konser Jazz Tepi Danau', 'Bandung', 'Taman Budaya Dago', '2026-11-21T18:30', 4, 250000, 600, 'Konser jazz di udara sejuk Bandung dengan latar danau dan pepohonan. Kuartet jazz dan penyanyi tamu akan membawakan standar jazz klasik serta lagu Indonesia dalam nuansa swing dan bossa nova.'],
  ['MUSIK', 'Simfoni Nusantara Orchestra Night', 'Jakarta Pusat', 'Gedung Kesenian Jakarta', '2026-12-05T19:30', 3, 300000, 450, 'Orkestra simfoni membawakan aransemen megah lagu daerah dan lagu kebangsaan Indonesia. Sebuah malam untuk merayakan kekayaan musik Nusantara dalam format orkestra penuh.'],
  ['MUSIK', 'Indie Fest Yogyakarta', 'Yogyakarta', 'Lapangan Kenari', '2026-11-28T14:00', 8, 175000, 2000, 'Panggung untuk band indie dari Jogja dan sekitarnya, lengkap dengan pasar kreatif, area zine, dan merchandise eksklusif. Saatnya kenalan dengan band favoritmu berikutnya.'],
  ['MUSIK', 'Pop Punk Reunion Night', 'Surabaya', 'Surabaya Convention Hall', '2026-12-12T18:00', 5, 225000, 1500, 'Bernostalgia dengan lagu-lagu pop punk era 2000-an yang dibawakan band-band legendaris lokal. Siapkan suaramu untuk sing along dari awal sampai akhir.'],
  ['MUSIK', 'Dangdut Fiesta Semarang', 'Semarang', 'Lapangan Simpang Lima', '2027-01-16T16:00', 6, 100000, 2500, 'Pesta dangdut terbesar di awal tahun dengan orkes melayu, penyanyi dangdut koplo, dan bintang tamu kejutan. Ajak keluarga dan teman untuk bergoyang bersama.'],
  ['MUSIK', 'Bali Sunset Music Festival', 'Denpasar', 'Lapangan Niti Mandala Renon', '2026-12-27T15:00', 9, 400000, 3500, 'Tutup tahun dengan festival musik bernuansa tropis di Bali. Line up musisi pop, reggae, dan DJ akan menemanimu dari sore hingga malam.'],

  // K-POP (7)
  ['K_POP', 'Seoul Wave: K-Pop Cover Dance Championship', 'Jakarta Pusat', 'JIExpo Kemayoran Hall B', '2026-11-08T13:00', 7, 120000, 1200, 'Kompetisi cover dance K-Pop dengan peserta dari seluruh Indonesia. Saksikan penampilan grup dance terbaik yang memperebutkan gelar juara dan hadiah jutaan rupiah.'],
  ['K_POP', 'K-Pop Fan Party: Lightstick Night', 'Jakarta Selatan', 'Gedung Serbaguna Senayan', '2026-11-22T18:00', 4, 200000, 800, 'Pesta fans K-Pop dengan DJ yang memutar hits K-Pop sepanjang malam, sesi random play dance, dan photobooth bertema. Jangan lupa bawa lightstick andalanmu.'],
  ['K_POP', 'Hallyu Music Fest Bandung', 'Bandung', 'Sabuga ITB', '2026-12-06T15:00', 6, 275000, 1800, 'Festival musik bertema Korea dengan penampilan grup lokal bergaya K-Pop, booth kuliner Korea, dan area merchandise. Pengalaman Hallyu lengkap tanpa harus terbang ke Seoul.'],
  ['K_POP', 'K-Drama OST Live Concert', 'Surabaya', 'Dyandra Convention Center', '2026-12-19T19:00', 3, 325000, 1000, 'Konser yang membawakan soundtrack drama Korea paling ikonik dengan iringan band dan string section. Bersiaplah terbawa suasana adegan-adegan favoritmu.'],
  ['K_POP', 'Random Play Dance Medan', 'Medan', 'Lapangan Merdeka Medan', '2026-11-29T15:00', 4, 75000, 900, 'Ajang random play dance terbuka untuk semua fans K-Pop di Medan. Ikut menari mengikuti lagu yang diputar acak dan menangkan hadiah menarik.'],
  ['K_POP', 'K-Pop Year End Party 2026', 'Tangerang', 'ICE BSD Hall 5', '2026-12-30T17:00', 6, 350000, 2500, 'Rayakan pergantian tahun bersama sesama K-Popers dengan konser cover group, DJ set, dan countdown spesial. Malam penutup tahun yang wajib kamu datangi.'],
  ['K_POP', 'Korean Culture & K-Pop Festival', 'Makassar', 'Celebes Convention Center', '2027-02-07T12:00', 8, 150000, 1500, 'Festival budaya Korea dengan pertunjukan K-Pop, kelas hanbok, cicip makanan Korea, dan kompetisi menyanyi. Seru untuk fans baru maupun yang sudah lama.'],

  // SAINS (5)
  ['SAINS', 'Planetarium Night: Menjelajah Tata Surya', 'Jakarta Pusat', 'Planetarium Taman Ismail Marzuki', '2026-11-06T19:00', 2, 75000, 250, 'Pertunjukan kubah planetarium yang mengajakmu berkeliling tata surya, dilanjutkan sesi tanya jawab bersama astronom. Cocok untuk anak, remaja, dan orang dewasa.'],
  ['SAINS', 'Malam Observasi Bintang & Planet', 'Bandung', 'Observatorium Lembang', '2026-11-14T18:30', 4, 125000, 200, 'Amati Saturnus, Jupiter, dan gugus bintang langsung melalui teleskop bersama pemandu astronomi. Termasuk pengenalan rasi bintang dan tips memotret langit malam.'],
  ['SAINS', 'Science Fair Nusantara 2026', 'Jakarta Pusat', 'JIExpo Kemayoran Hall C', '2026-11-26T09:00', 9, 60000, 3000, 'Pameran sains interaktif dengan puluhan booth eksperimen, demo roket air, dan presentasi penelitian pelajar dari berbagai daerah.'],
  ['SAINS', 'Pameran Robotik & AI untuk Pelajar', 'Surabaya', 'Graha ITS', '2026-12-10T09:00', 7, 0, 1500, 'Lihat langsung robot karya pelajar dan mahasiswa, coba demo kecerdasan buatan, dan ikut kelas singkat pemrograman robot. Gratis untuk umum.'],
  ['SAINS', 'Talkshow Sains Populer: Di Balik Iklim yang Berubah', 'Yogyakarta', 'Grha Sabha Pramana', '2027-01-23T13:00', 4, 50000, 800, 'Diskusi santai bersama peneliti iklim tentang perubahan cuaca, dampaknya untuk Indonesia, dan langkah kecil yang bisa kita lakukan.'],

  // KOMEDI (3)
  ['KOMEDI', 'Stand Up Comedy Night: Tawa Akhir Pekan', 'Jakarta Selatan', 'Auditorium Kuningan City', '2026-10-17T20:00', 3, 125000, 500, 'Malam penuh tawa bersama komika-komika lokal yang membawakan materi segar tentang kehidupan kota, kerja, dan percintaan.'],
  ['KOMEDI', 'Komedi Tunggal: Tur Keliling Kota', 'Bandung', 'Teater Tertutup Dago', '2026-11-20T19:30', 3, 150000, 600, 'Pertunjukan spesial stand up comedy dalam rangkaian tur keliling kota. Materi baru, cerita baru, dan dijamin bikin perut sakit karena ketawa.'],
  ['KOMEDI', 'Open Mic Komedi Surabaya', 'Surabaya', 'Balai Pemuda Surabaya', '2026-12-11T19:00', 3, 50000, 300, 'Panggung open mic untuk komika pendatang baru dan senior. Datang untuk tertawa, atau daftarkan dirimu untuk ikut tampil.'],

  // OLAHRAGA (6)
  ['OLAHRAGA', 'Lawang Fun Run 10K', 'Jakarta Pusat', 'Kawasan Monas', '2026-10-04T05:30', 5, 200000, 1500, 'Lari pagi bersama ribuan pelari menyusuri jalan protokol Jakarta. Tersedia kategori 5K dan 10K, lengkap dengan jersey, medali finisher, dan refreshment.'],
  ['OLAHRAGA', 'Jakarta Night Run 2026', 'Jakarta Pusat', 'Gelora Bung Karno', '2026-11-07T18:30', 4, 250000, 2500, 'Lari malam dengan rute bercahaya di kawasan Senayan. Rasakan sensasi berlari di bawah lampu kota bersama komunitas lari Jakarta.'],
  ['OLAHRAGA', 'Turnamen Futsal Antar Komunitas', 'Bekasi', 'GOR Bekasi', '2026-11-15T08:00', 10, 50000, 800, 'Turnamen futsal sehari penuh antar komunitas dengan sistem gugur. Tiket berlaku untuk penonton, dengan akses ke seluruh pertandingan.'],
  ['OLAHRAGA', 'Bandung Cycling Tour 50K', 'Bandung', 'Gedung Sate', '2026-11-29T06:00', 6, 300000, 1000, 'Tur sepeda 50 km melewati jalur perbukitan dan kebun teh di sekitar Bandung. Termasuk support car, water station, dan jersey eksklusif.'],
  ['OLAHRAGA', 'Senam Pagi Bersama di Car Free Day', 'Surabaya', 'Taman Bungkul', '2026-11-08T06:00', 2, 0, 1000, 'Senam pagi bersama instruktur di area car free day. Gratis, terbuka untuk semua usia, dan ada doorprize untuk peserta yang beruntung.'],
  ['OLAHRAGA', 'Bali Swimming Challenge', 'Denpasar', 'Pantai Sanur', '2027-01-10T07:00', 5, 275000, 600, 'Tantangan renang perairan terbuka di Pantai Sanur dengan kategori 1 km dan 3 km. Keselamatan peserta dijaga tim penyelamat profesional.'],

  // SENI (6)
  ['SENI', 'Pameran Lukisan Kontemporer Ruang Warna', 'Yogyakarta', 'Jogja National Museum', '2026-09-19T10:00', 177, 75000, 1200, 'Pameran lukisan kontemporer dari 30 seniman muda Indonesia yang mengeksplorasi warna, identitas, dan kota. Termasuk tur kuratorial setiap sore.'],
  ['SENI', 'Pameran Seni Jalanan & Mural', 'Bandung', 'Braga Art Space', '2026-11-13T10:00', 10, 0, 1000, 'Pameran karya seniman jalanan dan demo mural langsung. Gratis untuk umum, cocok untuk kamu yang suka seni visual dan berburu spot foto.'],
  ['SENI', 'Teater Musikal Bawang Merah Bawang Putih', 'Jakarta Pusat', 'Teater Jakarta Taman Ismail Marzuki', '2026-11-27T19:00', 3, 200000, 700, 'Kisah klasik Nusantara dihadirkan ulang dalam teater musikal dengan kostum megah, koreografi apik, dan lagu-lagu orisinal.'],
  ['SENI', 'Malam Puisi & Musikalisasi Sastra', 'Surakarta', 'Taman Budaya Jawa Tengah', '2026-12-04T19:00', 3, 60000, 400, 'Malam pembacaan puisi dan musikalisasi karya sastra Indonesia oleh penyair dan musisi. Suasana hangat untuk pecinta kata.'],
  ['SENI', 'Art Market Nusantara', 'Jakarta Selatan', 'M Bloc Space', '2026-12-13T11:00', 10, 40000, 2000, 'Pasar seni yang mempertemukan ilustrator, perajin, dan seniman lokal. Belanja karya orisinal, ikut workshop singkat, dan nikmati live music.'],
  ['SENI', 'Festival Seni Rupa Bali', 'Denpasar', 'Taman Budaya Bali', '2027-02-14T10:00', 9, 80000, 1500, 'Festival seni rupa dengan pameran lukisan, patung, dan instalasi dari seniman Bali dan mancanegara.'],

  // SPIRITUALITAS (3)
  ['SPIRITUALITAS', 'Kajian Inspiratif: Hidup Tenang di Era Digital', 'Jakarta Selatan', 'Auditorium Graha Kebayoran', '2026-11-15T09:00', 3, 0, 800, 'Kajian inspiratif tentang menjaga ketenangan hati di tengah derasnya informasi digital. Gratis dan terbuka untuk umum.'],
  ['SPIRITUALITAS', 'Retret Meditasi Akhir Pekan', 'Bogor', 'Puncak Mindfulness Center', '2026-11-21T08:00', 32, 750000, 60, 'Retret dua hari satu malam di kawasan Puncak dengan sesi meditasi, yoga ringan, dan jalan sadar di alam. Sudah termasuk penginapan dan makan sehat.'],
  ['SPIRITUALITAS', 'Sunrise Yoga & Meditasi Pantai', 'Denpasar', 'Pantai Sanur', '2026-12-20T05:30', 3, 0, 300, 'Sambut matahari terbit dengan yoga dan meditasi di tepi pantai. Gratis, cukup bawa matras dan niat untuk memulai hari dengan tenang.'],

  // KELUARGA (3)
  ['KELUARGA', 'Festival Keluarga Ceria', 'Tangerang', 'Taman Kota BSD', '2026-10-25T09:00', 8, 0, 2000, 'Festival keluarga dengan panggung dongeng, lomba mewarnai, permainan tradisional, dan bazar kuliner. Gratis untuk seluruh keluarga.'],
  ['KELUARGA', 'Pertunjukan Boneka & Dongeng Anak', 'Jakarta Timur', 'Gedung Pewayangan Kautaman', '2026-11-22T10:00', 3, 80000, 400, 'Pertunjukan boneka dan dongeng interaktif yang mengajarkan nilai kebaikan dengan cara yang menyenangkan untuk anak usia 3 sampai 10 tahun.'],
  ['KELUARGA', 'Family Fun Day di Taman Kota', 'Malang', 'Alun-Alun Kota Malang', '2026-12-26T08:00', 6, 0, 1500, 'Hari penuh keseruan untuk keluarga dengan lomba balap karung, piknik bersama, dan pertunjukan sulap. Gratis dan terbuka untuk umum.'],

  // ALAM TERBUKA (4)
  ['ALAM_TERBUKA', 'Bersih Pantai & Tanam Mangrove', 'Jakarta Utara', 'Taman Wisata Alam Angke Kapuk', '2026-11-14T07:00', 4, 0, 300, 'Aksi bersih pantai dan penanaman mangrove bersama relawan. Gratis, sudah termasuk bibit mangrove, sarung tangan, dan snack.'],
  ['ALAM_TERBUKA', 'Camping Ceria di Ranca Upas', 'Bandung', 'Bumi Perkemahan Ranca Upas', '2026-11-28T13:00', 24, 250000, 300, 'Berkemah semalam di tengah hutan pinus Ranca Upas dengan api unggun, BBQ, dan pengamatan bintang. Cocok untuk pemula yang ingin mencoba camping.'],
  ['ALAM_TERBUKA', 'Pendakian Bersama Gunung Prau', 'Semarang', 'Titik Kumpul Simpang Lima Semarang', '2026-12-12T22:00', 36, 450000, 120, 'Pendakian bersama ke Gunung Prau untuk menikmati golden sunrise. Termasuk transportasi dari Semarang, pemandu, tenda, dan makan selama pendakian.'],
  ['ALAM_TERBUKA', 'Trail Run Bukit Sentul', 'Bogor', 'Sentul Eco Edu Tourism Forest', '2027-01-17T05:30', 6, 300000, 500, 'Lari lintas alam melewati hutan, sungai, dan perbukitan Sentul. Pilih kategori 10K atau 21K sesuai kemampuanmu.'],

  // PENDIDIKAN (4)
  ['PENDIDIKAN', 'Expo Kampus & Beasiswa 2026', 'Jakarta Selatan', 'Balai Kartini', '2026-11-21T09:00', 8, 0, 3000, 'Pameran kampus dalam dan luar negeri serta informasi beasiswa. Konsultasi langsung dengan perwakilan kampus, gratis untuk pelajar dan orang tua.'],
  ['PENDIDIKAN', 'Seminar Persiapan UTBK & Strategi Belajar', 'Bandung', 'Aula Universitas Padjadjaran Dipatiukur', '2026-11-29T08:00', 5, 75000, 800, 'Seminar persiapan UTBK bersama mentor berpengalaman: strategi mengerjakan soal, manajemen waktu, dan tips menjaga motivasi belajar.'],
  ['PENDIDIKAN', 'Talkshow Literasi Keuangan untuk Mahasiswa', 'Yogyakarta', 'Auditorium Kampus Terpadu', '2026-12-05T13:00', 3, 0, 600, 'Belajar mengatur uang saku, mengenal investasi, dan menghindari jebakan pinjaman online. Gratis untuk mahasiswa dan umum.'],
  ['PENDIDIKAN', 'Kelas Public Speaking untuk Pelajar', 'Surabaya', 'Ciputra World Hall', '2027-01-09T09:00', 6, 150000, 200, 'Kelas praktik public speaking untuk pelajar SMA dan mahasiswa. Latihan langsung di depan kelas dengan umpan balik dari coach.'],

  // OTOMOTIF (5)
  ['OTOMOTIF', 'Track Day Sirkuit Sentul', 'Bogor', 'Sirkuit Internasional Sentul', '2026-11-07T07:00', 10, 150000, 1000, 'Saksikan aksi mobil dan motor sport di lintasan sirkuit, lengkap dengan parade komunitas dan sesi foto di area paddock.'],
  ['OTOMOTIF', 'Jakarta Auto Show 2026', 'Tangerang', 'ICE BSD City', '2026-11-19T10:00', 251, 100000, 8000, 'Pameran otomotif dengan peluncuran mobil terbaru, test drive, dan promo spesial selama pameran berlangsung.'],
  ['OTOMOTIF', 'Modifikasi Motor Custom Expo', 'Yogyakarta', 'Jogja Expo Center', '2026-12-06T10:00', 10, 60000, 2000, 'Pameran motor custom dari builder terbaik Indonesia, kontes modifikasi, dan bazar spare part.'],
  ['OTOMOTIF', 'Pameran Mobil Klasik Nusantara', 'Surabaya', 'Grand City Exhibition Hall', '2026-12-19T10:00', 10, 75000, 1500, 'Koleksi mobil klasik dan antik yang dirawat dengan penuh cinta oleh para kolektor. Ada kontes mobil terbaik dan sesi berbagi cerita restorasi.'],
  ['OTOMOTIF', 'Night Drift Competition', 'Makassar', 'Sirkuit Center Point of Indonesia', '2027-02-20T18:00', 6, 125000, 1500, 'Kompetisi drift malam hari dengan pembalap dari berbagai daerah. Rasakan dentuman mesin dan asap ban dari tribun penonton.'],

  // WORKSHOP (4)
  ['WORKSHOP', 'Workshop Fotografi Smartphone', 'Yogyakarta', 'Malioboro Creative Hub', '2026-11-08T13:00', 4, 0, 100, 'Belajar teknik komposisi, pencahayaan, dan editing foto hanya dengan smartphone. Gratis, kuota terbatas.'],
  ['WORKSHOP', 'Workshop UI/UX untuk Pemula', 'Jakarta Selatan', 'Co-working Space SCBD', '2026-11-14T09:00', 7, 250000, 80, 'Workshop sehari untuk memahami dasar UI/UX: riset pengguna, wireframe, sampai prototipe di Figma. Bawa laptop sendiri.'],
  ['WORKSHOP', 'Kelas Barista: Dari Biji ke Cangkir', 'Bandung', 'Braga Coffee Lab', '2026-11-22T10:00', 5, 350000, 30, 'Kelas praktik barista mulai dari mengenal biji kopi, teknik seduh manual, hingga membuat latte art dasar.'],
  ['WORKSHOP', 'Bootcamp Digital Marketing 1 Hari', 'Surabaya', 'Coworking Space Surabaya', '2026-12-12T08:30', 9, 300000, 120, 'Bootcamp intensif tentang strategi media sosial, iklan digital, dan analitik untuk bisnis kecil maupun personal branding.'],

  // KESEHATAN (4)
  ['KESEHATAN', 'Seminar Kesehatan Mental di Tempat Kerja', 'Jakarta Selatan', 'Auditorium Menara Kuningan', '2026-11-19T13:00', 4, 0, 500, 'Seminar bersama psikolog tentang mengelola stres kerja, mencegah burnout, dan membangun lingkungan kerja yang sehat. Gratis untuk umum.'],
  ['KESEHATAN', 'Cek Kesehatan Gratis & Donor Darah', 'Depok', 'Balai Kota Depok', '2026-11-28T08:00', 6, 0, 800, 'Pemeriksaan tekanan darah, gula darah, dan kolesterol gratis, ditambah kegiatan donor darah bersama PMI.'],
  ['KESEHATAN', 'Yoga & Pilates Weekend Class', 'Jakarta Selatan', 'Taman Langsat', '2026-12-06T07:00', 3, 120000, 80, 'Kelas yoga dan pilates di taman kota bersama instruktur bersertifikat. Cocok untuk pemula maupun yang sudah rutin berlatih.'],
  ['KESEHATAN', 'Workshop Nutrisi & Meal Prep Sehat', 'Bandung', 'Dapur Sehat Studio', '2027-01-24T09:00', 4, 200000, 40, 'Belajar menyusun menu seimbang dan menyiapkan bekal sehat untuk seminggu bersama ahli gizi.'],

  // BUDAYA (3)
  ['BUDAYA', 'Festival Kuliner & Budaya Nusantara', 'Jakarta Pusat', 'Lapangan Banteng', '2026-11-06T15:00', 7, 0, 5000, 'Festival kuliner khas daerah, pertunjukan tari tradisional, dan pameran kain Nusantara. Gratis untuk umum.'],
  ['BUDAYA', 'Pagelaran Wayang Kulit Semalam Suntuk', 'Surakarta', 'Pendapa Pura Mangkunegaran', '2026-11-14T20:00', 8, 0, 1000, 'Pagelaran wayang kulit semalam suntuk dengan dalang ternama dan iringan gamelan lengkap. Gratis, terbuka untuk umum.'],
  ['BUDAYA', 'Festival Budaya Subak & Tari Bali', 'Denpasar', 'Taman Budaya Bali', '2026-12-18T16:00', 5, 125000, 1200, 'Mengenal sistem subak dan budaya agraris Bali lewat pameran, diskusi, dan pertunjukan tari Bali klasik.'],

  // GAMES (5)
  ['GAMES', 'Retro Gaming Night: Nostalgia Konsol Jadul', 'Bandung', 'Bandung Creative Hub', '2026-11-07T18:00', 5, 75000, 300, 'Main sepuasnya di konsol dan arcade jadul, ikut turnamen game klasik, dan tukar cerita masa kecil bersama sesama gamer.'],
  ['GAMES', 'Turnamen Esports MOBA Antar Kampus', 'Jakarta Barat', 'Esports Arena Puri', '2026-11-15T10:00', 10, 50000, 1000, 'Pertandingan final turnamen esports MOBA antar kampus. Dukung tim kampusmu langsung dari tribun penonton.'],
  ['GAMES', 'Board Game Marathon', 'Yogyakarta', 'Kafe Ludo Jogja', '2026-11-28T13:00', 9, 60000, 120, 'Seharian main board game bersama komunitas, dari party game sampai strategy game. Tersedia game master yang siap mengajari.'],
  ['GAMES', 'Lawang Gaming Expo 2026', 'Jakarta Pusat', 'JIExpo Kemayoran Hall D', '2026-12-05T10:00', 10, 100000, 6000, 'Pameran gaming dengan demo game terbaru, booth developer lokal, cosplay competition, dan show match esports.'],
  ['GAMES', 'Turnamen Battle Royale Nasional', 'Surabaya', 'Surabaya Esports Center', '2027-01-30T10:00', 10, 75000, 1200, 'Final turnamen battle royale tingkat nasional dengan total hadiah ratusan juta rupiah. Saksikan aksi tim terbaik secara langsung.'],
];

// ───────────────────────── Ulasan untuk 5 event yang sudah selesai (10 per event)
const REVIEWS: Record<string, [number, string][]> = {
  'Malam Akustik Kemang': [
    [5, 'Suasananya hangat banget, lampunya temaram dan sound-nya jernih. Pulang-pulang langsung pengen datang lagi.'],
    [5, 'Musisinya keren semua, aransemen akustiknya beda dari versi aslinya tapi tetap enak didengar.'],
    [4, 'Acaranya seru, cuma antrean masuknya agak lama. Selebihnya mantap.'],
    [5, 'Pas buat date night. Tempatnya nyaman dan tertata rapi.'],
    [4, 'Line up-nya oke, semoga next time durasinya lebih panjang.'],
    [5, 'Salah satu konser akustik terbaik yang pernah aku datangi di Jakarta.'],
    [3, 'Musiknya bagus, tapi area duduknya kurang banyak jadi sebagian harus berdiri.'],
    [5, 'Crew-nya ramah dan sigap. Semua berjalan tepat waktu.'],
    [4, 'Enak buat healing setelah seminggu kerja. Recommended!'],
    [5, 'Sing along bareng satu venue itu momen yang nggak terlupakan.'],
  ],
  'Stand Up Comedy Night: Tawa Akhir Pekan': [
    [5, 'Ketawa dari awal sampai akhir, materinya relate banget sama kehidupan di kota.'],
    [5, 'Komikanya pecah semua! Worth it banget harganya.'],
    [4, 'Seru, tapi ada satu dua materi yang kurang nendang.'],
    [5, 'Baru pertama kali nonton stand up langsung dan langsung ketagihan.'],
    [4, 'Venue nyaman, AC dingin, kursinya empuk. Materinya juga lucu.'],
    [5, 'Closing act-nya juara, sampai sakit perut ketawa.'],
    [4, 'Seru buat nonton bareng teman kantor.'],
    [3, 'Lumayan lucu, cuma mulainya molor sekitar 20 menit.'],
    [5, 'Interaksi komika sama penonton bikin suasana makin hidup.'],
    [5, 'Pokoknya kalau ada lagi aku pasti beli tiketnya.'],
  ],
  'Lawang Fun Run 10K': [
    [5, 'Rutenya rapi, water station banyak, dan marshal-nya sigap. Mantap!'],
    [5, 'Medali finisher-nya keren, jersey-nya juga nyaman dipakai.'],
    [4, 'Event lari yang terorganisir dengan baik. Pengambilan race pack agak antre.'],
    [5, 'Pertama kali ikut 10K dan pengalamannya menyenangkan banget.'],
    [4, 'Seru lari pagi bareng ribuan orang. Refreshment setelah finis juga lengkap.'],
    [5, 'Panitianya profesional, start tepat waktu.'],
    [4, 'Suka sama rutenya yang lewat jalan protokol. Next year ikut lagi.'],
    [3, 'Seru, tapi toilet di area start kurang banyak.'],
    [5, 'Atmosfernya bikin semangat, banyak yang support di pinggir jalan.'],
    [5, 'Hasil waktu langsung keluar di hari yang sama. Keren!'],
  ],
  'Pameran Lukisan Kontemporer Ruang Warna': [
    [5, 'Karyanya beragam dan berani. Tur kuratorialnya sangat membantu memahami konsep tiap karya.'],
    [4, 'Ruang pamernya luas dan pencahayaannya bagus untuk melihat detail lukisan.'],
    [5, 'Banyak seniman muda berbakat. Bangga sama skena seni Indonesia.'],
    [5, 'Spot fotonya banyak tapi tetap menghargai karya. Suka!'],
    [4, 'Pamerannya bagus, semoga ada katalog digitalnya.'],
    [5, 'Datang dua kali karena satu kali kunjungan nggak cukup.'],
    [4, 'Harga tiketnya terjangkau untuk kualitas pameran sebagus ini.'],
    [5, 'Staf galerinya ramah dan mau menjelaskan karya dengan sabar.'],
    [3, 'Karyanya keren, tapi di akhir pekan cukup ramai jadi kurang leluasa.'],
    [5, 'Inspiratif banget, jadi pengen mulai melukis lagi.'],
  ],
  'Festival Keluarga Ceria': [
    [5, 'Anak-anak senang banget, banyak permainan dan lomba yang seru.'],
    [5, 'Gratis tapi acaranya lengkap. Terima kasih panitia!'],
    [4, 'Panggung dongengnya bikin anakku betah duduk lama. Bazar kulinernya juga enak.'],
    [5, 'Tempatnya teduh dan bersih, cocok buat bawa balita.'],
    [4, 'Seru, cuma parkirnya agak susah karena ramai.'],
    [5, 'Permainan tradisionalnya bikin nostalgia, anak-anak juga jadi kenal.'],
    [5, 'Acara keluarga terbaik tahun ini, semoga rutin diadakan.'],
    [4, 'Lomba mewarnainya seru, hadiahnya juga menarik.'],
    [3, 'Acaranya bagus, tapi tempat duduk untuk orang tua kurang.'],
    [5, 'Panitianya ramah dan sangat memperhatikan keamanan anak-anak.'],
  ],
};

// Bentuk slug sama seperti event.service.ts, dengan pengecekan bentrok
const usedSlugs = new Set<string>();
function makeSlug(name: string) {
  const base = slugify(name, { lower: true, strict: true }).slice(0, 190) || 'event';
  let slug = base;
  let counter = 1;
  while (usedSlugs.has(slug)) slug = `${base}-${++counter}`;
  usedSlugs.add(slug);
  return slug;
}

// Kode voucher: huruf awal nama event + nominal, contoh JSF-HEMAT50K
function voucherCode(name: string, discount: number) {
  const initials = name
    .replace(/[^A-Za-z ]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2)
    .map((w) => w[0].toUpperCase())
    .join('')
    .slice(0, 4);
  return `${initials || 'LWG'}-HEMAT${discount / 1000}K`;
}

async function clean() {
  // Urutan mengikuti relasi (onDelete: Restrict). Tabel readings tidak disentuh.
  await prisma.review.deleteMany();
  await prisma.pointUsage.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.voucher.deleteMany();
  await prisma.ticketType.deleteMany();
  await prisma.event.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.point.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.organizer.deleteMany();
}

async function main() {
  if (EVENTS.length !== 70) throw new Error(`Jumlah event ${EVENTS.length}, seharusnya 70`);
  for (const cat of Object.keys(IMAGES) as EventCategory[]) {
    const n = EVENTS.filter((e) => e[0] === cat).length;
    if (n === 0 || n > IMAGES[cat].length) throw new Error(`Kategori ${cat}: ${n} event, ${IMAGES[cat].length} gambar`);
  }
  if (EVENTS.filter((e) => e[6] === 0).length !== 15) throw new Error('Event gratis harus 15');
  if (Object.keys(REVIEWS).some((n) => !FINISHED.has(n)) || FINISHED.size !== 5) throw new Error('Data ulasan tidak cocok');

  console.log('Menghapus data lama (kecuali artikel)...');
  await clean();

  const password = await Bcrypt.hashPassword(PASSWORD, 10);

  // Event Organizer
  const organizerId: Record<string, string> = {};
  for (const { key, ...o } of ORGANIZERS) {
    const created = await prisma.organizer.create({
      data: { ...o, password, bankAccountHolder: o.legalName },
    });
    organizerId[key] = created.id;
  }

  // Customer
  const customers = [];
  for (const c of CUSTOMERS) {
    customers.push(
      await prisma.customer.create({
        data: {
          ...c,
          password,
          referralCode: randomBytes(6).toString('hex').toUpperCase(),
        },
      }),
    );
  }

  // Event + tiket + voucher
  const imageIndex: Partial<Record<EventCategory, number>> = {};
  const paidUpcoming: { id: string; name: string; start: Date; minPrice: number }[] = [];
  const finished: { id: string; name: string; start: Date; end: Date; tickets: { id: string; price: number }[] }[] = [];

  for (const [category, name, city, venue, startStr, hours, basePrice, seats, description] of EVENTS) {
    const startDate = wib(startStr);
    const endDate = new Date(startDate.getTime() + hours * HOUR);
    const i = imageIndex[category] ?? 0;
    imageIndex[category] = i + 1;
    const isFree = basePrice === 0;

    const event = await prisma.event.create({
      data: {
        organizerId: organizerId[ORGANIZER_BY_CATEGORY[category]],
        name,
        description,
        category,
        city,
        venue,
        imageUrl: img(IMAGES[category][i]),
        pricingType: isFree ? 'FREE' : 'PAID',
        startDate,
        endDate,
        totalSeats: seats,
        availableSeats: seats,
        slug: makeSlug(name),
      },
    });

    const tickets: { id: string; price: number }[] = [];
    if (isFree) {
      // Sama seperti event.service.ts: event gratis otomatis punya "Free Ticket"
      const t = await prisma.ticketType.create({
        data: { eventId: event.id, name: 'Free Ticket', price: 0, quota: seats, available: seats },
      });
      tickets.push({ id: t.id, price: 0 });
    } else {
      const template = TICKETS[category];
      let remaining = seats;
      for (let k = 0; k < template.length; k++) {
        const [tName, mult, share] = template[k];
        const quota = k === template.length - 1 ? remaining : Math.max(1, Math.round(seats * share));
        remaining -= quota;
        const price = round(basePrice * mult);

        // Early Bird berakhir 2 minggu sebelum event (minimal 3 hari dari sekarang); tiket lain sampai event mulai
        let endSale = startDate;
        if (tName === 'Early Bird') {
          const target = Math.max(startDate.getTime() - 14 * DAY, Math.min(NOW.getTime() + 3 * DAY, startDate.getTime() - 2 * HOUR));
          endSale = new Date(startDate < NOW ? startDate.getTime() - 7 * DAY : target);
        }

        const t = await prisma.ticketType.create({
          data: { eventId: event.id, name: tName, price, quota, available: quota, endSale },
        });
        tickets.push({ id: t.id, price });
      }
    }

    if (FINISHED.has(name)) finished.push({ id: event.id, name, start: startDate, end: endDate, tickets });
    else if (!isFree) paidUpcoming.push({ id: event.id, name, start: startDate, minPrice: Math.min(...tickets.map((t) => t.price)) });
  }

  // Voucher untuk 40 event berbayar yang belum berlangsung (dipilih merata, bukan 40 pertama)
  const voucherEvents = paidUpcoming
    .map((e, i) => ({ e, order: (i * 17) % paidUpcoming.length }))
    .sort((a, b) => a.order - b.order)
    .slice(0, 40)
    .map(({ e }) => e);

  for (const e of voucherEvents) {
    const discount = Math.min(50000, Math.max(10000, round(e.minPrice * 0.2)));
    const lastDay = new Date(e.start.getTime() - DAY);
    await prisma.voucher.create({
      data: {
        eventId: e.id,
        code: voucherCode(e.name, discount),
        discountAmount: discount,
        quota: pick([50, 75, 100, 150]),
        startDate: wib('2026-11-01T00:00'),
        endDate: lastDay > NOW ? lastDay : e.start,
      },
    });
  }

  // Transaksi DONE + 10 ulasan untuk setiap event yang sudah selesai
  for (const ev of finished) {
    const reviews = REVIEWS[ev.name];
    for (let c = 0; c < customers.length; c++) {
      const ticket = pick(ev.tickets);
      const quantity = ticket.price === 0 ? pick([1, 2, 3]) : pick([1, 1, 2]);
      const subtotal = ticket.price * quantity;
      const createdAt = new Date(ev.start.getTime() - (5 + Math.floor(rand() * 20)) * DAY);
      const uploadedAt = new Date(createdAt.getTime() + 5 * 60 * 1000);

      await prisma.transaction.create({
        data: {
          customerId: customers[c].id,
          eventId: ev.id,
          ticketTypeId: ticket.id,
          quantity,
          unitPrice: ticket.price,
          subtotal,
          totalPrice: subtotal,
          status: 'DONE',
          paymentExpiresAt: new Date(createdAt.getTime() + 15 * 60 * 1000),
          paymentProofUploadedAt: ticket.price ? uploadedAt : undefined,
          confirmDeadlineAt: ticket.price ? new Date(uploadedAt.getTime() + 3 * DAY) : undefined,
          decidedAt: new Date(uploadedAt.getTime() + (1 + Math.floor(rand() * 10)) * HOUR),
          createdAt,
          updatedAt: createdAt,
        },
      });
      await prisma.ticketType.update({ where: { id: ticket.id }, data: { available: { decrement: quantity } } });
      await prisma.event.update({ where: { id: ev.id }, data: { availableSeats: { decrement: quantity } } });

      const [rating, comment] = reviews[c];
      await prisma.review.create({
        data: {
          customerId: customers[c].id,
          eventId: ev.id,
          rating,
          comment,
          createdAt: new Date(ev.end.getTime() + (1 + Math.floor(rand() * 72)) * HOUR),
        },
      });
    }
  }

  const counts = {
    organizer: await prisma.organizer.count(),
    customer: await prisma.customer.count(),
    event: await prisma.event.count(),
    eventGratis: await prisma.event.count({ where: { pricingType: 'FREE' } }),
    tiket: await prisma.ticketType.count(),
    eventBervoucher: (await prisma.voucher.groupBy({ by: ['eventId'] })).length,
    transaksi: await prisma.transaction.count(),
    ulasan: await prisma.review.count(),
    artikel: await prisma.reading.count(),
  };
  console.log('Selesai:', counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
