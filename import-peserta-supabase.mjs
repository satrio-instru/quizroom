// Script untuk mengimport data PESERTA.md ke Supabase
// Jalankan: node import-peserta-supabase.mjs

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://jsnjwzvzjfkmzcjdvdsc.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impzbmp3enZ6amZrbXpjamR2ZHNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1NDQ1NzAsImV4cCI6MjA5ODEyMDU3MH0.zOryEYPW4zfPMJ4tc9iT_ekfl3Qb77bmEYHR3CVC5j4";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Data peserta dari PESERTA(1).md
const participants = [
  { npm: "2517041001", name: "Muhammad Ajie Wahyudi", date: "", day: "Hari 1", start_time: "15:00", duration_minutes: "20", end_time: "15:20" },
  { npm: "2517041001", name: "Nur Azizah", date: "", day: "Hari 1", start_time: "15:20", duration_minutes: "20", end_time: "15:40" },
  { npm: "2517041002", name: "Hesky Chandra Winata", date: "", day: "Hari 1", start_time: "15:40", duration_minutes: "20", end_time: "16:00" },
  { npm: "2517041003", name: "Nabil Ibnu Rasyid", date: "", day: "Hari 1", start_time: "16:00", duration_minutes: "20", end_time: "16:20" },
  { npm: "2517041004", name: "Alvira Faradilla", date: "", day: "Hari 1", start_time: "16:20", duration_minutes: "20", end_time: "16:40" },
  { npm: "2517041005", name: "Rahma Anisa", date: "", day: "Hari 1", start_time: "16:40", duration_minutes: "20", end_time: "17:00" },
  { npm: "2517041006", name: "Rasmawati Olivia", date: "", day: "Hari 1", start_time: "17:00", duration_minutes: "20", end_time: "17:20" },
  { npm: "2517041007", name: "Anisa Yulianti", date: "", day: "Hari 1", start_time: "17:20", duration_minutes: "20", end_time: "17:40" },
  { npm: "2517041008", name: "Rizky Melani", date: "", day: "Hari 1", start_time: "17:40", duration_minutes: "20", end_time: "18:00" },
  { npm: "2517041009", name: "Welisa Nastion", date: "", day: "Hari 1", start_time: "18:00", duration_minutes: "20", end_time: "18:20" },
  { npm: "2517041010", name: "Andi Fi'ijanatin Naim", date: "", day: "Hari 1", start_time: "18:20", duration_minutes: "20", end_time: "18:40" },
  { npm: "2517041012", name: "Resti Isnaini Putri", date: "", day: "Hari 1", start_time: "18:40", duration_minutes: "20", end_time: "19:00" },
  { npm: "2517041013", name: "Dafina Asila R", date: "", day: "Hari 1", start_time: "19:00", duration_minutes: "20", end_time: "19:20" },
  { npm: "2517041014", name: "Deni Satiawan", date: "", day: "Hari 1", start_time: "19:20", duration_minutes: "20", end_time: "19:40" },
  { npm: "2517041015", name: "Devia Zahra", date: "", day: "Hari 1", start_time: "19:40", duration_minutes: "20", end_time: "20:00" },
  { npm: "2517041016", name: "Serly Virna Agustina", date: "", day: "Hari 1", start_time: "20:00", duration_minutes: "20", end_time: "20:20" },
  { npm: "2517041017", name: "Ripka Natasya Saragih Sijabat", date: "", day: "Hari 1", start_time: "20:20", duration_minutes: "20", end_time: "20:40" },
  { npm: "2517041018", name: "Tomi Putra Aditia", date: "", day: "Hari 1", start_time: "20:40", duration_minutes: "20", end_time: "21:00" },
  { npm: "2517041019", name: "Tiara Azmi", date: "", day: "Hari 1", start_time: "21:00", duration_minutes: "20", end_time: "21:20" },
  { npm: "2517041020", name: "Bunga Mutiara Sari", date: "", day: "Hari 1", start_time: "21:20", duration_minutes: "20", end_time: "21:40" },
  { npm: "2517041021", name: "Rola Dwi Ananta", date: "", day: "Hari 1", start_time: "21:40", duration_minutes: "20", end_time: "22:00" },
  { npm: "2517041022", name: "Sefi Rahayu", date: "", day: "Hari 1", start_time: "22:00", duration_minutes: "20", end_time: "22:20" },
  { npm: "2517041023", name: "Safa Alentasya Rahmadina", date: "", day: "Hari 1", start_time: "22:20", duration_minutes: "20", end_time: "22:40" },
  { npm: "2517041024", name: "Abil Madani", date: "", day: "Hari 1", start_time: "22:40", duration_minutes: "20", end_time: "23:00" },
  { npm: "2517041025", name: "Eva Aulia Agustin", date: "", day: "Hari 1", start_time: "23:00", duration_minutes: "20", end_time: "23:20" },
  { npm: "2517041026", name: "Syahdam Arya Pranata", date: "", day: "Hari 1", start_time: "23:20", duration_minutes: "20", end_time: "23:40" },
  { npm: "2517041027", name: "Lestari Mukarramah", date: "", day: "Hari 1", start_time: "23:40", duration_minutes: "20", end_time: "00:00" },
  { npm: "2517041028", name: "Azaria Fadilah Herman", date: "", day: "Hari 2", start_time: "00:00", duration_minutes: "20", end_time: "00:20" },
  { npm: "2517041029", name: "Adelia Desfidia", date: "", day: "Hari 2", start_time: "00:20", duration_minutes: "20", end_time: "00:40" },
  { npm: "2517041030", name: "M. Rizaldy", date: "", day: "Hari 2", start_time: "00:40", duration_minutes: "20", end_time: "01:00" },
  { npm: "2517041031", name: "Fatimatuz Zahra", date: "", day: "Hari 2", start_time: "01:00", duration_minutes: "20", end_time: "01:20" },
  { npm: "2517041032", name: "Selsi Asri Ainun", date: "", day: "Hari 2", start_time: "01:20", duration_minutes: "20", end_time: "01:40" },
  { npm: "2517041033", name: "Areta Egus Pretiwi", date: "", day: "Hari 2", start_time: "01:40", duration_minutes: "20", end_time: "02:00" },
  { npm: "2517041034", name: "Jingga Newa Yeara", date: "", day: "Hari 2", start_time: "02:00", duration_minutes: "20", end_time: "02:20" },
  { npm: "2517041036", name: "Kurniawati", date: "", day: "Hari 2", start_time: "02:20", duration_minutes: "20", end_time: "02:40" },
  { npm: "2517041037", name: "Aura Desti Arifiana", date: "", day: "Hari 2", start_time: "02:40", duration_minutes: "20", end_time: "03:00" },
  { npm: "2517041038", name: "Usfur Natzifah", date: "", day: "Hari 2", start_time: "03:00", duration_minutes: "20", end_time: "03:20" },
  { npm: "2517041039", name: "Echa Perdiyana", date: "", day: "Hari 2", start_time: "03:20", duration_minutes: "20", end_time: "03:40" },
  { npm: "2517041040", name: "Bella Kania Puteri", date: "", day: "Hari 2", start_time: "03:40", duration_minutes: "20", end_time: "04:00" },
  { npm: "2517041041", name: "Amelia Putri Rizkia", date: "", day: "Hari 2", start_time: "04:00", duration_minutes: "20", end_time: "04:20" },
  { npm: "2517041042", name: "Cahaya Kayla Azizah", date: "", day: "Hari 2", start_time: "04:20", duration_minutes: "20", end_time: "04:40" },
  { npm: "2517041043", name: "Pingka Tantri Dewi", date: "", day: "Hari 2", start_time: "04:40", duration_minutes: "20", end_time: "05:00" },
  { npm: "2517041044", name: "Auliya Dwi Romadhoni", date: "", day: "Hari 2", start_time: "05:00", duration_minutes: "20", end_time: "05:20" },
  { npm: "2517041045", name: "U'Ul Rahmatul Ula", date: "", day: "Hari 2", start_time: "05:20", duration_minutes: "20", end_time: "05:40" },
  { npm: "2517041046", name: "Vinca Arianti", date: "", day: "Hari 2", start_time: "05:40", duration_minutes: "20", end_time: "06:00" },
  { npm: "2517041047", name: "Amelia Navisha Dewi", date: "", day: "Hari 2", start_time: "06:00", duration_minutes: "20", end_time: "06:20" },
  { npm: "2517041048", name: "Areta Yuka Aoi", date: "", day: "Hari 2", start_time: "06:20", duration_minutes: "20", end_time: "06:40" },
  { npm: "2517041049", name: "Naswa Saskia Ramadani", date: "", day: "Hari 2", start_time: "06:40", duration_minutes: "20", end_time: "07:00" },
  { npm: "2517041050", name: "Putri Novitania", date: "", day: "Hari 2", start_time: "07:00", duration_minutes: "20", end_time: "07:20" },
  { npm: "2517041051", name: "Arif Hidayat", date: "", day: "Hari 2", start_time: "07:20", duration_minutes: "20", end_time: "07:40" },
  { npm: "2517041052", name: "Novrida", date: "", day: "Hari 2", start_time: "07:40", duration_minutes: "20", end_time: "08:00" },
  { npm: "2517041053", name: "Vira Silfiana", date: "", day: "Hari 2", start_time: "08:00", duration_minutes: "20", end_time: "08:20" },
  { npm: "2517041054", name: "Sheryna Echa Radiva", date: "", day: "Hari 2", start_time: "08:20", duration_minutes: "20", end_time: "08:40" },
  { npm: "2517041055", name: "Amelia Annifa", date: "", day: "Hari 2", start_time: "08:40", duration_minutes: "20", end_time: "09:00" },
  { npm: "2517041056", name: "M. Habib Fahmi", date: "", day: "Hari 2", start_time: "09:00", duration_minutes: "20", end_time: "09:20" },
  { npm: "2517041057", name: "Padia Renata Aini", date: "", day: "Hari 2", start_time: "09:20", duration_minutes: "20", end_time: "09:40" },
  { npm: "2517041058", name: "Andira Amelia Putri", date: "", day: "Hari 2", start_time: "09:40", duration_minutes: "20", end_time: "10:00" },
  { npm: "2517041059", name: "Sandi Armansyah", date: "", day: "Hari 2", start_time: "10:00", duration_minutes: "20", end_time: "10:20" },
  { npm: "2517041060", name: "Cahya Rinda Arouffita", date: "", day: "Hari 2", start_time: "10:20", duration_minutes: "20", end_time: "10:40" },
  { npm: "2517041061", name: "Salsabilla Rossanda", date: "", day: "Hari 2", start_time: "10:40", duration_minutes: "20", end_time: "11:00" },
  { npm: "2517041062", name: "Nopia Sapitri", date: "", day: "Hari 2", start_time: "11:00", duration_minutes: "20", end_time: "11:20" },
  { npm: "2517041064", name: "Andrika", date: "", day: "Hari 2", start_time: "11:20", duration_minutes: "20", end_time: "11:40" },
  { npm: "2517041065", name: "Fadli Riansyah", date: "", day: "Hari 2", start_time: "11:40", duration_minutes: "20", end_time: "12:00" },
  { npm: "2517041066", name: "Chevi Oktaria Lokes Saragih Jawak", date: "", day: "Hari 2", start_time: "12:00", duration_minutes: "20", end_time: "12:20" },
  { npm: "2517041067", name: "Feisha Nadhira Mumtaza", date: "", day: "Hari 2", start_time: "12:20", duration_minutes: "20", end_time: "12:40" },
  { npm: "2517041068", name: "Alvaneza Bustari", date: "", day: "Hari 2", start_time: "12:40", duration_minutes: "20", end_time: "13:00" },
  { npm: "2517041069", name: "Putu Arika", date: "", day: "Hari 2", start_time: "13:00", duration_minutes: "20", end_time: "13:20" },
  { npm: "2517041070", name: "Alya Marshela Iswandi", date: "", day: "Hari 2", start_time: "13:20", duration_minutes: "20", end_time: "13:40" },
  { npm: "2517041071", name: "Elsa Nurcahyani", date: "", day: "Hari 2", start_time: "13:40", duration_minutes: "20", end_time: "14:00" },
  { npm: "2517041072", name: "Dhiya Hani", date: "", day: "Hari 2", start_time: "14:00", duration_minutes: "20", end_time: "14:20" },
  { npm: "2517041073", name: "Resta Isnaini Putri", date: "", day: "Hari 2", start_time: "14:20", duration_minutes: "20", end_time: "14:40" },
  { npm: "2517041075", name: "Andika Saputra", date: "", day: "Hari 2", start_time: "14:40", duration_minutes: "20", end_time: "15:00" },
  { npm: "2517041076", name: "Shafa Naila Alfi Barokah", date: "", day: "Hari 2", start_time: "15:00", duration_minutes: "20", end_time: "15:20" },
  { npm: "2517041078", name: "Arkhan Al Khozin", date: "", day: "Hari 2", start_time: "15:20", duration_minutes: "20", end_time: "15:40" },
  { npm: "2517041079", name: "Imas Lestari", date: "", day: "Hari 2", start_time: "15:40", duration_minutes: "20", end_time: "16:00" },
  { npm: "2517041080", name: "Pricsillya Jelisha", date: "", day: "Hari 2", start_time: "16:00", duration_minutes: "20", end_time: "16:20" },
  { npm: "2517041081", name: "Rahma Wulandari", date: "", day: "Hari 2", start_time: "16:20", duration_minutes: "20", end_time: "16:40" },
  { npm: "2517041082", name: "Delvia Simbolon", date: "", day: "Hari 2", start_time: "16:40", duration_minutes: "20", end_time: "17:00" },
  { npm: "2517041084", name: "Uliza Hanifatunisa", date: "", day: "Hari 2", start_time: "17:00", duration_minutes: "20", end_time: "17:20" },
  { npm: "2517041085", name: "Rika Rahmadani", date: "", day: "Hari 2", start_time: "17:20", duration_minutes: "20", end_time: "17:40" },
  { npm: "2517041087", name: "Pitra Pauzul Azim", date: "", day: "Hari 2", start_time: "17:40", duration_minutes: "20", end_time: "18:00" },
  { npm: "2517041088", name: "Grace Yuliana Ompusunggu", date: "", day: "Hari 2", start_time: "18:00", duration_minutes: "20", end_time: "18:20" },
  { npm: "2517041089", name: "Ambar Kusuma Wardani", date: "", day: "Hari 2", start_time: "18:20", duration_minutes: "20", end_time: "18:40" },
  { npm: "2517041090", name: "Carisa Yola Salsabila", date: "", day: "Hari 2", start_time: "18:40", duration_minutes: "20", end_time: "19:00" },
  { npm: "2517041091", name: "Raka Dwi Andika", date: "", day: "Hari 2", start_time: "19:00", duration_minutes: "20", end_time: "19:20" },
  { npm: "2517041092", name: "Annisa Maharani Salsabila", date: "", day: "Hari 2", start_time: "19:20", duration_minutes: "20", end_time: "19:40" },
  { npm: "2517041093", name: "Abdulloh Zaki Alim", date: "", day: "Hari 2", start_time: "19:40", duration_minutes: "20", end_time: "20:00" },
  { npm: "2517041094", name: "M Bima", date: "", day: "Hari 2", start_time: "20:00", duration_minutes: "20", end_time: "20:20" },
  { npm: "2517041095", name: "Incik Fitri Septilina", date: "", day: "Hari 2", start_time: "20:20", duration_minutes: "20", end_time: "20:40" },
  { npm: "2517041097", name: "Reza Falevi", date: "", day: "Hari 2", start_time: "20:40", duration_minutes: "20", end_time: "21:00" },
  { npm: "2517041098", name: "Shalomita Gracia Svetlana Noya", date: "", day: "Hari 2", start_time: "21:00", duration_minutes: "20", end_time: "21:20" },
  { npm: "2517041099", name: "Fitrah Adithya", date: "", day: "Hari 2", start_time: "21:20", duration_minutes: "20", end_time: "21:40" },
  { npm: "2517041100", name: "Dela Rosinta", date: "", day: "Hari 2", start_time: "21:40", duration_minutes: "20", end_time: "22:00" },
  { npm: "2517041101", name: "Silvia Mutiara Purnama Putri", date: "", day: "Hari 2", start_time: "22:00", duration_minutes: "20", end_time: "22:20" },
  { npm: "2557041001", name: "Pingga Retno Nurlani", date: "", day: "Hari 2", start_time: "22:20", duration_minutes: "20", end_time: "22:40" },
  { npm: "2317041068", name: "Febiyani Ayu Lestari", date: "", day: "Hari 2", start_time: "22:40", duration_minutes: "20", end_time: "23:00" },
];

async function main() {
  console.log(`Mengimport ${participants.length} peserta ke Supabase...`);
  console.log(`URL: ${SUPABASE_URL}`);

  // First, test connection
  const { data: testData, error: testError } = await supabase
    .from('participants')
    .select('count')
    .limit(1);

  if (testError) {
    console.error('❌ Gagal koneksi ke Supabase:', testError.message);
    console.error('Pastikan tabel "participants" sudah dibuat di Supabase SQL Editor.');
    process.exit(1);
  }

  console.log('✅ Koneksi ke Supabase berhasil!');

  // Clear existing data
  const { error: deleteError } = await supabase
    .from('participants')
    .delete()
    .neq('id', 0);

  if (deleteError) {
    console.error('❌ Gagal menghapus data lama:', deleteError.message);
    process.exit(1);
  }

  console.log('🗑️  Data lama dihapus.');

  // Insert new data in batches of 20
  const BATCH_SIZE = 20;
  let inserted = 0;

  for (let i = 0; i < participants.length; i += BATCH_SIZE) {
    const batch = participants.slice(i, i + BATCH_SIZE);
    const { error: insertError } = await supabase
      .from('participants')
      .insert(batch);

    if (insertError) {
      console.error(`❌ Gagal insert batch ${Math.floor(i / BATCH_SIZE) + 1}:`, insertError.message);
      process.exit(1);
    }

    inserted += batch.length;
    const pct = Math.round((inserted / participants.length) * 100);
    console.log(`✅ Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${inserted}/${participants.length} peserta (${pct}%)`);
  }

  console.log(`\n🎉 SELESAI! ${participants.length} peserta berhasil diimport ke Supabase!`);

  // Verify
  const { count } = await supabase
    .from('participants')
    .select('*', { count: 'exact', head: true });

  console.log(`📊 Total peserta di database: ${count}`);
}

main().catch(console.error);
