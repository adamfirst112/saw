let kriteria = [];
let bobot = [];
let atribut = [];
let dataAlternatif = [];

function uploadCSV() {

    let file = document.getElementById("csvFile").files[0];

    if (!file) {
        alert("Pilih file CSV terlebih dahulu!");
        return;
    }

    let reader = new FileReader();

    reader.onload = function (e) {

        let text = e.target.result;

        let rows = text.trim().split("\n");

        let header = rows[0]
            .replace(/\r/g, "")
            .split(",");

        // Ambil kriteria mulai dari kolom ke-2
        kriteria = header.slice(1);

        dataAlternatif = [];

        for (let i = 1; i < rows.length; i++) {

            let cols = rows[i]
                .replace(/\r/g, "")
                .split(",");

            let alternatif = cols[0];

            let nilai = cols.slice(1).map(x => {

                let n = parseFloat(x);

                if (isNaN(n) || n === -200) {
                    return 0;
                }

                return n;
            });

            dataAlternatif.push({
                nama: alternatif,
                nilai: nilai
            });
        }

        tampilFormBobot();
        tampilMatriks();
    };

    reader.readAsText(file);
}

function tampilFormBobot() {

    let html = `
    <table>
        <tr>
            <th>Kriteria</th>
            <th>Bobot</th>
            <th>Atribut</th>
        </tr>
    `;

    kriteria.forEach((k, i) => {

        html += `
        <tr>
            <td>${k}</td>

            <td>
                <input type="number"
                       id="bobot${i}"
                       step="0.01"
                       value="0.1">
            </td>

            <td>
                <select id="atribut${i}">
                    <option value="benefit">Benefit</option>
                    <option value="cost">Cost</option>
                </select>
            </td>
        </tr>
        `;
    });

    html += `
    </table>

    <br>

    <button onclick="simpanBobot()">
        Hitung SAW
    </button>
    `;

    document.getElementById("formKriteria").innerHTML = html;
}

function simpanBobot() {

    bobot = [];
    atribut = [];

    for (let i = 0; i < kriteria.length; i++) {

        bobot.push(
            parseFloat(
                document.getElementById(`bobot${i}`).value
            )
        );

        atribut.push(
            document.getElementById(`atribut${i}`).value
        );
    }

    hitungSAW();
}

function tampilMatriks() {

    let html = "<table>";

    html += "<tr><th>Alternatif</th>";

    kriteria.forEach(k => {
        html += `<th>${k}</th>`;
    });

    html += "</tr>";

    dataAlternatif.forEach(a => {

        html += `<tr><td>${a.nama}</td>`;

        a.nilai.forEach(n => {
            html += `<td>${n}</td>`;
        });

        html += "</tr>";
    });

    html += "</table>";

    document.getElementById("matriks").innerHTML = html;
}

function hitungSAW() {

    let normalisasi = [];

    for (let j = 0; j < kriteria.length; j++) {

        let kolom = dataAlternatif.map(
            a => a.nilai[j]
        );

        let max = Math.max(...kolom);
        let min = Math.min(...kolom);

        normalisasi[j] = [];

        for (let i = 0; i < dataAlternatif.length; i++) {

            let nilai = dataAlternatif[i].nilai[j];

            if (atribut[j] === "benefit") {

                normalisasi[j][i] = nilai / max;

            } else {

                normalisasi[j][i] = min / nilai;
            }
        }
    }

    tampilNormalisasi(normalisasi);
    tampilTerbobot(normalisasi);
}

function tampilNormalisasi(normalisasi) {

    let html = "<table>";

    html += "<tr><th>Alternatif</th>";

    kriteria.forEach(k => {
        html += `<th>${k}</th>`;
    });

    html += "</tr>";

    for (let i = 0; i < dataAlternatif.length; i++) {

        html += `<tr>
                    <td>${dataAlternatif[i].nama}</td>`;

        for (let j = 0; j < kriteria.length; j++) {

            html += `
            <td>
                ${normalisasi[j][i].toFixed(4)}
            </td>`;
        }

        html += "</tr>";
    }

    html += "</table>";

    document.getElementById("normalisasi").innerHTML = html;
}

function tampilTerbobot(normalisasi) {

    let html = "<table>";

    html += "<tr><th>Alternatif</th>";

    kriteria.forEach(k => {
        html += `<th>${k}</th>`;
    });

    html += "<th>Total</th></tr>";

    let hasil = [];

    for (let i = 0; i < dataAlternatif.length; i++) {

        let total = 0;

        html += `<tr>
                    <td>${dataAlternatif[i].nama}</td>`;

        for (let j = 0; j < kriteria.length; j++) {

            let nilaiTerbobot =
                normalisasi[j][i] * bobot[j];

            total += nilaiTerbobot;

            html += `
            <td>
                ${nilaiTerbobot.toFixed(4)}
            </td>`;
        }

        html += `
            <td>
                ${total.toFixed(4)}
            </td>
        </tr>`;

        hasil.push({
            nama: dataAlternatif[i].nama,
            total: total
        });
    }

    html += "</table>";

    document.getElementById("terbobot").innerHTML = html;

    ranking(hasil);
}

function ranking(hasil) {

    hasil.sort((a, b) => b.total - a.total);

    let html = `
    <table>
        <tr>
            <th>Ranking</th>
            <th>Alternatif</th>
            <th>Nilai SAW</th>
        </tr>
    `;

    hasil.forEach((item, index) => {

        html += `
        <tr>
            <td>${index + 1}</td>
            <td>${item.nama}</td>
            <td>${item.total.toFixed(4)}</td>
        </tr>
        `;
    });

    html += "</table>";

    document.getElementById("ranking").innerHTML = html;

    document.getElementById("kesimpulan").innerHTML =
    `
    <h3>
        Alternatif Terbaik : ${hasil[0].nama}
    </h3>

    <h3>
        Nilai SAW : ${hasil[0].total.toFixed(4)}
    </h3>
    `;
}