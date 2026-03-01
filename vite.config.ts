import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    hmr: false,
    watch: {
      ignored: ['**/*']
    }
  },
  plugins: [{
    name: 'remove-vite-client',
    transformIndexHtml(html) {
      return html.replace(/<script type="module" src="\/@vite\/client"><\/script>/, '');
    }
  }]
})