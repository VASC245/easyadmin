import { supabase } from '../supabase';

export async function addIncome(income) {
  const { data, error } = await supabase.from('incomes').insert([income]);
  if (error) throw error;
  return data;
}

export async function addExpense(expense) {
  const { data, error } = await supabase.from('expenses').insert([expense]);
  if (error) throw error;
  return data;
}

export async function addBeverageSale(sale) {
  const { data, error } = await supabase.from('beverages').insert([sale]);
  if (error) throw error;
  return data;
}

export async function addEndOfDayReport(report) {
  const { data, error } = await supabase.from('end_of_day_reports').insert([report]);
  if (error) throw error;
  return data;
}
