import { parse } from 'csv-parse';
import type { ParsedCSV } from '../types/index.js';

/**
 * Parses a raw CSV Buffer into a structured object containing headers and rows.
 * Uses csv-parse with strict settings: trims whitespace, handles BOM, skips empty lines.
 */
export async function parseCSV(buffer: Buffer): Promise<ParsedCSV> {
  return new Promise((resolve, reject) => {
    parse(
      buffer,
      {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        bom: true,
        relax_column_count: true,
      },
      (err, records: Record<string, string>[]) => {
        if (err) {
          reject(new Error(`CSV parsing failed: ${err.message}`));
          return;
        }

        if (!records || records.length === 0) {
          reject(new Error('CSV file is empty or contains no data rows.'));
          return;
        }

        const headers = Object.keys(records[0]);

        if (headers.length === 0) {
          reject(new Error('CSV file has no recognisable column headers.'));
          return;
        }

        resolve({
          headers,
          rows: records,
          rowCount: records.length,
        });
      },
    );
  });
}
