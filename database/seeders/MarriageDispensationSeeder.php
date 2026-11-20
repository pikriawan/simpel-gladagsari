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
            ['letterNumber' => '474.2/158/6.20/2026', 'applicantName' => 'Purnama Tirta', 'partnerName' => 'Rahman Arya', 'marriageDate' => '2026-10-18', 'villageName' => 'Kaligentong', 'createdAt' => '2026-10-17 09:11:00'],
            ['letterNumber' => '474.2/159/6.20/2026', 'applicantName' => 'Siti Aisyah', 'partnerName' => 'Budi Santoso', 'marriageDate' => '2026-10-20', 'villageName' => 'Jlarem', 'createdAt' => '2026-10-18 10:42:00'],
            ['letterNumber' => '474.2/160/6.20/2026', 'applicantName' => 'Lestari Widyastuti', 'partnerName' => 'Andi Pratama', 'marriageDate' => '2026-10-22', 'villageName' => 'Kembang', 'createdAt' => '2026-10-19 11:15:00'],
            ['letterNumber' => '474.2/161/6.20/2026', 'applicantName' => 'Rina Maharani', 'partnerName' => 'Dedi Saputra', 'marriageDate' => '2026-10-25', 'villageName' => 'Ngadirojo', 'createdAt' => '2026-10-20 12:00:00'],
            ['letterNumber' => '474.2/162/6.20/2026', 'applicantName' => 'Adi Nugroho', 'partnerName' => 'Yuli Astuti', 'marriageDate' => '2026-10-28', 'villageName' => 'Gladagsari', 'createdAt' => '2026-10-21 13:28:00'],
            ['letterNumber' => '474.2/163/6.20/2026', 'applicantName' => 'Dina Putri', 'partnerName' => 'Rudi Hartono', 'marriageDate' => '2026-10-30', 'villageName' => 'Kaligentong', 'createdAt' => '2026-10-22 14:45:00'],
            ['letterNumber' => '474.2/164/6.20/2026', 'applicantName' => 'Eka Sari', 'partnerName' => 'Bagas Pradana', 'marriageDate' => '2026-11-01', 'villageName' => 'Ngagrong', 'createdAt' => '2026-10-23 15:10:00'],
            ['letterNumber' => '474.2/165/6.20/2026', 'applicantName' => 'Fajar Ramadhan', 'partnerName' => 'Vina Lestari', 'marriageDate' => '2026-11-03', 'villageName' => 'Seboto', 'createdAt' => '2026-10-24 16:33:00'],
            ['letterNumber' => '474.2/166/6.20/2026', 'applicantName' => 'Rina Amelia', 'partnerName' => 'Bambang Sutanto', 'marriageDate' => '2026-11-05', 'villageName' => 'Seboto', 'createdAt' => '2026-10-25 17:56:00'],
            ['letterNumber' => '474.2/167/6.20/2026', 'applicantName' => 'Tono Setiawan', 'partnerName' => 'Lili Sari', 'marriageDate' => '2026-11-08', 'villageName' => 'Sampetan', 'createdAt' => '2026-10-26 18:19:00'],
            ['letterNumber' => '474.2/168/6.20/2026', 'applicantName' => 'Dwi Cahyani', 'partnerName' => 'Rizki Wijaya', 'marriageDate' => '2026-11-10', 'villageName' => 'Candisari', 'createdAt' => '2026-10-27 19:02:00'],
            ['letterNumber' => '474.2/169/6.20/2026', 'applicantName' => 'Rendi Saputra', 'partnerName' => 'Ayu Lestari', 'marriageDate' => '2026-11-12', 'villageName' => 'Gladagsari', 'createdAt' => '2026-10-28 19:45:00'],
            ['letterNumber' => '474.2/170/6.20/2026', 'applicantName' => 'Sari Dewi', 'partnerName' => 'Imam Sutanto', 'marriageDate' => '2026-11-14', 'villageName' => 'Kaligentong', 'createdAt' => '2026-10-29 20:12:00'],
            ['letterNumber' => '474.2/171/6.20/2026', 'applicantName' => 'Budi Santoso', 'partnerName' => 'Rina Amelia', 'marriageDate' => '2026-11-15', 'villageName' => 'Ngargoloka', 'createdAt' => '2026-10-30 20:48:00'],
            ['letterNumber' => '474.2/172/6.20/2026', 'applicantName' => 'Lestari Widyastuti', 'partnerName' => 'Andi Pratama', 'marriageDate' => '2026-11-16', 'villageName' => 'Seboto', 'createdAt' => '2026-10-31 21:14:00'],
            ['letterNumber' => '474.2/173/6.20/2026', 'applicantName' => 'Purnama Tirta', 'partnerName' => 'Rahman Arya', 'marriageDate' => '2026-11-17', 'villageName' => 'Jlarem', 'createdAt' => '2026-11-01 21:40:00'],
            ['letterNumber' => '474.2/174/6.20/2026', 'applicantName' => 'Arya Suparman', 'partnerName' => 'Sumarni Ilham', 'marriageDate' => '2026-11-18', 'villageName' => 'Kembang', 'createdAt' => '2026-11-02 22:05:00'],
            ['letterNumber' => '474.2/175/6.20/2026', 'applicantName' => 'Slamet', 'partnerName' => 'Slomet', 'marriageDate' => '2026-11-19', 'villageName' => 'Ngagrong', 'createdAt' => '2026-11-03 22:30:00'],
            ['letterNumber' => '474.2/176/6.20/2026', 'applicantName' => 'Wahyu Santoso', 'partnerName' => 'Dewi Rahayu', 'marriageDate' => '2026-11-20', 'villageName' => 'Kaligentong', 'createdAt' => '2026-11-04 08:15:00'],
            ['letterNumber' => '474.2/177/6.20/2026', 'applicantName' => 'Hendra Kusuma', 'partnerName' => 'Fitri Handayani', 'marriageDate' => '2026-11-21', 'villageName' => 'Gladagsari', 'createdAt' => '2026-11-05 09:30:00'],
            ['letterNumber' => '474.2/178/6.20/2026', 'applicantName' => 'Nurul Hidayah', 'partnerName' => 'Agus Setiawan', 'marriageDate' => '2026-11-22', 'villageName' => 'Seboto', 'createdAt' => '2026-11-06 10:45:00'],
            ['letterNumber' => '474.2/179/6.20/2026', 'applicantName' => 'Rizal Fauzi', 'partnerName' => 'Sri Mulyani', 'marriageDate' => '2026-11-23', 'villageName' => 'Kembang', 'createdAt' => '2026-11-07 11:20:00'],
            ['letterNumber' => '474.2/180/6.20/2026', 'applicantName' => 'Maya Sari', 'partnerName' => 'Doni Prasetyo', 'marriageDate' => '2026-11-24', 'villageName' => 'Sampetan', 'createdAt' => '2026-11-08 13:55:00'],
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
