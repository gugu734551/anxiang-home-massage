export const dayKey = (date) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
export function bounds(now = new Date()) {
  const end = new Date(now);
  end.setDate(1); end.setMonth(end.getMonth()+1);
  end.setDate(Math.min(now.getDate(), new Date(end.getFullYear(),end.getMonth()+1,0).getDate()));
  return { min: dayKey(now), max: dayKey(end), end };
}
export function validateSlot(date, time, now = new Date()) {
  const {min,max,end}=bounds(now);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)||date<min||date>max) return '请选择今天起一个月内的日期';
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return '请选择预约时间';
  const slot=new Date(`${date}T${time}:00`);
  if(dayKey(slot)!==date || slot<=now) return '预约时间已过，请重新选择';
  if(slot>end) return '预约时间不能超过一个月';
  return '';
}
