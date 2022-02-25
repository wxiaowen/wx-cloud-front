
import Vue from 'vue'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
import '@mdi/font/css/materialdesignicons.css'
import LRU from 'lru-cache'
import minifyTheme from 'minify-css-string'
Vue.use(Vuetify)
const themeCache = new LRU({
  max: 10,
  maxAge: 1000 * 60 * 60 // 1 hour
})
const opts = {
  icons: {
    iconfont: 'mdi'
  },
  theme: {
    options: { minifyTheme },
    themeCache: themeCache
  }
}

export default new Vuetify(opts)
