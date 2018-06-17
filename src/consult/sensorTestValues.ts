// tslint:disable:no-magic-numbers
// tslint:disable-next-line:typedef
export const getSensorValue = (cb: number): (db: number) => string => ({
    0x00: (db: number): string => `CAS pos MSB: ${db}`,
    0x01: (db: number): string => `CAS pos: ${db * 12.5} RPM`,
    0x04: (db: number): string => `MAF MSB: ${db}`,
    0x05: (db: number): string => `MAF: ${db * 5} mV`,
    0x08: (db: number): string => `Coolant temp: ${db - 50} deg`,
    0x09: (db: number): string => `LH 02: ${db * 10} mV`,
    0x0B: (db: number): string => `Speed: ${db * 2} kph`,
    0x0C: (db: number): string => `Battery: ${db * 80} mV`,
    0x0D: (db: number): string => `TPS: ${db * 20} mV`,
    0x12: (db: number): string => `EGT: ${db * 20} mV`,
    0x13: (db: number): string => `Digital: ${db}`,
    0x14: (db: number): string => `Inj time LH MSB: ${db}`,
    0x15: (db: number): string => `Inj time LH: ${db / 100} ms`,
    0x16: (db: number): string => `Ign timing: ${110 - db} Deg BTDC`,
    0x17: (db: number): string => `AAC: ${db / 2} %`,
    0x1A: (db: number): string => `A/F ALPHA LH: ${db} %`,
    0x1C: (db: number): string => `A/F ALPHA LH (Selflearn): ${db} %`,
    0x1E: (db: number): string => `Digital: ${db}`,
    0x1F: (db: number): string => `Digital: ${db}`,
    0x21: (db: number): string => `Digital: ${db}`,
})[cb]
