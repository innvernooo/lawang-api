import slugify from 'slugify';
import { prisma } from '../../src/configs/prisma-client.config';
import { EventCategory, PricingType } from '../../src/generated/prisma/client';

type TicketSeed = { name: string; price: number; quota: number };
type VoucherSeed = { code: string; discountAmount: number; quota: number };

type EventSeed = {
  organizerUsername: string;
  name: string;
  description: string;
  category: EventCategory;
  city: string;
  venue: string;
  image: string;
  pricingType: PricingType;
  startDate: string;
  endDate: string;
  totalSeats: number;
  tickets: TicketSeed[];
  voucher?: VoucherSeed;
};

const unsplash = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=1200&q=80`;

const events: EventSeed[] = [
  // --- nadasenja ---
  {
    organizerUsername: 'nadasenja',
    name: 'Senja Akustik Fest 2026',
    description:
      'Festival musik akustik di sore hari bersama musisi indie tanah air. Nikmati lagu-lagu hangat sambil menunggu matahari terbenam.',
    category: 'MUSIC',
    city: 'Jakarta Selatan',
    venue: 'Lapangan Blok M Square',
    image: unsplash('1501281668745-f7f57925c3b4'),
    pricingType: 'PAID',
    startDate: '2026-12-12T16:00:00+07:00',
    endDate: '2026-12-12T22:00:00+07:00',
    totalSeats: 500,
    tickets: [
      { name: 'Regular', price: 150000, quota: 400 },
      { name: 'VIP', price: 350000, quota: 100 },
    ],
    voucher: { code: 'SENJA-HEMAT', discountAmount: 25000, quota: 50 },
  },
  {
    organizerUsername: 'nadasenja',
    name: 'Senja Open Stage: Musisi Muda',
    description:
      'Panggung terbuka gratis untuk musisi muda Jakarta. Datang, dengarkan, dan dukung talenta baru dari berbagai genre.',
    category: 'MUSIC',
    city: 'Jakarta Pusat',
    venue: 'Taman Ismail Marzuki',
    image: unsplash('1514525253161-7a46d19cd819'),
    pricingType: 'FREE',
    startDate: '2026-11-28T18:00:00+07:00',
    endDate: '2026-11-28T22:00:00+07:00',
    totalSeats: 300,
    tickets: [],
  },

  // --- kreasipanggung ---
  {
    organizerUsername: 'kreasipanggung',
    name: 'Teater Malam Braga: Kisah Sangkuriang',
    description:
      'Pementasan teater modern yang mengangkat legenda Sangkuriang dengan tata panggung dan musik kontemporer.',
    category: 'ARTS',
    city: 'Bandung',
    venue: 'Gedung Kesenian Rumentang Siang',
    image: unsplash('1503095396549-807759245b35'),
    pricingType: 'PAID',
    startDate: '2026-11-21T19:00:00+07:00',
    endDate: '2026-11-21T21:30:00+07:00',
    totalSeats: 300,
    tickets: [
      { name: 'Tribun', price: 75000, quota: 220 },
      { name: 'Kursi Depan', price: 150000, quota: 80 },
    ],
    voucher: { code: 'BRAGA-TEATER', discountAmount: 15000, quota: 30 },
  },
  {
    organizerUsername: 'kreasipanggung',
    name: 'Pameran Lukis Jalanan Braga',
    description:
      'Pameran karya pelukis jalanan Bandung di sepanjang Jalan Braga. Terbuka untuk umum, bisa ngobrol langsung dengan senimannya.',
    category: 'ARTS',
    city: 'Bandung',
    venue: 'Jalan Braga',
    image: unsplash('1531243269054-5ebf6f34081e'),
    pricingType: 'FREE',
    startDate: '2026-12-19T10:00:00+07:00',
    endDate: '2026-12-20T20:00:00+07:00',
    totalSeats: 500,
    tickets: [],
  },

  // --- ruanggerak ---
  {
    organizerUsername: 'ruanggerak',
    name: 'Workshop Sablon Kaos untuk Pemula',
    description:
      'Kelas komunitas gratis untuk belajar dasar-dasar sablon manual. Bahan disediakan, cukup bawa semangat dan kaos polos.',
    category: 'WORKSHOP',
    city: 'Yogyakarta',
    venue: 'Ruang Gerak Studio, Prawirotaman',
    image: unsplash('1460661419201-fd4cecdf8a8b'),
    pricingType: 'FREE',
    startDate: '2026-11-15T09:00:00+07:00',
    endDate: '2026-11-15T13:00:00+07:00',
    totalSeats: 40,
    tickets: [],
  },
  {
    organizerUsername: 'ruanggerak',
    name: 'Kelas Public Speaking Komunitas',
    description:
      'Latihan berbicara di depan umum bersama fasilitator berpengalaman. Cocok untuk mahasiswa dan pekerja muda.',
    category: 'WORKSHOP',
    city: 'Yogyakarta',
    venue: 'Ruang Gerak Studio, Prawirotaman',
    image: unsplash('1531058020387-3be344556be6'),
    pricingType: 'FREE',
    startDate: '2026-12-06T13:00:00+07:00',
    endDate: '2026-12-06T16:00:00+07:00',
    totalSeats: 60,
    tickets: [],
  },

  // --- lenterakreatif ---
  {
    organizerUsername: 'lenterakreatif',
    name: 'Lentera Open Mic Vol. 7',
    description:
      'Open mic stand-up comedy bulanan yang terbuka untuk umum. Datang untuk menonton atau daftar di lokasi untuk tampil.',
    category: 'COMEDY',
    city: 'Surabaya',
    venue: 'Lentera Hall, Tunjungan',
    image: unsplash('1527224857830-43a7acc85260'),
    pricingType: 'FREE',
    startDate: '2026-12-05T20:00:00+07:00',
    endDate: '2026-12-05T22:30:00+07:00',
    totalSeats: 100,
    tickets: [],
  },
  {
    organizerUsername: 'lenterakreatif',
    name: 'Stand-Up Malam Minggu Malang',
    description:
      'Malam komedi santai bersama komika lokal Malang. Gratis, tempat terbatas, datang lebih awal supaya dapat kursi depan.',
    category: 'COMEDY',
    city: 'Malang',
    venue: 'Gedung Kesenian Gajayana',
    image: unsplash('1585699324551-f6c309eedeca'),
    pricingType: 'FREE',
    startDate: '2027-01-09T19:30:00+07:00',
    endDate: '2027-01-09T22:00:00+07:00',
    totalSeats: 150,
    tickets: [],
  },

  // --- soraksorai ---
  {
    organizerUsername: 'soraksorai',
    name: 'Bali E-Sports Championship 2027',
    description:
      'Turnamen e-sports tingkat nasional dengan total hadiah ratusan juta rupiah. Saksikan langsung tim-tim terbaik bertanding.',
    category: 'GAMES',
    city: 'Denpasar',
    venue: 'GOR Lila Bhuana',
    image: unsplash('1542751371-adc38448a05e'),
    pricingType: 'PAID',
    startDate: '2027-01-23T10:00:00+08:00',
    endDate: '2027-01-24T21:00:00+08:00',
    totalSeats: 1000,
    tickets: [
      { name: 'Day Pass', price: 100000, quota: 700 },
      { name: '2-Day Pass', price: 180000, quota: 300 },
    ],
    voucher: { code: 'ESPORTS-BALI', discountAmount: 20000, quota: 100 },
  },
  {
    organizerUsername: 'soraksorai',
    name: 'Bali Fun Run 5K',
    description:
      'Lari santai 5 km menyusuri kota Denpasar. Gratis untuk umum, cocok untuk pemula maupun pelari rutin.',
    category: 'SPORTS',
    city: 'Denpasar',
    venue: 'Lapangan Puputan Badung',
    image: unsplash('1452626038306-9aae5e071dd3'),
    pricingType: 'FREE',
    startDate: '2026-11-29T06:00:00+08:00',
    endDate: '2026-11-29T09:00:00+08:00',
    totalSeats: 800,
    tickets: [],
  },
];

async function main() {
  for (const e of events) {
    const organizer = await prisma.organizer.findUnique({
      where: { username: e.organizerUsername },
    });

    if (!organizer) {
      console.log(`✘ organizer ${e.organizerUsername} tidak ditemukan, dilewati`);
      continue;
    }

    const slug = slugify(e.name, { lower: true, strict: true });

    if (await prisma.event.findUnique({ where: { slug } })) {
      console.log(`- ${slug} sudah ada, dilewati`);
      continue;
    }

    const startDate = new Date(e.startDate);
    const endSale = new Date(startDate.getTime() - 24 * 60 * 60 * 1000);

    // event FREE mengikuti EventService.create: satu tiket "Free Ticket" seharga 0
    const tickets: TicketSeed[] =
      e.pricingType === 'FREE'
        ? [{ name: 'Free Ticket', price: 0, quota: e.totalSeats }]
        : e.tickets;

    const created = await prisma.event.create({
      data: {
        organizerId: organizer.id,
        name: e.name,
        slug,
        description: e.description,
        category: e.category,
        city: e.city,
        venue: e.venue,
        imageUrl: e.image,
        pricingType: e.pricingType,
        startDate,
        endDate: new Date(e.endDate),
        totalSeats: e.totalSeats,
        availableSeats: e.totalSeats,
        ticketTypes: {
          create: tickets.map((t) => ({
            ...t,
            available: t.quota,
            endSale: e.pricingType === 'PAID' ? endSale : null,
          })),
        },
        ...(e.voucher && {
          vouchers: {
            create: {
              ...e.voucher,
              startDate: new Date(),
              endDate: endSale,
            },
          },
        }),
      },
      include: { ticketTypes: true, vouchers: true },
    });

    console.log(
      `✔ ${created.slug} [${created.pricingType}] — ${created.ticketTypes.length} tiket, ${created.vouchers.length} voucher`,
    );
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
