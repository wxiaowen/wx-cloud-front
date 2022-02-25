import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import VueWechatTitle from 'vue-wechat-title'
import {uuid} from 'vue-uuid'
import Vant from 'vant'
import 'vant/lib/index.css'
Vue.use(VueWechatTitle)
Vue.config.productionTip = false
Vue.use(VueWechatTitle)

Vue.use(Vant)
Vue.prototype.$uuid = uuid
new Vue({
  vuetify,
  router,
  store,
  render: h => h(App)
}).$mount('#app')
