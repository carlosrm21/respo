'use server';
import { getComparativaSemanalData, getPLReportData } from '@/lib/opsBackofficeData';

export async function getPLReport(periodo: 'hoy' | 'semana' | 'mes' | 'año' = 'mes') {
  try {
    return { success: true, data: await getPLReportData(periodo) };
  } catch (e: any) { return { success: false, error: e.message }; }
}

export async function getComparativaSemanal() {
  try {
    return { success: true, data: await getComparativaSemanalData() };
  } catch (e: any) { return { success: false, data: [] }; }
}
