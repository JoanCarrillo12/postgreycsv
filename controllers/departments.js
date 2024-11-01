const { Pool } = require('pg');
const fastcsv = require("fast-csv");
const fs = require("fs");

const pool = new Pool({
    host: '127.0.0.1',
    user: 'postgres',
    password: 'UTM123',
    database: 'nuevohr',
    port: '5432'
});

async function exportPostgreaCsv(req, res) {
    const ws = fs.createWriteStream("departments.csv");
    try {
        const client = await pool.connect();
        const result = await client.query("SELECT * FROM departments");
        client.release();

        // Escribir los datos en el archivo CSV
        fastcsv
            .write(result.rows, { headers: true })
            .on("finish", function() {
                console.log("Escritura en departments.csv realizada exitosamente!");
                res.json({ message: "Archivo CSV creado exitosamente." });
            })
            .pipe(ws);
    } catch (err) {
        console.error('Error al exportar a CSV:', err);
        res.status(500).json({ error: 'Error al exportar a CSV' });
    }
}

async function importCsvaPostgre(req, res) {
    const filePath = 'departments.csv';
    const stream = fs.createReadStream(filePath);

    const csvData = [];

    fastcsv
        .parseStream(stream, { headers: true })
        .on("data", async(row) => {
            const { department_id, department_name, manager_id, location_id } = row;


            if (!department_id || !department_name) {
                console.error('Error: department_id o department_name es requerido.');
                return;
            }


            const id = parseInt(department_id);
            const manager = manager_id ? parseInt(manager_id) : null;
            const location = parseInt(location_id);


            try {
                const query = `
                    INSERT INTO departments (department_id, department_name, manager_id, location_id)
                    VALUES ($1, $2, $3, $4)
                    ON CONFLICT (department_id) DO UPDATE SET
                        department_name = EXCLUDED.department_name,
                        manager_id = EXCLUDED.manager_id,
                        location_id = EXCLUDED.location_id;
                `;
                await pool.query(query, [id, department_name, manager, location]);
                console.log(`Registro con ID ${id} actualizado.`);
            } catch (error) {
                console.error('Error al insertar/actualizar el registro:', error);
            }
        })
        .on("end", () => {
            console.log("CSV importado correctamente.");
            res.json({ message: "Importación completada." });
        })
        .on("error", (error) => {
            console.error('Error al importar el archivo CSV:', error);
            res.status(500).json({ error: 'Error al importar el archivo CSV' });
        });
}

module.exports = { exportPostgreaCsv, importCsvaPostgre };