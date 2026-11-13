import { GoogleGenerativeAI } from '@google/generative-ai';
import type {
  ParsedCSV,
  AnalysisResult,
  KPI,
  ChartSpec,
  ColumnMeta,
  DataQualityReport,
} from '../types/index.js';

// ─── Client initialisation ─────────────────────────────────────────────────

function getGeminiClient(): GoogleGenerativeAI {
  const apiKey = process.env['GEMINI_API_KEY'];
  if (!apiKey) throw new Error('GEMINI_API_KEY environment variable is not set.');
  return new GoogleGenerativeAI(apiKey);
}

function getModel(client: GoogleGenerativeAI) {
  return client.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.2, // low temperature for consistent structured output
    },
  });
}

// ─── JSON parsing helper ───────────────────────────────────────────────────

function safeParseJSON<T>(text: string): T {
  try {
    return JSON.parse(text) as T;
  } catch {
    // Try to extract JSON from markdown code fences if model wrapped it
    const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch?.[1]) {
      return JSON.parse(fenceMatch[1].trim()) as T;
    }
    throw new Error(
      `Gemini returned non-JSON response: ${text.substring(0, 300)}…`,
    );
  }
}

// ─── Step 1: Column metadata analysis ─────────────────────────────────────

async function analyzeColumns(
  model: ReturnType<typeof getModel>,
  csv: ParsedCSV,
): Promise<ColumnMeta[]> {
  const sampleRows = csv.rows.slice(0, 10);
  const prompt = `You are a data analyst. Analyze the columns of this CSV dataset and determine their data types.

Columns: ${JSON.stringify(csv.headers)}
Sample rows (up to 10): ${JSON.stringify(sampleRows)}

Return a JSON array — one object per column — with these exact keys:
- "name": string (exact column name from the CSV)
- "type": one of "numeric" | "categorical" | "date" | "text" | "boolean"
- "nullCount": number (count of blank/null/N/A values in the sample)
- "uniqueCount": number (count of distinct values in the sample)
- "sampleValues": string[] (up to 5 representative non-null values)

Return only the JSON array.`;

  const result = await model.generateContent(prompt);
  return safeParseJSON<ColumnMeta[]>(result.response.text());
}

// ─── Step 2: Data quality analysis ────────────────────────────────────────

async function analyzeDataQuality(
  model: ReturnType<typeof getModel>,
  csv: ParsedCSV,
  columnMeta: ColumnMeta[],
): Promise<DataQualityReport> {
  const sampleRows = csv.rows.slice(0, 50);
  const prompt = `You are a data quality analyst. Assess the quality of this CSV dataset.

Total rows: ${csv.rowCount}
Column metadata: ${JSON.stringify(columnMeta)}
Sample rows (up to 50): ${JSON.stringify(sampleRows)}

Return a JSON object with this exact structure:
{
  "overallScore": <integer 0-100 representing data cleanliness>,
  "totalRows": ${csv.rowCount},
  "cleanRows": <integer: rows without any quality issues>,
  "duplicateRows": <integer: estimated number of duplicate rows>,
  "issues": [
    {
      "column": "<column name>",
      "issueType": "<one of: missing_values | outliers | format_mismatch | duplicates>",
      "severity": "<one of: low | medium | high>",
      "affectedRows": <integer>,
      "description": "<concise human-readable explanation>"
    }
  ]
}

Return only the JSON object.`;

  const result = await model.generateContent(prompt);
  return safeParseJSON<DataQualityReport>(result.response.text());
}

// ─── Step 3: KPI extraction ────────────────────────────────────────────────

async function extractKPIs(
  model: ReturnType<typeof getModel>,
  csv: ParsedCSV,
  columnMeta: ColumnMeta[],
): Promise<KPI[]> {
  // Limit to 500 rows for Gemini context window
  const rows = csv.rows.slice(0, 500);
  const prompt = `You are a business intelligence analyst. Extract the most important KPIs from this dataset.

Column metadata: ${JSON.stringify(columnMeta)}
Data rows (up to 500): ${JSON.stringify(rows)}

Identify 4 to 8 of the most relevant business KPIs. Compute actual values from the data.
Consider: totals, averages, growth rates, top performers, conversion rates, ratios.

Return a JSON array with this structure:
[
  {
    "key": "<camelCase identifier>",
    "label": "<human-readable label>",
    "value": <computed number or string>,
    "unit": "<optional: $, %, units, etc.>",
    "changePercent": <optional: percentage change if temporal data exists>,
    "trend": "<optional: up | down | neutral>",
    "description": "<1-2 sentence explanation of this KPI and its significance>"
  }
]

Return only the JSON array.`;

  const result = await model.generateContent(prompt);
  return safeParseJSON<KPI[]>(result.response.text());
}

// ─── Step 4: Chart generation ──────────────────────────────────────────────

async function generateCharts(
  model: ReturnType<typeof getModel>,
  csv: ParsedCSV,
  columnMeta: ColumnMeta[],
  kpis: KPI[],
): Promise<ChartSpec[]> {
  const rows = csv.rows.slice(0, 200);
  const prompt = `You are a data visualisation expert. Create chart specifications for this dataset, including the actual data for each chart.

Column metadata: ${JSON.stringify(columnMeta)}
Extracted KPIs: ${JSON.stringify(kpis)}
Data rows (up to 200): ${JSON.stringify(rows)}

Create 3 to 5 meaningful, insightful charts. For each chart, aggregate and shape the data appropriately (e.g., group by category, monthly totals). Limit data arrays to 50 points.

Return a JSON array:
[
  {
    "id": "<unique string like chart-1>",
    "type": "<one of: bar | line | pie | area | scatter>",
    "title": "<descriptive chart title>",
    "description": "<what insight this chart provides>",
    "xAxisKey": "<key name in data objects for the x-axis (or 'name' for pie)>",
    "yAxisKey": "<key name for the primary y-axis (or 'value' for pie)>",
    "dataKeys": ["<all keys present in each data object>"],
    "data": [{"<xAxisKey>": "<value>", "<yAxisKey>": <number>}],
    "color": "<optional hex color like #4F46E5>"
  }
]

Return only the JSON array.`;

  const result = await model.generateContent(prompt);
  return safeParseJSON<ChartSpec[]>(result.response.text());
}

// ─── Step 5: Executive summary ─────────────────────────────────────────────

async function generateSummary(
  model: ReturnType<typeof getModel>,
  kpis: KPI[],
  dataQuality: DataQualityReport,
  fileName: string,
): Promise<string> {
  const prompt = `You are a business analyst. Write a concise executive summary for a data analysis report.

File analysed: ${fileName}
Data quality score: ${dataQuality.overallScore}/100 (${dataQuality.cleanRows} of ${dataQuality.totalRows} rows are clean)
Key KPIs: ${JSON.stringify(kpis)}

Write exactly 2–3 sentences summarising the most important findings. Use specific numbers from the KPIs.
Return only the plain text summary — no JSON, no markdown formatting.`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

// ─── Main agent orchestrator ───────────────────────────────────────────────

/**
 * Runs the full multi-step AI analysis pipeline on a parsed CSV dataset.
 * Steps: column analysis → data quality → KPI extraction → chart generation → summary.
 */
export async function runAnalysisAgent(
  csv: ParsedCSV,
  fileName: string,
): Promise<AnalysisResult> {
  const client = getGeminiClient();
  const model = getModel(client);

  console.log(`[GeminiAgent] Starting analysis — file: "${fileName}", rows: ${csv.rowCount}`);

  const columnMeta = await analyzeColumns(model, csv);
  console.log(`[GeminiAgent] ✓ Column analysis — ${columnMeta.length} columns`);

  const dataQuality = await analyzeDataQuality(model, csv, columnMeta);
  console.log(`[GeminiAgent] ✓ Data quality — score: ${dataQuality.overallScore}/100`);

  const kpis = await extractKPIs(model, csv, columnMeta);
  console.log(`[GeminiAgent] ✓ KPI extraction — ${kpis.length} KPIs`);

  const charts = await generateCharts(model, csv, columnMeta, kpis);
  console.log(`[GeminiAgent] ✓ Chart generation — ${charts.length} charts`);

  const summary = await generateSummary(model, kpis, dataQuality, fileName);
  console.log('[GeminiAgent] ✓ Summary generated');

  return { kpis, charts, dataQuality, columnMetadata: columnMeta, summary };
}
