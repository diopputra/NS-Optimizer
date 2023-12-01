// name: ODI - CSV TO JSON Module
// id: odi_csv2json_mod
// desc: Module: Merubah CSV langsung ke dalam Array of JSON.
//			Sudah dilengkapi dengan pembersih flag "Sep" dari Excel.
//			Merubah Column-Header menjadi All-LowerCase
//			Merubah 'Spasi' dalam Column-Header dengan menggunakan 'UnderScore' (_)
//			Engine utama CSV PArser menggunakan Papa-parse (https://github.com/mholt/PapaParse)
//			Call module ini dengan CSV2JSON.
// author: Dio Pratama, 2023

define(['SuiteScripts/libs/Papa-Parse/papaparse.min.js'],
    function (Papa) {

    function CSV2JSON(data) {
        var delim = ['\t', '|', ';', ',']; // 				DELIMITER YANG MUNGKIN DIGUNAKAN	TAB, PIPE, Semicolon, dan COMMA
        data = data.replace(/[\r\n]+/gim, '\n'); //			REPLACE CHARACTER RETURN YG MUNGKIN BERBEDA \r ATAU \n

        //	1. MEMBERSIHKAN "sep=" YG MUNGKIN ADA DIBARIS AWAL CSV hasil dari EXCEL
        let lowercaseCsvData = data.toLowerCase(); // 									Mengubah string menjadi huruf kecil
        let sepIndex = lowercaseCsvData.indexOf('sep='); // 							Mencari indeks dari "sep=" dalam string yang diubah menjadi huruf kecil
        if (sepIndex != -1) { // 														Jika "sep=" ditemukan, hapus baris tersebut
            let endOfFirstLineIndex = lowercaseCsvData.indexOf('\n', sepIndex); //		Mencari indeks 'ENTER' diakhir dari baris "sep="
            data = data.slice(endOfFirstLineIndex + 1); // Menghapus baris yang mengandung "sep="
        }

        //	2. AMBIL HEADER SEBAGAI SAMPEL UJI
        let getHdr = data.split('\n')[0];

        let maxColumns = 0;
        let selectedDelimiter = ',';

        //	3. MEMBERSIHKAN BARIS KOSONG DI AKHIR BARIS CSV
        data = data.replace(/(\n\s*)+$/, '');

        //	4. MEMILIH SECARA OTOMATIS, DELIMITER APA YG DIGUNAKAN DALAM DOKUMEN
        for (let x = 0; x < delim.length; x++) {
            let colCount = getHdr.split(delim[x]);
            if (colCount.length > maxColumns) {
                maxColumns = colCount.length;
                selectedDelimiter = delim[x];
            }
        }

        //	5. Papa.parse, mengubah CSV to JSON
        data = Papa.parse(data, {
            delimiter: selectedDelimiter,
            header: true,
        }).data;

        //	6. MENGUBAH HEADER KE HURUF KECIL (lowercase) DAN MENGUBAH SPASI MENJADI UNDERSCORE DENGAN replace
        //	7. MENAMBAHKAN PROPERTI csvline_index
        let newData = data.map((obj, index) => {
            return Object.fromEntries(
                Object.entries(obj).map(([key, value]) => [key.toLowerCase().replace(/\s+/igm, "_"), value]));
        }).map((obj, index) => {
            return {
                ...obj,
                csvline_index: index + 1
            };
        });

        return newData;
    }

    function JSON2CSV(data) {
        //	1. Papa.unparse, mengubah JSON to CSV
        let newData = Papa.unparse(data);

        return newData;
    }

    return {
        CSV2JSON: CSV2JSON,
        JSON2CSV: JSON2CSV,
    }
});
