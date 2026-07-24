import { cp, rm } from 'node:fs/promises'
import { resolve } from 'node:path'

const src = resolve('.output/public')
const dest = resolve('dist')

await rm(dest, { recursive: true, force: true })
await cp(src, dest, { recursive: true, dereference: true, force: true })
console.log(`[copy-output] copied ${src} -> ${dest}`)
