import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const templatePath = resolve(__dirname, 'worker-template.js')
const outputPath = resolve(__dirname, '../public/_worker.js')

const template = readFileSync(templatePath, 'utf-8')
const ghToken = process.env.NUXT_PUBLIC_GITALK_GH_TOKEN || ''

const worker = template.replace('__GH_TOKEN__', JSON.stringify(ghToken))
writeFileSync(outputPath, worker)
console.log('[build-worker] generated public/_worker.js')
