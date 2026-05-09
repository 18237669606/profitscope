export type Trade = "plumber" | "electrician" | "carpenter" | "hvac" | "general";

export type ProjectStatus = "draft" | "completed";

export interface Project {
  id: string;
  user_id: string;
  client_name: string;
  client_address: string;
  trade: Trade;
  hourly_rate: number;
  estimated_hours: number;
  actual_hours: number | null;
  material_cost: number;
  subcontractor_cost: number;
  status: ProjectStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectFormData {
  client_name: string;
  client_address: string;
  trade: Trade;
  hourly_rate: number;
  estimated_hours: number;
  actual_hours?: number;
  material_cost: number;
  subcontractor_cost: number;
  notes?: string;
  status: ProjectStatus;
}

export interface ProjectCalculations {
  quote_amount: number;
  total_cost: number;
  net_profit: number;
  profit_margin: number;
}

export function calculateProject(project: {
  hourly_rate: number;
  estimated_hours: number;
  material_cost: number;
  subcontractor_cost: number;
}): ProjectCalculations {
  const quote_amount = project.hourly_rate * project.estimated_hours;
  const total_cost = project.material_cost + project.subcontractor_cost;
  const net_profit = quote_amount - total_cost;
  const profit_margin = quote_amount > 0 ? (net_profit / quote_amount) * 100 : 0;

  return {
    quote_amount: Number(quote_amount.toFixed(2)),
    total_cost: Number(total_cost.toFixed(2)),
    net_profit: Number(net_profit.toFixed(2)),
    profit_margin: Number(profit_margin.toFixed(1)),
  };
}

export const TRADE_LABELS: Record<Trade, string> = {
  plumber: "Plumber",
  electrician: "Electrician",
  carpenter: "Carpenter",
  hvac: "HVAC Technician",
  general: "General Contractor",
};

export const TRADE_OPTIONS = Object.entries(TRADE_LABELS).map(([value, label]) => ({
  value: value as Trade,
  label,
}));
