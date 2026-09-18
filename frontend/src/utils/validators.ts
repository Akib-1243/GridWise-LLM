import type{Request,Result}from'../types';

const tolerance=0.01;

export const validate=(s:Request)=>!s.scenario_id?'Scenario ID is required':s.operator_notes.filter(Boolean).length<1?'At least one operator note is required':s.hours.length!==24?'Exactly 24 hours are required':new Set(s.hours.map(h=>h.hour)).size!==24?'Hours must be unique':s.battery.minimum_energy_kwh>s.battery.capacity_kwh?'Minimum energy cannot exceed capacity':s.battery.initial_energy_kwh<s.battery.minimum_energy_kwh||s.battery.initial_energy_kwh>s.battery.capacity_kwh?'Initial energy is outside battery bounds':undefined;

export function validateResult(request:Request,result:Result):string|undefined{
 if(result.hourly_plan.length!==24||new Set(result.hourly_plan.map(row=>row.hour)).size!==24)return'Plan must contain 24 unique hours';
 let energy=request.battery.initial_energy_kwh;
 for(const row of result.hourly_plan){
  const input=request.hours[row.hour];
  if(!input)return`Missing input hour ${row.hour}`;
  const delta=row.battery_action==='charge'?row.battery_kwh:row.battery_action==='discharge'?-row.battery_kwh:0;
  if(Math.abs(row.grid_kwh+row.solar_used_kwh+Math.max(0,-delta)-input.demand_kwh-Math.max(0,delta))>tolerance)return`Energy balance failed at hour ${row.hour}`;
  if(row.battery_kwh<0||row.battery_kwh>(row.battery_action==='charge'?request.battery.max_charge_kwh_per_hour:request.battery.max_discharge_kwh_per_hour)+tolerance)return`Battery rate failed at hour ${row.hour}`;
  energy+=delta;
  if(Math.abs(energy-row.battery_energy_after_kwh)>tolerance||energy<request.battery.minimum_energy_kwh-tolerance||energy>request.battery.capacity_kwh+tolerance)return`Battery bounds failed at hour ${row.hour}`;
 }
 if(Math.abs(energy-request.battery.initial_energy_kwh)>tolerance)return'End-of-day neutrality failed';
 if(Math.abs(result.total_grid_kwh-result.hourly_plan.reduce((sum,row)=>sum+row.grid_kwh,0))>tolerance)return'Total grid value does not match the plan';
 if(Math.abs(result.peak_grid_kwh-Math.max(...result.hourly_plan.map(row=>row.grid_kwh)))>tolerance)return'Peak grid value does not match the plan';
 return undefined;
}
