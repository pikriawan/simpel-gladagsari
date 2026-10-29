<?php

namespace Database\Seeders;

use App\Models\MarriageDispensation;
use Illuminate\Database\Seeder;

class MarriageDispensationSeeder extends Seeder
{
    public function run(): void
    {
        $villages = ['Kaligentong', 'Gladagsari', 'Jlarem', 'Kembang', 'Ngadirojo', 'Seboto', 'Sampetan', 'Candisari', 'Ngagrong', 'Ngargoloka'];

        $data = [
            ['letterNumber' => '474.2/156/6.20/2026', 'applicantName' => 'Muhammad Rifqi', 'partnerName' => 'Nem Painem', 'marriageDate' => '2026-10-16', 'villageName' => 'Kaligentong', 'createdAt' => '2026-10-16 12:34:00'],
            ['letterNumber' => '474.2/157/6.20/2026', 'applicantName' => 'Arya Suparman', 'partnerName' => 'Sumarni Ilham', 'marriageDate' => '2026-10-17', 'villageName' => 'Gladagsari', 'createdAt' => '2026-10-16 12:38:00'],
            ['letterNumber' => '474.2/158/6.20/2026', 'applicantName' => 'Purnama Tirta', 'partnerName' => 'Rahman Arya', 'marriageDate' => '2026-11-21', 'villageName' => 'Kaligentong', 'createdAt' => '2026-12-22 09:11:00'],
            ['letterNumber' => '474.2/159/6.20/2026', 'applicantName' => 'Siti Aisyah', 'partnerName' => 'Budi Santoso', 'marriageDate' => '2026-11-24', 'villageName' => 'Jlarem', 'createdAt' => '2026-12-23 10:42:00'],
            ['letterNumber' => '474.2/160/6.20/2026', 'applicantName' => 'Lestari Widyastuti', 'partnerName' => 'Andi Pratama', 'marriageDate' => '2026-11-28', 'villageName' => 'Kembang', 'createdAt' => '2026-12-24 11:15:00'],
            ['letterNumber' => '474.2/161/6.20/2026', 'applicantName' => 'Rina Maharani', 'partnerName' => 'Dedi Saputra', 'marriageDate' => '2026-12-01', 'villageName' => 'Ngadirojo', 'createdAt' => '2026-12-25 12:00:00'],
            ['letterNumber' => '474.2/162/6.20/2026', 'applicantName' => 'Adi Nugroho', 'partnerName' => 'Yuli Astuti', 'marriageDate' => '2026-12-05', 'villageName' => 'Gladagsari', 'createdAt' => '2026-12-26 13:28:00'],
            ['letterNumber' => '474.2/163/6.20/2026', 'applicantName' => 'Dina Putri', 'partnerName' => 'Rudi Hartono', 'marriageDate' => '2026-12-08', 'villageName' => 'Kaligentong', 'createdAt' => '2026-12-27 14:45:00'],
            ['letterNumber' => '474.2/164/6.20/2026', 'applicantName' => 'Eka Sari', 'partnerName' => 'Bagas Pradana', 'marriageDate' => '2026-12-12', 'villageName' => 'Ngagrong', 'createdAt' => '2026-12-28 15:10:00'],
            ['letterNumber' => '474.2/165/6.20/2026', 'applicantName' => 'Fajar Ramadhan', 'partnerName' => 'Vina Lestari', 'marriageDate' => '2026-12-15', 'villageName' => 'Seboto', 'createdAt' => '2026-12-29 16:33:00'],
            ['letterNumber' => '474.2/166/6.20/2026', 'applicantName' => 'Rina Amelia', 'partnerName' => 'Bambang Sutanto', 'marriageDate' => '2026-12-18', 'villageName' => 'Seboto', 'createdAt' => '2026-12-30 17:56:00'],
            ['letterNumber' => '474.2/167/6.20/2026', 'applicantName' => 'Tono Setiawan', 'partnerName' => 'Lili Sari', 'marriageDate' => '2026-12-22', 'villageName' => 'Sampetan', 'createdAt' => '2026-12-31 18:19:00'],
            ['letterNumber' => '474.2/168/6.20/2026', 'applicantName' => 'Dwi Cahyani', 'partnerName' => 'Rizki Wijaya', 'marriageDate' => '2026-12-25', 'villageName' => 'Candisari', 'createdAt' => '2027-01-01 19:02:00'],
            ['letterNumber' => '474.2/169/6.20/2026', 'applicantName' => 'Rendi Saputra', 'partnerName' => 'Ayu Lestari', 'marriageDate' => '2026-12-26', 'villageName' => 'Gladagsari', 'createdAt' => '2027-01-02 19:45:00'],
            ['letterNumber' => '474.2/170/6.20/2026', 'applicantName' => 'Sari Dewi', 'partnerName' => 'Imam Sutanto', 'marriageDate' => '2026-12-27', 'villageName' => 'Kaligentong', 'createdAt' => '2027-01-03 20:12:00'],
            ['letterNumber' => '474.2/171/6.20/2026', 'applicantName' => 'Budi Santoso', 'partnerName' => 'Rina Amelia', 'marriageDate' => '2026-12-28', 'villageName' => 'Ngargoloka', 'createdAt' => '2027-01-04 20:48:00'],
            ['letterNumber' => '474.2/172/6.20/2026', 'applicantName' => 'Lestari Widyastuti', 'partnerName' => 'Andi Pratama', 'marriageDate' => '2026-12-29', 'villageName' => 'Seboto', 'createdAt' => '2027-01-05 21:14:00'],
            ['letterNumber' => '474.2/173/6.20/2026', 'applicantName' => 'Purnama Tirta', 'partnerName' => 'Rahman Arya', 'marriageDate' => '2026-12-30', 'villageName' => 'Jlarem', 'createdAt' => '2027-01-06 21:40:00'],
            ['letterNumber' => '474.2/174/6.20/2026', 'applicantName' => 'Arya Suparman', 'partnerName' => 'Sumarni Ilham', 'marriageDate' => '2026-12-31', 'villageName' => 'Kembang', 'createdAt' => '2027-01-07 22:05:00'],
            ['letterNumber' => '474.2/175/6.20/2026', 'applicantName' => 'Slamet', 'partnerName' => 'Slomet', 'marriageDate' => '2027-01-01', 'villageName' => 'Ngagrong', 'createdAt' => '2027-01-08 22:30:00'],
            ['letterNumber' => '474.2/176/6.20/2026', 'applicantName' => 'Wahyu Santoso', 'partnerName' => 'Dewi Rahayu', 'marriageDate' => '2027-01-03', 'villageName' => 'Kaligentong', 'createdAt' => '2027-01-09 08:15:00'],
            ['letterNumber' => '474.2/177/6.20/2026', 'applicantName' => 'Hendra Kusuma', 'partnerName' => 'Fitri Handayani', 'marriageDate' => '2027-01-05', 'villageName' => 'Gladagsari', 'createdAt' => '2027-01-10 09:30:00'],
            ['letterNumber' => '474.2/178/6.20/2026', 'applicantName' => 'Nurul Hidayah', 'partnerName' => 'Agus Setiawan', 'marriageDate' => '2027-01-07', 'villageName' => 'Seboto', 'createdAt' => '2027-01-11 10:45:00'],
            ['letterNumber' => '474.2/179/6.20/2026', 'applicantName' => 'Rizal Fauzi', 'partnerName' => 'Sri Mulyani', 'marriageDate' => '2027-01-10', 'villageName' => 'Kembang', 'createdAt' => '2027-01-12 11:20:00'],
            ['letterNumber' => '474.2/180/6.20/2026', 'applicantName' => 'Maya Sari', 'partnerName' => 'Doni Prasetyo', 'marriageDate' => '2027-01-12', 'villageName' => 'Sampetan', 'createdAt' => '2027-01-13 13:55:00'],
        ];

        foreach ($data as $item) {
            MarriageDispensation::create([
                'letter_number'            => $item['letterNumber'],
                'village'                  => $item['villageName'],
                'reference_letter_number'  => null,
                'letter_date'              => null,
                'applicant_name'           => $item['applicantName'],
                'applicant_birth_place_date' => 'Boyolali, 1 Januari 2006',
                'subvillage'               => 'Belang Kidul',
                'rt'                       => '001',
                'rw'                       => '001',
                'marriage_date'            => $item['marriageDate'],
                'partner_name'             => $item['partnerName'],
                'partner_birth_place_date' => 'Boyolali, 1 Januari 2000',
                'religion'                 => 'Islam',
                'partner_address'          => 'Banjaran, RT001/RW001, Desa Candisari, Kec. Gladagsari',
                'created_at'               => $item['createdAt'],
                'updated_at'               => $item['createdAt'],
            ]);
        }
    }
}
