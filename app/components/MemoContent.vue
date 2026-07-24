<template>
  <div class="memo-content markdown-body" v-html="renderedContent"></div>
</template>

<script setup lang="ts">
import MarkdownIt from 'markdown-it'

const props = defineProps<{ content: string }>()
const markdown = new MarkdownIt({ html: true, breaks: true, linkify: true })
const renderedContent = computed(() => markdown.render(props.content))
</script>
