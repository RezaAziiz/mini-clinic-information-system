# Mini Clinic Information System

Sistem Informasi Klinik Pratama untuk mengelola pasien, pendaftaran kunjungan, antrean, dan rekam medis.

## Asumsi Desain & Bisnis (Berdasarkan Use Case Diagram)

Berdasarkan *Use Case Diagram*, terdapat pembatasan hak akses (Role-Based Access Control) yang diterapkan secara ketat:
1. **Master Data Pasien (`/api/patients`)**
   - **HANYA** dapat diakses oleh role `Administrator` dan `Petugas Pendaftaran`. 
   - Ini mencakup seluruh operasi CRUD (Melihat daftar pasien, melihat detail pasien, menambah, mengubah, dan menghapus).
   - **Catatan:** Sesuai *Use Case Diagram*, role `Dokter` tidak memiliki akses (panah) ke modul "Mengelola Data Pasien". Oleh karena itu, jika dokter memerlukan informasi pasien saat pemeriksaan, data pasien akan di-*embed* (disertakan) di dalam respon modul `Registration` atau `Medical Record`, sehingga dokter tidak memerlukan hak akses ke tabel master data pasien.

*(Dokumentasi README ini akan dilengkapi seiring berjalannya proses pengembangan)*
