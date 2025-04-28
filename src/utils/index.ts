/**
 * 格式化日期
 * @param date 日期对象或时间戳
 * @param format 格式化模板，如 'YYYY-MM-DD HH:mm:ss'
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: Date | number, format: string = 'YYYY-MM-DD'): string {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = d.getMonth() + 1
  const day = d.getDate()
  const hour = d.getHours()
  const minute = d.getMinutes()
  const second = d.getSeconds()

  return format
    .replace(/YYYY/g, year.toString())
    .replace(/MM/g, month.toString().padStart(2, '0'))
    .replace(/DD/g, day.toString().padStart(2, '0'))
    .replace(/HH/g, hour.toString().padStart(2, '0'))
    .replace(/mm/g, minute.toString().padStart(2, '0'))
    .replace(/ss/g, second.toString().padStart(2, '0'))
}

/**
 * 防抖函数
 * @param fn 需要防抖的函数
 * @param delay 延迟时间，单位毫秒
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  let timer: number | null = null
  
  return function(this: any, ...args: Parameters<T>): void {
    if (timer) {
      clearTimeout(timer)
    }
    
    timer = window.setTimeout(() => {
      fn.apply(this, args)
      timer = null
    }, delay)
  }
}

/**
 * 节流函数
 * @param fn 需要节流的函数
 * @param delay 延迟时间，单位毫秒
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  let lastTime = 0
  
  return function(this: any, ...args: Parameters<T>): void {
    const now = Date.now()
    
    if (now - lastTime >= delay) {
      fn.apply(this, args)
      lastTime = now
    }
  }
}
