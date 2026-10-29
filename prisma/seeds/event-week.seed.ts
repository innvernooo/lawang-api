import slugify from 'slugify';
import { prisma } from '../../src/configs/prisma-client.config';
import { EventCategory } from '../../src/generated/prisma/client';

// Seed 10 event untuk minggu ini (Kamis 29 Okt - Minggu 1 Nov 2026), dipakai untuk
// menguji query "event minggu ini". price 0 = FREE (dapat "Free Ticket"), price > 0 =
// PAID (2-3 tipe tiket). Aman dijalankan ulang: slug yang sudah ada dilewati.

type Row = {
  name: string;
  category: EventCategory;
  city: string;
  venue: string;
  price: number;
  seats: number;
  date: string;
  time: string;
  hours: number;
  image: string;
  desc: string;
};

const ORGANIZERS = ['nadasenja', 'kreasipanggung', 'ruanggerak', 'lenterakreatif', 'soraksorai'];

const WITA = ['Denpasar', 'Mataram', 'Makassar', 'Balikpapan', 'Manado', 'Kupang', 'Samarinda', 'Banjarmasin'];

const unsplash = (id: string) => `https://images.unsplash.com/photo-${id}?w=1200&q=80`;

const TIERS: Partial<Record<EventCategory, { names: [string, string, string]; mult: [number, number] }>> = {
  MUSIK: { names: ['Regular', 'VIP', 'VVIP'], mult: [1.8, 2.8] },
  WORKSHOP: { names: ['Early Bird', 'Regular', 'Premium'], mult: [1.3, 1.8] },
  OLAHRAGA: { names: ['Regular', 'VIP', 'VVIP'], mult: [1.8, 2.8] },
  K_POP: { names: ['Regular', 'VIP', 'VVIP'], mult: [1.8, 2.8] },
  KELUARGA: { names: ['Anak', 'Dewasa', 'Paket Keluarga'], mult: [1.6, 3] },
  OTOMOTIF: { names: ['Regular', 'VIP', 'VVIP'], mult: [1.8, 2.8] },
};

const ROWS: Row[] = [
  { name: 'Malam Akustik Kemang', category: 'MUSIK', city: 'Jakarta Selatan', venue: 'Taman Kemang Raya', price: 100000, seats: 300, date: '2026-10-29', time: '19:00', hours: 3, image: '1501281668745-f7f57925c3b4', desc: 'Malam Akustik Kemang menghadirkan penampilan musisi lokal di Taman Kemang Raya. Datang lebih awal dan nikmati suasananya.' },
  { name: 'Open Mic Kamis Malam', category: 'KOMEDI', city: 'Surabaya', venue: 'Lentera Hall, Tunjungan', price: 0, seats: 120, date: '2026-10-29', time: '20:00', hours: 2.5, image: '1527224857830-43a7acc85260', desc: 'Open Mic Kamis Malam di Lentera Hall, Surabaya. Malam penuh tawa bersama komika pilihan, siapkan perut kamu.' },
  { name: 'Workshop Branding untuk UMKM', category: 'WORKSHOP', city: 'Bandung', venue: 'Bandung Digital Valley', price: 125000, seats: 50, date: '2026-10-30', time: '09:00', hours: 4, image: '1552664730-d307ca884978', desc: 'Workshop Branding untuk UMKM di Bandung Digital Valley. Materi praktis dibawakan fasilitator berpengalaman, tempat terbatas.' },
  { name: 'Gaming Night Jumat', category: 'GAMES', city: 'Yogyakarta', venue: 'Jogja City Mall Hall', price: 0, seats: 100, date: '2026-10-30', time: '19:00', hours: 4, image: '1542751371-adc38448a05e', desc: 'Gaming Night Jumat di Jogja City Mall Hall. Turnamen kecil, area main bebas, dan booth komunitas gamer.' },
  { name: 'Fun Run Halloween 5K', category: 'OLAHRAGA', city: 'Jakarta Pusat', venue: 'Kawasan GBK Senayan', price: 150000, seats: 1000, date: '2026-10-31', time: '06:00', hours: 4, image: '1461896836934-ffe607ba8211', desc: 'Fun Run Halloween 5K di kawasan GBK Senayan. Lari santai dengan kostum, terbuka untuk peserta dan penonton.' },
  { name: 'K-Pop Dance Cover Weekend', category: 'K_POP', city: 'Bandung', venue: 'Trans Studio Mall Atrium', price: 50000, seats: 600, date: '2026-10-31', time: '13:00', hours: 6, image: '1524368535928-5b5e00ddc76b', desc: 'K-Pop Dance Cover Weekend di Trans Studio Mall, Bandung. Kumpul bareng sesama K-Popers, bawa lightstick dan semangat kamu.' },
  { name: 'Pawai Budaya Sabtu Sore', category: 'BUDAYA', city: 'Denpasar', venue: 'Lapangan Niti Mandala Renon', price: 0, seats: 1500, date: '2026-10-31', time: '16:00', hours: 4, image: '1537996194471-e657df975ab4', desc: 'Pawai Budaya Sabtu Sore di Lapangan Niti Mandala Renon. Rayakan kekayaan budaya Nusantara lewat pertunjukan dan kerajinan.' },
  { name: 'Senam Sehat Minggu Ceria', category: 'KESEHATAN', city: 'Jakarta Pusat', venue: 'Lapangan Monas', price: 0, seats: 1500, date: '2026-11-01', time: '07:00', hours: 3, image: '1571019613454-1cb2f99b2d8b', desc: 'Senam Sehat Minggu Ceria di Lapangan Monas. Langkah kecil untuk hidup lebih sehat, bersama ahli dan komunitas.' },
  { name: 'Piknik Keluarga Akhir Pekan', category: 'KELUARGA', city: 'Bogor', venue: 'Kebun Raya Bogor', price: 30000, seats: 400, date: '2026-11-01', time: '09:00', hours: 6, image: '1511895426328-dc8714191300', desc: 'Piknik Keluarga Akhir Pekan di Kebun Raya Bogor. Acara seru untuk seluruh anggota keluarga, dari si kecil sampai kakek nenek.' },
  { name: 'Kopdar Mobil Klasik Minggu', category: 'OTOMOTIF', city: 'Bandung', venue: 'Lapangan Gasibu', price: 40000, seats: 600, date: '2026-11-01', time: '10:00', hours: 6, image: '1492144534655-ae79c964c9d7', desc: 'Kopdar Mobil Klasik Minggu di Lapangan Gasibu. Pameran dan kopdar untuk para pencinta otomotif.' },
];

const round5k = (n: number) => Math.round(n / 5000) * 5000;

async function main() {
  const organizers = await prisma.organizer.findMany({
    where: { username: { in: ORGANIZERS } },
    select: { id: true, username: true },
  });

  let created = 0;

  for (const [i, r] of ROWS.entries()) {
    const organizer = organizers.find((o) => o.username === ORGANIZERS[i % ORGANIZERS.length]);
    if (!organizer) continue;

    const slug = slugify(r.name, { lower: true, strict: true });
    if (await prisma.event.findUnique({ where: { slug } })) {
      console.log(`- ${slug} sudah ada, dilewati`);
      continue;
    }

    const offset = WITA.includes(r.city) ? '+08:00' : '+07:00';
    const startDate = new Date(`${r.date}T${r.time}:00${offset}`);
    const endDate = new Date(startDate.getTime() + r.hours * 3600000);
    const endSale = startDate;
    const paid = r.price > 0;
    const t = TIERS[r.category]!;

    let tickets;
    if (!paid) {
      tickets = [{ name: 'Free Ticket', price: 0, quota: r.seats, available: r.seats, endSale: null }];
    } else if (r.seats >= 500) {
      const q1 = Math.round(r.seats * 0.6);
      const q2 = Math.round(r.seats * 0.3);
      tickets = [
        { name: t.names[0], price: r.price, quota: q1, available: q1, endSale },
        { name: t.names[1], price: round5k(r.price * t.mult[0]), quota: q2, available: q2, endSale },
        { name: t.names[2], price: round5k(r.price * t.mult[1]), quota: r.seats - q1 - q2, available: r.seats - q1 - q2, endSale },
      ];
    } else {
      const q1 = Math.round(r.seats * 0.8);
      tickets = [
        { name: t.names[0], price: r.price, quota: q1, available: q1, endSale },
        { name: t.names[1], price: round5k(r.price * t.mult[0]), quota: r.seats - q1, available: r.seats - q1, endSale },
      ];
    }

    await prisma.event.create({
      data: {
        organizerId: organizer.id,
        name: r.name,
        slug,
        description: r.desc,
        category: r.category,
        city: r.city,
        venue: r.venue,
        imageUrl: unsplash(r.image),
        pricingType: paid ? 'PAID' : 'FREE',
        startDate,
        endDate,
        totalSeats: r.seats,
        availableSeats: r.seats,
        ticketTypes: { create: tickets },
      },
    });

    created++;
    console.log(`✔ ${r.date} ${r.time} ${r.category.padEnd(11)} ${paid ? 'PAID' : 'FREE'} ${tickets.length} tiket  ${slug}`);
  }

  console.log(`\n${created} event baru, total event sekarang: ${await prisma.event.count()}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
