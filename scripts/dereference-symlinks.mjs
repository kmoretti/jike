import { lstat, realpath, readdir, readlink, rm, copyFile, mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

const root = resolve('.output/public')

async function copyDir(src, dest) {
  await mkdir(dest, { recursive: true })
  const entries = await readdir(src, { withFileTypes: true })
  for (const entry of entries) {
    const srcPath = resolve(src, entry.name)
    const destPath = resolve(dest, entry.name)
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath)
    } else if (entry.isSymbolicLink()) {
      await replaceSymlink(srcPath)
      await copyDir(srcPath, destPath)
    } else {
      await copyFile(srcPath, destPath)
    }
  }
}

async function replaceSymlink(linkPath) {
  const target = await realpath(linkPath)
  const stat = await lstat(target)
  await rm(linkPath)
  if (stat.isDirectory()) {
    await copyDir(target, linkPath)
  } else {
    await mkdir(dirname(linkPath), { recursive: true })
    await copyFile(target, linkPath)
  }
  console.log(`[dereference] ${linkPath} -> ${target}`)
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = resolve(dir, entry.name)
    if (entry.isSymbolicLink()) {
      await replaceSymlink(fullPath)
    } else if (entry.isDirectory()) {
      await walk(fullPath)
    }
  }
}

await walk(root)
console.log('[dereference] done')
