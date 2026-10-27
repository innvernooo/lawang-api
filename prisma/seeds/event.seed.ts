import { prisma } from '../../src/configs/prisma-client.config';
import { EventCategory, PricingType } from '../../src/generated/prisma/client';

type TicketSeed = { name: string; price: number; quota: number };

type EventSeed = {
  organizerUsername: string;
  name: string;
  description: string;
  category: EventCategory;
  city: string;
  venue: string;
  pricingType: PricingType;
  startDate: string;
  endDate: string;
  totalSeats: number;
  tickets: TicketSeed[];
};

const events: EventSeed[] = [
  {
    organizerUsername: 'nadasenja',
    name: 'Senja Akustik Fest 2026',
    description:
      'Festival musik akustik di sore hari bersama musisi indie tanah air. Nikmati lagu-lagu hangat sambil menunggu matahari terbenam.',
    category: 'MUSIC',
    city: 'Jakarta Selatan',
    venue: 'Lapangan Blok M Square',
    pricingType: 'PAID',
    startDate: '2026-12-12T16:00:00+07:00',
    endDate: '2026-12-12T22:00:00+07:00',
    totalSeats: 500,
    tickets: [
      { name: 'Regular', price: 150000, quota: 400 },
      { name: 'VIP', price: 350000, quota: 100 },
    ],
  },
  {
    organizerUsername: 'kreasipanggung',
    name: 'Teater Malam Braga: Kisah Sangkuriang',
    description:
      'Pementasan teater modern yang mengangkat legenda Sangkuriang dengan tata panggung dan musik kontemporer.',
    category: 'ARTS',
    city: 'Bandung',
    venue: 'Gedung Kesenian Rumentang Siang',
    pricingType: 'PAID',
    startDate: '2026-11-21T19:00:00+07:00',
    endDate: '2026-11-21T21:30:00+07:00',
    totalSeats: 300,
    tickets: [
      { name: 'Tribun', price: 75000, quota: 220 },
      { name: 'Kursi Depan', price: 150000, quota: 80 },
    ],
  },
  {
    organizerUsername: 'ruanggerak',
    name: 'Workshop Sablon Kaos untuk Pemula',
    description:
      'Kelas komunitas gratis untuk belajar dasar-dasar sablon manual. Bahan disediakan, cukup bawa semangat dan kaos polos.',
    category: 'WORKSHOP',
    city: 'Yogyakarta',
    venue: 'Ruang Gerak Studio, Prawirotaman',
    pricingType: 'FREE',
    startDate: '2026-11-15T09:00:00+07:00',
    endDate: '2026-11-15T13:00:00+07:00',
    totalSeats: 40,
    tickets: [],
  },
  {
    organizerUsername: 'lenterakreatif',
    name: 'Lentera Open Mic Vol. 7',
    description:
      'Open mic stand-up comedy bulanan yang terbuka untuk umum. Datang untuk menonton atau daftar di lokasi untuk tampil.',
    category: 'COMEDY',
    city: 'Surabaya',
    venue: 'Lentera Hall, Tunjungan',
    pricingType: 'FREE',
    startDate: '2026-12-05T20:00:00+07:00',
    endDate: '2026-12-05T22:30:00+07:00',
    totalSeats: 100,
    tickets: [],
  },
  {
    organizerUsername: 'soraksorai',
    name: 'Bali E-Sports Championship 2027',
    description:
      'Turnamen e-sports tingkat nasional dengan total hadiah ratusan juta rupiah. Saksikan langsung tim-tim terbaik bertanding.',
    category: 'GAMES',
    city: 'Denpasar',
    venue: 'GOR Lila Bhuana',
    pricingType: 'PAID',
    startDate: '2027-01-23T10:00:00+08:00',
    endDate: '2027-01-24T21:00:00+08:00',
    totalSeats: 1000,
    tickets: [
      { name: 'Day Pass', price: 100000, quota: 700 },
      { name: '2-Day Pass', price: 180000, quota: 300 },
    ],
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

    const existing = await prisma.event.findFirst({
      where: { organizerId: organizer.id, name: e.name },
    });

    if (existing) {
      console.log(`- ${e.name} sudah ada, dilewati`);
      continue;
    }

    const startDate = new Date(e.startDate);
    const endSale = new Date(startDate.getTime() - 24 * 60 * 60 * 1000);

    const created = await prisma.event.create({
      data: {
        organizerId: organizer.id,
        name: e.name,
        description: e.description,
        category: e.category,
        city: e.city,
        venue: e.venue,
        pricingType: e.pricingType,
        startDate,
        endDate: new Date(e.endDate),
        totalSeats: e.totalSeats,
        availableSeats: e.totalSeats,
        ticketTypes: {
          create: e.tickets.map((t) => ({
            ...t,
            available: t.quota,
            endSale,
          })),
        },
      },
      include: { ticketTypes: true },
    });

    console.log(
      `✔ ${created.name} [${created.pricingType}] — ${created.ticketTypes.length} tipe tiket`,
    );
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
