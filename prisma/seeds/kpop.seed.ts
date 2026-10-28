import slugify from 'slugify';
import { prisma } from '../../src/configs/prisma-client.config';

// Seed 50 konser K-Pop (semua PAID, kategori MUSIC) dibagi rata ke 5 organizer
// seed. Nama grup asli, tapi event-nya FIKTIF (data uji), dan gambarnya foto
// konser umum dari Unsplash, bukan foto idol. Aman dijalankan ulang: slug
// yang sudah ada dilewati.

const ORGANIZERS = [
  'nadasenja',
  'kreasipanggung',
  'ruanggerak',
  'lenterakreatif',
  'soraksorai',
];

const ARTISTS = [
  'BLACKPINK', 'BTS', 'SEVENTEEN', 'Stray Kids', 'TWICE',
  'aespa', 'NewJeans', 'IVE', 'LE SSERAFIM', 'i-dle',
  'NCT 127', 'NCT DREAM', 'ENHYPEN', 'TOMORROW X TOGETHER', 'ATEEZ',
  'ITZY', 'Red Velvet', 'EXO', 'TREASURE', 'MAMAMOO',
  'NMIXX', 'ZEROBASEONE', 'RIIZE', 'BOYNEXTDOOR', 'ILLIT',
  'BABYMONSTER', 'KISS OF LIFE', 'THE BOYZ', 'MONSTA X', 'SHINee',
  "Girls' Generation", 'Super Junior', 'DAY6', 'STAYC', 'fromis_9',
  'OH MY GIRL', 'P1Harmony', 'TWS', 'Xdinary Heroes', 'Kep1er',
  'IU', 'Taeyeon', 'Baekhyun', 'Taemin', 'Jackson Wang',
  'Chung Ha', 'Sunmi', 'WINNER', '&TEAM', 'xikers',
];

type Venue = {
  name: string;
  city: string;
  seats: number;
  prices: [number, number, number]; // VIP, CAT 1, CAT 2
};

const STADIUM: [number, number, number] = [3500000, 2250000, 1250000];
const ARENA: [number, number, number] = [2800000, 1800000, 950000];
const HALL: [number, number, number] = [1800000, 1200000, 650000];

const VENUES: Venue[] = [
  { name: 'Stadion Utama Gelora Bung Karno', city: 'Jakarta Pusat', seats: 70000, prices: STADIUM },
  { name: 'Jakarta International Stadium', city: 'Jakarta Utara', seats: 50000, prices: STADIUM },
  { name: 'Indonesia Arena', city: 'Jakarta Pusat', seats: 16000, prices: ARENA },
  { name: 'ICE BSD Hall 5-6', city: 'Tangerang', seats: 10000, prices: ARENA },
  { name: 'JIExpo Kemayoran Hall', city: 'Jakarta Pusat', seats: 12000, prices: ARENA },
  { name: 'Beach City International Stadium', city: 'Jakarta Utara', seats: 8000, prices: ARENA },
  { name: 'Istora Senayan', city: 'Jakarta Pusat', seats: 7000, prices: HALL },
  { name: 'Tennis Indoor Senayan', city: 'Jakarta Pusat', seats: 3500, prices: HALL },
  { name: 'Grand City Convex', city: 'Surabaya', seats: 6000, prices: HALL },
  { name: 'Sabuga ITB', city: 'Bandung', seats: 4000, prices: HALL },
  { name: 'GOR Amongrogo', city: 'Yogyakarta', seats: 4000, prices: HALL },
  { name: 'Celebes Convention Center', city: 'Makassar', seats: 5000, prices: HALL },
  { name: 'Lapangan Niti Mandala Renon', city: 'Denpasar', seats: 10000, prices: ARENA },
];

const WITA = ['Denpasar', 'Makassar'];

const IMAGES = [
  '1459749411175-04bf5292ceea', '1470229722913-7c0e2dbbafd3', '1540039155733-5bb30b53aa14',
  '1533174072545-7a4b6ad7a6c3', '1492684223066-81342ee5ff30', '1501386761578-eac5c94b800a',
  '1504680177321-2e6a879aac86', '1574391884720-bbc3740c59d1', '1563841930606-67e2bce48b78',
  '1619229666372-3c26c399a4cb', '1514533212735-5df27d970db0', '1528489496900-d841974f5290',
  '1499364615650-ec38552f4f34', '1506157786151-b8491531f063', '1429962714451-bb934ecdc4ec',
  '1524368535928-5b5e00ddc76b', '1516450360452-9312f5e86fc7', '1501281668745-f7f57925c3b4',
  '1514525253161-7a46d19cd819', '1493225457124-a3eb161ffa5f', '1585699324551-f6c309eedeca',
];

const FORMATS = [
  (a: string, city: string, y: number) => `${a} Live in ${city} ${y}`,
  (a: string, city: string, y: number) => `${a} Asia Tour ${y} in ${city}`,
  (a: string, city: string) => `${a} Fan Concert in ${city}`,
  (a: string, city: string) => `${a} Fanmeeting in ${city}`,
];

const unsplash = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=1200&q=80`;

async function main() {
  const organizers = await prisma.organizer.findMany({
    where: { username: { in: ORGANIZERS } },
    select: { id: true, username: true },
  });

  // tanggal pertama: Sabtu 7 Nov 2026, lalu tiap 7-8 hari (bergantian Sabtu/Minggu)
  const firstDate = new Date('2026-11-07T00:00:00Z');
  let created = 0;

  for (const [i, artist] of ARTISTS.entries()) {
    const organizer = organizers.find(
      (o) => o.username === ORGANIZERS[i % ORGANIZERS.length],
    );
    if (!organizer) {
      console.log(`✘ organizer ${ORGANIZERS[i % ORGANIZERS.length]} tidak ditemukan`);
      continue;
    }

    const venue = VENUES[(i * 5) % VENUES.length];
    const day = new Date(firstDate.getTime() + (i * 7 + (i % 2)) * 86400000)
      .toISOString()
      .slice(0, 10);
    const offset = WITA.includes(venue.city) ? '+08:00' : '+07:00';
    const startDate = new Date(`${day}T19:00:00${offset}`);
    const endDate = new Date(startDate.getTime() + 3.5 * 60 * 60 * 1000);
    const endSale = new Date(startDate.getTime() - 24 * 60 * 60 * 1000);

    const format = FORMATS[i % FORMATS.length];
    const name = format(artist, venue.city, startDate.getUTCFullYear());
    const slug = slugify(name, { lower: true, strict: true });

    if (await prisma.event.findUnique({ where: { slug } })) {
      console.log(`- ${slug} sudah ada, dilewati`);
      continue;
    }

    const isFanmeet = i % FORMATS.length >= 2;
    const seats = isFanmeet ? Math.min(venue.seats, 7000) : venue.seats;
    const [vip, cat1, cat2] = venue.prices.map((p) =>
      isFanmeet ? Math.round((p * 0.7) / 50000) * 50000 : p,
    );
    const vipQuota = Math.round(seats * 0.15);
    const cat1Quota = Math.round(seats * 0.35);
    const cat2Quota = seats - vipQuota - cat1Quota;

    const discount = Math.max(50000, Math.round((cat2 * 0.05) / 25000) * 25000);
    const voucherCode = `${slugify(artist, { strict: true }).toUpperCase()}-PRESALE`.slice(0, 30);

    await prisma.event.create({
      data: {
        organizerId: organizer.id,
        name,
        slug,
        description:
          `${isFanmeet ? 'Fan concert' : 'Konser'} ${artist} di ${venue.name}, ${venue.city}. ` +
          'Bersiaplah untuk malam penuh lagu hits, lightstick, dan fanchant bersama sesama fans. ' +
          'Catatan: event ini adalah data contoh, bukan konser resmi.',
        category: 'MUSIC',
        city: venue.city,
        venue: venue.name,
        imageUrl: unsplash(IMAGES[i % IMAGES.length]),
        pricingType: 'PAID',
        startDate,
        endDate,
        totalSeats: seats,
        availableSeats: seats,
        ticketTypes: {
          create: [
            { name: 'VIP', price: vip, quota: vipQuota, available: vipQuota, endSale },
            { name: 'CAT 1', price: cat1, quota: cat1Quota, available: cat1Quota, endSale },
            { name: 'CAT 2', price: cat2, quota: cat2Quota, available: cat2Quota, endSale },
          ],
        },
        vouchers: {
          create: {
            code: voucherCode,
            discountAmount: discount,
            quota: 100,
            startDate: new Date(),
            endDate: endSale,
          },
        },
      },
    });

    created++;
    console.log(`✔ ${day} ${organizer.username.padEnd(15)} ${slug}`);
  }

  console.log(`\n${created} event K-Pop baru, total event sekarang: ${await prisma.event.count()}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
