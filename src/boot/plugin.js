// src/boot/plugin.js
import { defineBoot } from '#q-app/wrappers'
import VueFileAgentNext from '@boindil/vue-file-agent-next'
import '@boindil/vue-file-agent-next/dist/vue-file-agent-next.css'

export default defineBoot(({ app }) => {
  app.use(VueFileAgentNext)
})
