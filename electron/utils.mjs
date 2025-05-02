import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

export function getProjectRoot() {
  // 获取当前文件的路径
  const __filename = fileURLToPath(import.meta.url)
  // 获取当前文件所在的目录
  const __dirname = dirname(__filename)
  // 获取项目根目录路径 (从 electron 文件夹上一级)
  return path.resolve(__dirname, '..')
}