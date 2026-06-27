import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://jsnjwzvzjfkmzcjdvdsc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impzbmp3enZ6amZrbXpjamR2ZHNjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjU0NDU3MCwiZXhwIjoyMDk4MTIwNTcwfQ.n8jOFrvx9QgXHwlswUtwru3lu0pKTrDevOl2gD87x_c'
);

const SET_NAME = 'UAP';
const SET_DESCRIPTION = 'UAP — Praktikum Teknologi Informasi (50 soal, 5 modul)';

const questions = [
  // MODUL I — USER INTERFACE (FIGMA)
  { n:1, t:"Pernyataan yang paling tepat mengenai user interface (UI) dan hubungannya dengan user experience (UX) adalah ...", d:"Modul I - UI/Figma", a:"UI hanya mengatur penyimpanan data, sedangkan UX mengatur jaringan komputer.", b:"UI merupakan bagian visual dan interaktif sistem yang membantu pengguna memperoleh pengalaman penggunaan yang mudah dan intuitif.", c:"UI adalah perangkat keras masukan, sedangkan UX adalah perangkat keras keluaran.", d:"UI dan UX hanya digunakan dalam aplikasi berbasis terminal.", ans:1 },
  { n:2, t:"Kelompok elemen yang termasuk unsur visual dalam perancangan UI adalah ...", d:"Modul I - UI/Figma", a:"Alamat IP, subnet mask, gateway, dan DNS.", b:"Database, tabel, query, dan server.", c:"Palet warna, tipografi, layout, gambar, ikon, dan animasi.", d:"Kabel UTP, konektor RJ45, hub, dan crimping tool.", ans:2 },
  { n:3, t:"Kesesuaian layout dengan rasio ukuran perangkat penting karena ...", d:"Modul I - UI/Figma", a:"tampilan harus tetap proporsional dan mudah digunakan pada ukuran layar yang berbeda.", b:"semua perangkat memiliki resolusi dan orientasi layar yang sama.", c:"layout hanya berfungsi untuk menentukan nama berkas.", d:"rasio layar menentukan kecepatan koneksi internet.", ans:0 },
  { n:4, t:"Manfaat utama kolaborasi real-time dan penyimpanan cloud pada Figma adalah ...", d:"Modul I - UI/Figma", a:"desain hanya dapat dibuka oleh satu pengguna dan harus disimpan manual.", b:"pengguna dapat bekerja bersama pada satu berkas serta mengaksesnya dari berbagai tempat.", c:"Figma dapat digunakan tanpa internet dalam seluruh kondisi.", d:"seluruh desain otomatis diubah menjadi aplikasi tanpa proses pengembangan.", ans:1 },
  { n:5, t:"Fungsi reusable components pada Figma adalah ...", d:"Modul I - UI/Figma", a:"menghapus seluruh layer yang tidak terpakai.", b:"mengubah desain raster menjadi video.", c:"menyimpan kata sandi pengguna.", d:"menggunakan kembali elemen seperti tombol dan header agar desain konsisten dan lebih cepat dibuat.", ans:3 },
  { n:6, t:"Pasangan fungsi bagian halaman kerja Figma yang benar adalah ...", d:"Modul I - UI/Figma", a:"Canvas untuk mengatur akun; Toolbar untuk menyimpan database.", b:"Layers Panel untuk mengatur struktur elemen; Properties Panel untuk menyesuaikan atribut elemen.", c:"Properties Panel untuk membuka browser; Canvas untuk menjalankan server.", d:"Toolbar untuk mengatur alamat IP; Layers Panel untuk menguji kabel.", ans:1 },
  { n:7, t:"Prototype Panel digunakan untuk ...", d:"Modul I - UI/Figma", a:"membuat interaksi antarhalaman atau antarelemen agar alur pengguna dapat disimulasikan.", b:"mengompresi gambar menjadi berkas ZIP.", c:"mengatur konfigurasi jaringan komputer.", d:"membuat basis data relasional.", ans:0 },
  { n:8, t:"Pernyataan yang menunjukkan satu keunggulan dan satu kelemahan Figma adalah ...", d:"Modul I - UI/Figma", a:"Dapat berkolaborasi secara langsung, tetapi membutuhkan koneksi internet yang stabil.", b:"Tidak mendukung prototipe, tetapi sangat baik untuk manipulasi foto kompleks.", c:"Hanya dapat digunakan satu pengguna, tetapi seluruh fiturnya gratis tanpa batas.", d:"Tidak memiliki plugin, tetapi selalu cepat untuk berkas berukuran besar.", ans:0 },
  { n:9, t:"Urutan tindakan yang tepat untuk membuat objek, menambahkan teks, dan memasukkan gambar ke Figma adalah ...", d:"Modul I - UI/Figma", a:"Pilih tool bentuk pada Toolbar, pilih Text untuk menulis, lalu gunakan Image/Video atau drag and drop untuk gambar.", b:"Buka Properties Panel, jalankan ipconfig, lalu pilih Export.", c:"Klik Account, buat database, lalu pilih Prototype.", d:"Klik Save As, aktifkan Apache, lalu pilih Rectangle.", ans:0 },
  { n:10, t:"Prosedur ekspor desain Figma yang tepat adalah ...", d:"Modul I - UI/Figma", a:"Buka Layers Panel, pilih Compile, lalu ekspor sebagai DOCX.", b:"Gulir Properties Panel ke bagian Export, klik tanda +, pilih format, lalu klik Export dan Save.", c:"Buka Prototype Panel, pilih alamat IP, lalu klik Upload.", d:"Klik Account, pilih Database, lalu simpan sebagai EXE.", ans:1 },

  // MODUL II — MEDIA TRANSMISI BERKABEL
  { n:11, t:"Pasangan contoh media transmisi berkabel dan nirkabel yang benar adalah ...", d:"Modul II - Media Transmisi", a:"Berkabel: twisted pair, coaxial, fiber optik; nirkabel: gelombang mikro, satelit, inframerah.", b:"Berkabel: satelit, laser, inframerah; nirkabel: UTP, STP, coaxial.", c:"Berkabel: Bluetooth, Wi-Fi, satelit; nirkabel: RJ45, hub, switch.", d:"Berkabel: IPv4, IPv6, DNS; nirkabel: HTML, CSS, JSON.", ans:0 },
  { n:12, t:"Tujuan dua konduktor pada kabel twisted pair dibuat berpilin adalah ...", d:"Modul II - Media Transmisi", a:"menambah panjang fisik kabel.", b:"mengurangi interferensi elektromagnetik dan crosstalk.", c:"mengubah sinyal listrik menjadi cahaya.", d:"menggantikan fungsi konektor RJ45.", ans:1 },
  { n:13, t:"Perbedaan utama UTP dan STP adalah ...", d:"Modul II - Media Transmisi", a:"UTP memiliki pelindung logam, sedangkan STP tidak memiliki pelindung.", b:"STP memiliki pelindung terhadap interferensi, tetapi umumnya lebih mahal daripada UTP.", c:"UTP hanya digunakan untuk fiber optik, sedangkan STP untuk satelit.", d:"STP tidak dapat mengirimkan data digital.", ans:1 },
  { n:14, t:"Penggunaan kabel straight dan crossover yang tepat adalah ...", d:"Modul II - Media Transmisi", a:"Straight untuk client ke hub/router; crossover untuk client ke client atau hub ke hub.", b:"Straight untuk client ke client; crossover untuk client ke router.", c:"Straight hanya untuk printer; crossover hanya untuk modem.", d:"Keduanya hanya digunakan untuk menghubungkan fiber optik.", ans:0 },
  { n:15, t:"Urutan warna standar pada kedua ujung kabel straight dalam modul adalah ...", d:"Modul II - Media Transmisi", a:"Putih-hijau, hijau, putih-oranye, biru, putih-biru, oranye, putih-cokelat, cokelat.", b:"Putih-oranye, oranye, putih-hijau, biru, putih-biru, hijau, putih-cokelat, cokelat.", c:"Putih-biru, biru, putih-hijau, hijau, putih-oranye, oranye, putih-cokelat, cokelat.", d:"Cokelat, putih-cokelat, hijau, putih-biru, biru, putih-hijau, oranye, putih-oranye.", ans:1 },
  { n:16, t:"Urutan warna pada ujung crossover yang berbeda dari susunan straight adalah ...", d:"Modul II - Media Transmisi", a:"Putih-hijau, hijau, putih-oranye, biru, putih-biru, oranye, putih-cokelat, cokelat.", b:"Putih-oranye, oranye, putih-hijau, biru, putih-biru, hijau, putih-cokelat, cokelat.", c:"Putih-cokelat, cokelat, putih-biru, biru, putih-hijau, hijau, putih-oranye, oranye.", d:"Biru, putih-biru, oranye, putih-oranye, hijau, putih-hijau, cokelat, putih-cokelat.", ans:2 },
  { n:17, t:"Pola cable tester yang menunjukkan kabel terpasang benar adalah ...", d:"Modul II - Media Transmisi", a:"Straight: 1–8 acak; crossover: seluruh lampu mati.", b:"Straight: 1-1 sampai 8-8; crossover: 1-3, 2-6, 3-1, 4-4, 5-5, 6-2, 7-7, 8-8.", c:"Straight dan crossover harus menunjukkan 1-3 pada seluruh pin.", d:"Straight: hanya pin 1 dan 2; crossover: hanya pin 7 dan 8.", ans:1 },
  { n:18, t:"Cara kerja hub yang benar adalah ...", d:"Modul II - Media Transmisi", a:"Memeriksa alamat tujuan dan hanya mengirim data ke satu port.", b:"Menyimpan situs web dan menjalankan basis data.", c:"Menerima data dari satu port lalu menyiarkannya ke semua port sehingga collision dapat terjadi; hub bekerja pada Physical Layer.", d:"Mengubah IPv4 menjadi IPv6 secara otomatis.", ans:2 },
  { n:19, t:"Pernyataan yang benar mengenai IP Address adalah ...", d:"Modul II - Media Transmisi", a:"IPv4 menggunakan 128-bit dan IPv6 menggunakan 32-bit.", b:"IP statis selalu diberikan DHCP dan berubah setiap saat.", c:"IPv4 menggunakan 32-bit, IPv6 menggunakan 128-bit; IP statis diatur manual sedangkan IP dinamis diberikan DHCP.", d:"IPv6 tidak mendukung konfigurasi otomatis.", ans:2 },
  { n:20, t:"Langkah yang tepat untuk mengatur dan menguji IPv4 secara manual di Windows adalah ...", d:"Modul II - Media Transmisi", a:"Buka TCP/IPv4 Properties, pilih Use the following IP address, isi IP, subnet mask, gateway dan DNS, lalu uji dengan ping google.com.", b:"Buka Figma, pilih Frame, lalu jalankan git push.", c:"Buka phpMyAdmin, buat tabel, lalu jalankan ping localhost.", d:"Buka browser, ubah HTML, lalu pasang RJ45.", ans:0 },

  // MODUL III — HTML DASAR
  { n:21, t:"Hubungan HTML dan CSS dalam pembuatan halaman web adalah ...", d:"Modul III - HTML/CSS", a:"HTML menyusun struktur dan konten, sedangkan CSS mengatur tampilannya.", b:"HTML mengatur jaringan, sedangkan CSS mengatur alamat IP.", c:"HTML menyimpan database, sedangkan CSS menjalankan server.", d:"HTML dan CSS hanya digunakan untuk mengedit gambar.", ans:0 },
  { n:22, t:"Fungsi elemen struktur dasar HTML yang benar adalah ...", d:"Modul III - HTML/CSS", a:"<head> menampilkan seluruh isi utama halaman, sedangkan <body> menyimpan metadata.", b:"<!DOCTYPE html> menyatakan jenis dokumen, <title> menentukan judul tab, dan <body> memuat konten halaman.", c:"<html> hanya digunakan untuk menampilkan gambar.", d:"<title> digunakan untuk membuat database.", ans:1 },
  { n:23, t:"Urutan pembuatan berkas HTML menggunakan Visual Studio Code adalah ...", d:"Modul III - HTML/CSS", a:"Buka New File, tulis kode, simpan sebagai berkas .html, lalu buka berkas melalui browser.", b:"Buka XAMPP, buat database, lalu simpan sebagai .fig.", c:"Buat repository, pasang RJ45, lalu buka dengan cable tester.", d:"Pilih Prototype, ekspor PDF, lalu jalankan Apache.", ans:0 },
  { n:24, t:"Pernyataan yang benar mengenai tag heading HTML adalah ...", d:"Modul III - HTML/CSS", a:"<h1> merupakan heading terbesar dan <h6> merupakan heading terkecil.", b:"<h6> merupakan heading terbesar dan <h1> merupakan heading terkecil.", c:"Semua heading selalu tampil dengan ukuran yang sama.", d:"Tag heading hanya dapat digunakan di dalam <title>.", ans:0 },
  { n:25, t:"Tag yang tepat untuk membuat paragraf adalah ...", d:"Modul III - HTML/CSS", a:"<p>Isi paragraf</p>", b:"<h1>Isi paragraf</h1>", c:"<img>Isi paragraf</img>", d:"<hr>Isi paragraf</hr>", ans:0 },
  { n:26, t:"Perbedaan penggunaan <hr> dan text-decoration: underline adalah ...", d:"Modul III - HTML/CSS", a:"<hr> membuat garis horizontal terpisah, sedangkan underline memberi garis bawah pada teks.", b:"<hr> memberi warna teks, sedangkan underline memasukkan gambar.", c:"<hr> membuat paragraf, sedangkan underline membuat database.", d:"Keduanya hanya digunakan untuk mengatur alamat URL.", ans:0 },
  { n:27, t:"Sintaks inline CSS yang benar untuk teks merah dengan latar belakang kuning adalah ...", d:"Modul III - HTML/CSS", a:"style=\"font:red; background:yellow-text;\"", b:"style=\"color: red; background-color: yellow;\"", c:"css=\"red; yellow;\"", d:"style=\"text-color=red; bg-color=yellow;\"", ans:1 },
  { n:28, t:"Fungsi tag <img> dan atribut src adalah ...", d:"Modul III - HTML/CSS", a:"<img> membuat tabel dan src mengatur jumlah baris.", b:"<img> menampilkan gambar dan src menentukan alamat atau path berkas gambar.", c:"<img> membuat hyperlink dan src menentukan warna.", d:"<img> membuat heading dan src menentukan ukuran huruf.", ans:1 },
  { n:29, t:"Nama berkas gambar dapat langsung ditulis pada atribut src apabila ...", d:"Modul III - HTML/CSS", a:"gambar dan berkas HTML berada dalam folder yang sama.", b:"gambar disimpan pada komputer lain tanpa alamat URL.", c:"berkas HTML belum disimpan.", d:"browser tidak memiliki koneksi internet.", ans:0 },
  { n:30, t:"Potongan kode yang benar untuk menampilkan judul, paragraf, dan gambar foto.jpg adalah ...", d:"Modul III - HTML/CSS", a:"<h1>Judul</h1><p>Paragraf</p><img src=\"foto.jpg\" />", b:"<title>Judul</title><paragraph>Paragraf</paragraph><image>foto.jpg</image>", c:"<h1 src=\"foto.jpg\">Judul</h1><p image>Paragraf</p>", d:"<img>foto.jpg</img><text>Paragraf</text>", ans:0 },

  // MODUL IV — WEB STATIS & NoSQL
  { n:31, t:"Tujuan utama integrasi website statis, JSON, dan GitHub Pages dalam modul adalah ...", d:"Modul IV - Web Statis/NoSQL", a:"membuat website statis yang mengambil data dari JSON dan memublikasikannya secara daring melalui GitHub Pages.", b:"membangun jaringan kabel crossover untuk server.", c:"membuat desain UI tanpa kode menggunakan Figma.", d:"menginstal WordPress pada localhost.", ans:0 },
  { n:32, t:"JSON dapat digunakan sebagai representasi database NoSQL untuk website statis karena ...", d:"Modul IV - Web Statis/NoSQL", a:"JSON hanya dapat menyimpan gambar.", b:"JSON fleksibel, tidak bergantung pada skema relasional, dan mudah diperbarui tanpa mengubah seluruh kode utama.", c:"JSON wajib dijalankan melalui MySQL.", d:"JSON hanya dapat digunakan pada aplikasi desktop.", ans:1 },
  { n:33, t:"Fungsi ekstensi Prettier dan Live Server adalah ...", d:"Modul IV - Web Statis/NoSQL", a:"Prettier untuk koreksi/penataan sintaks, Live Server untuk menyimulasikan website pada browser.", b:"Prettier untuk membuat database, Live Server untuk memasang kabel.", c:"Prettier untuk desain gambar, Live Server untuk mengubah IP.", d:"Prettier untuk kompresi ZIP, Live Server untuk membuat akun GitHub.", ans:0 },
  { n:34, t:"Langkah yang tepat untuk menjalankan template website melalui VS Code adalah ...", d:"Modul IV - Web Statis/NoSQL", a:"Buka folder template, pilih public_html/index.html, instal Live Server, lalu pilih Open with Live Server.", b:"Buka XAMPP, pilih phpMyAdmin, lalu klik Create Database.", c:"Buka Figma, pilih Frame, lalu klik Prototype.", d:"Buka CMD, jalankan ipconfig, lalu klik Export.", ans:0 },
  { n:35, t:"Nama repository yang ditentukan dalam modul untuk deployment adalah ...", d:"Modul IV - Web Statis/NoSQL", a:"wordpress_local", b:"figma_project", c:"website_statis", d:"database_mysql", ans:2 },
  { n:36, t:"Bentuk URL GitHub Pages hasil deployment yang sesuai modul adalah ...", d:"Modul IV - Web Statis/NoSQL", a:"https://username.github.io/website_statis", b:"http://localhost/website_statis/wp-admin", c:"https://github.com/localhost/index.html", d:"ftp://username/website_statis", ans:0 },
  { n:37, t:"Aturan penulisan key-value JSON yang benar adalah ...", d:"Modul IV - Web Statis/NoSQL", a:"Key adalah nilai akhir, sedangkan value selalu nama folder.", b:"Nilai string ditulis tanpa tanda petik dan angka wajib memakai tanda petik.", c:"Key menjadi penanda data; nilai string memakai tanda petik, sedangkan nilai numerik tidak harus memakai tanda petik.", d:"Semua key dan value harus berupa tag HTML.", ans:2 },
  { n:38, t:"Hubungan id HTML, document.getElementById(...).innerText, dan key JSON yang benar adalah ...", d:"Modul IV - Web Statis/NoSQL", a:"id memilih elemen HTML, kemudian JavaScript mengisi teks elemen tersebut dengan value dari key JSON.", b:"id digunakan untuk menentukan alamat IP perangkat.", c:"innerText digunakan untuk mengunggah repository ke GitHub.", d:"Key JSON hanya berfungsi untuk mengatur warna CSS.", ans:0 },
  { n:39, t:"Perubahan pada JSON di localhost belum muncul pada website GitHub Pages karena ...", d:"Modul IV - Web Statis/NoSQL", a:"GitHub Pages tidak mendukung HTML.", b:"perubahan lokal belum dikirim ke repository; berkas harus dideploy atau di-push kembali.", c:"JSON hanya dapat dibaca oleh WordPress.", d:"browser harus diganti menjadi cable tester.", ans:1 },
  { n:40, t:"Ketentuan utama tugas proyek pada modul ini adalah ...", d:"Modul IV - Web Statis/NoSQL", a:"Membiarkan seluruh teks dan gambar bawaan tanpa perubahan.", b:"Mengubah konten sesuai pilihan proyek, menggunakan JSON, menyesuaikan gambar/CSS bila diperlukan, lalu melakukan deployment ulang.", c:"Hanya mengganti nama repository tanpa mengubah isi website.", d:"Menghapus HTML dan menggunakan dokumen Word sebagai halaman utama.", ans:1 },

  // MODUL V — WORDPRESS
  { n:41, t:"Pernyataan yang paling tepat mengenai blog adalah ...", d:"Modul V - WordPress", a:"Blog adalah website yang memuat informasi berkembang, biasanya memiliki konten utama, arsip, komentar, tag, dan tautan terkait.", b:"Blog hanya dapat berisi satu gambar tanpa teks.", c:"Blog adalah perangkat untuk menguji kabel jaringan.", d:"Blog hanya dapat dibuat menggunakan HTML tanpa CMS.", ans:0 },
  { n:42, t:"WordPress dalam modul dijelaskan sebagai ...", d:"Modul V - WordPress", a:"software desain raster berbayar.", b:"CMS open source dan gratis yang berbasis PHP dan MySQL.", c:"perangkat keras jaringan pada Physical Layer.", d:"bahasa pemrograman pengganti HTML.", ans:1 },
  { n:43, t:"Pasangan fungsi komponen lingkungan WordPress lokal yang benar adalah ...", d:"Modul V - WordPress", a:"Apache sebagai web server, MySQL sebagai database, phpMyAdmin untuk mengelola database, dan browser untuk mengakses situs.", b:"Apache untuk desain UI, MySQL untuk membuat kabel, phpMyAdmin untuk ekspor gambar.", c:"XAMPP hanya digunakan untuk mengedit artikel daring.", d:"Browser berfungsi menggantikan database MySQL.", ans:0 },
  { n:44, t:"Ketentuan instalasi XAMPP yang sesuai modul adalah ...", d:"Modul V - WordPress", a:"Memasang ke C:\\xampp\\, memilih komponen, memilih bahasa English, dan menghilangkan centang informasi Bitnami.", b:"Memasang ke folder public_html, memilih bahasa HTML, dan mengaktifkan GitHub Pages.", c:"Memasang ke htdocs\\wordpress, lalu menjalankan cable tester.", d:"Memasang hanya MySQL tanpa Apache.", ans:0 },
  { n:45, t:"Apache dan MySQL dinyatakan aktif apabila ...", d:"Modul V - WordPress", a:"keduanya menampilkan indikator Running setelah tombol Start diklik.", b:"browser menampilkan halaman GitHub.", c:"Figma membuka Prototype Panel.", d:"CMD menampilkan alamat IPv6.", ans:0 },
  { n:46, t:"Langkah membuat database WordPress melalui phpMyAdmin adalah ...", d:"Modul V - WordPress", a:"Buka localhost, pilih phpMyAdmin, klik Baru, masukkan nama basis data, lalu klik Buat.", b:"Buka Figma, klik New Frame, lalu simpan sebagai JSON.", c:"Buka GitHub, buat repository wp_lab, lalu klik Pages.", d:"Buka CMD, ketik ping wp_lab.", ans:0 },
  { n:47, t:"Berkas WordPress harus diekstrak ke folder htdocs karena ...", d:"Modul V - WordPress", a:"htdocs merupakan lokasi berkas yang dijalankan oleh web server lokal; nama folder membentuk alamat seperti localhost/lab.", b:"htdocs adalah tempat khusus penyimpanan desain Figma.", c:"htdocs digunakan untuk memasang konektor RJ45.", d:"htdocs hanya menyimpan konfigurasi IP.", ans:0 },
  { n:48, t:"Pada tahap konfigurasi WordPress, informasi yang harus disesuaikan terutama adalah ...", d:"Modul V - WordPress", a:"nama database dan data akses database lokal.", b:"alamat GitHub Pages dan token Figma.", c:"urutan warna kabel crossover.", d:"ukuran frame dan format ekspor SVG.", ans:0 },
  { n:49, t:"Prosedur pengelolaan artikel WordPress yang tepat adalah ...", d:"Modul V - WordPress", a:"Pilih Posts > Add New, isi judul dan artikel, tambahkan kategori serta tag, lalu Publish; gambar dan berkas dapat ditambahkan melalui block Image dan File.", b:"Pilih Appearance > Theme untuk membuat database.", c:"Pilih Settings > General untuk memasang konektor RJ45.", d:"Pilih Pages > Add New lalu jalankan ipconfig.", ans:0 },
  { n:50, t:"Cara membuat halaman baru dan mengganti tema WordPress adalah ...", d:"Modul V - WordPress", a:"Gunakan Pages > Add New untuk halaman, lalu Appearance > Themes untuk memilih dan mengaktifkan tema.", b:"Gunakan Posts > Tags untuk halaman, lalu phpMyAdmin untuk mengganti tema.", c:"Gunakan XAMPP Control Panel untuk membuat halaman dan CMD untuk mengganti tema.", d:"Gunakan Figma Prototype untuk membuat halaman dan GitHub Pages untuk mengganti tema.", ans:0 },
];

async function main() {
  console.log(`Importing ${questions.length} questions to Supabase...`);

  // 1. Create question set
  const { error: setErr } = await supabase
    .from('question_sets')
    .upsert({ name: SET_NAME, description: SET_DESCRIPTION }, { onConflict: 'name' });

  if (setErr) {
    console.error('Error creating question set:', setErr.message);
    process.exit(1);
  }
  console.log('✅ Question set "UAP" created');

  // 2. Delete existing questions for this set
  await supabase.from('questions').delete().eq('set_name', SET_NAME);
  console.log('🗑️ Old questions cleared');

  // 3. Insert questions in batches
  const rows = questions.map(q => ({
    set_name: SET_NAME,
    question_number: q.n,
    title: q.t,
    description: q.d,
    option_a: q.a,
    option_b: q.b,
    option_c: q.c,
    option_d: q.d,
    correct_answer: q.ans,
  }));

  const BATCH = 20;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error } = await supabase.from('questions').insert(batch);
    if (error) {
      console.error(`Error batch ${Math.floor(i/BATCH)+1}:`, error.message);
      process.exit(1);
    }
    console.log(`✅ Batch ${Math.floor(i/BATCH)+1}: ${Math.min(i+BATCH, rows.length)}/${rows.length}`);
  }

  // Verify
  const { count } = await supabase.from('questions').select('*', { count: 'exact', head: true }).eq('set_name', SET_NAME);
  console.log(`\n🎉 Done! ${count} questions imported to set "${SET_NAME}"`);
}

main().catch(console.error);
