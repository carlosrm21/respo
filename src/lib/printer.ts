import net from 'net';

// A simple module to connect and send ESC/POS commands to a network printer
// Useful for Kitchen Ticket Printing

const PRINTER_IP = process.env.PRINTER_IP || '192.168.1.100'; // Define in .env
const PRINTER_PORT = parseInt(process.env.PRINTER_PORT || '9100');

// Basic ESC/POS commands
const CMD = {
    INIT: Buffer.from([0x1b, 0x40]), // Initialize printer
    ALIGN_LEFT: Buffer.from([0x1b, 0x61, 0x00]),
    ALIGN_CENTER: Buffer.from([0x1b, 0x61, 0x01]),
    BOLD_ON: Buffer.from([0x1b, 0x45, 0x01]),
    BOLD_OFF: Buffer.from([0x1b, 0x45, 0x00]),
    TEXT_DOUBLE_H_W: Buffer.from([0x1d, 0x21, 0x11]), // Double height & width
    TEXT_NORMAL: Buffer.from([0x1d, 0x21, 0x00]),
    CUT: Buffer.from([0x1d, 0x56, 0x41, 0x10]), // Cut paper
    BEEP: Buffer.from([0x1b, 0x42, 0x03, 0x02]), // Beep
};

interface PrintItem {
    nombre: string;
    cantidad: number;
}

export async function printKitchenTicket(mesaNumero: number, mesero: string, items: PrintItem[]) {
    return new Promise((resolve, reject) => {
        // We only simulate or actually print if explicitly enabled, or in production
        // Since we don't know the exact IP yet, we wrap this to avoid crashing locally
        if (process.env.ENABLE_PRINTING !== 'true') {
            console.log('------- SIMULATED KITCHEN RECEIPT -------');
            console.log(`MESA ${mesaNumero} - Atendido por: ${mesero}`);
            items.forEach(i => console.log(`${i.cantidad}x ${i.nombre}`));
            console.log('-----------------------------------------');
            return resolve(true);
        }

        const client = new net.Socket();

        // Set a timeout of 3 seconds so we don't hang if printer is off
        client.setTimeout(3000);

        client.on('error', (err) => {
            console.error('Printer connection error:', err);
            client.destroy();
            reject(err);
        });

        client.on('timeout', () => {
            console.error('Printer connection timeout');
            client.destroy();
            reject(new Error('Printer timeout'));
        });

        client.connect(PRINTER_PORT, PRINTER_IP, () => {
            console.log(`Connected to Printer ${PRINTER_IP}:${PRINTER_PORT}`);

            // Build the receipt bytes
            const date = new Date().toLocaleString();

            let data = Buffer.concat([
                CMD.INIT,
                CMD.ALIGN_CENTER,
                CMD.TEXT_DOUBLE_H_W,
                Buffer.from(`NUEVO PEDIDO\n`),
                CMD.TEXT_NORMAL,
                Buffer.from(`--------------------------------\n`),
                CMD.ALIGN_LEFT,
                CMD.BOLD_ON,
                Buffer.from(`Mesa: ${mesaNumero}\n`),
                Buffer.from(`Mesero: ${mesero}\n`),
                CMD.BOLD_OFF,
                Buffer.from(`Fecha: ${date}\n`),
                Buffer.from(`--------------------------------\n\n`),
                CMD.TEXT_DOUBLE_H_W,
            ]);

            // Add items
            items.forEach(item => {
                data = Buffer.concat([
                    data,
                    Buffer.from(`[${item.cantidad}] ${item.nombre}\n`)
                ]);
            });

            data = Buffer.concat([
                data,
                CMD.TEXT_NORMAL,
                Buffer.from(`\n\n`),
                CMD.BEEP,
                CMD.CUT
            ]);

            // Send to printer
            client.write(data, () => {
                client.destroy(); // Close connection
                resolve(true);
            });
        });
    });
}
