<template>
  <div  >
   <v-app>
  <v-app-bar app   dense
       >

 <v-toolbar-title> {{uuid}}</v-toolbar-title>
  </v-app-bar>

  <v-main>

    <!-- 给应用提供合适的间距 -->
    <v-container fluid>

      <!-- 如果使用 vue-router -->
      <router-view></router-view>
    </v-container>
  </v-main>

  <v-footer app>
     <v-container>
    <v-row>
      <v-col
        cols="12"
        sm="6"
      >
       <v-textarea
          class="mx-2"
          label=" "
          rows="2"
          v-model="content"
        >
        <template slot="append-outer"><v-icon
  color="blue"
  x-large
  @click="sendMessage"
>mdi-send</v-icon></template>
        </v-textarea>
      </v-col>
    </v-row>
  </v-container>
  </v-footer>
</v-app>
  </div>
</template>

<script>
import Stomp from 'stompjs'
import SockJS from 'sockjs-client'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { Notify } from 'vant'
NProgress.configure({ showSpinner: false })
export default {
  name: 'Chat',
  components: {
    [Notify.Component.name]: Notify.Component
  },
  data () {
    return {
      websocket: undefined,
      content: '',
      wsUrl: '/ws/connect',
      stompClient: undefined,
      uuid: undefined,
      clientId: undefined,
      chatTopic: '/chat'
    }
  },
  mounted () {
    this.uuid = this.$uuid.v1()
    this.clientId = this.$uuid.v1()
    this.initWebSocket()
  },
  created () {

  },
  beforeDestroy: function () {
    this.disconnect()
  },
  methods: {
    initWebSocket () {
      const self = this
      NProgress.start()
      const socket = new SockJS(self.wsUrl)

      self.stompClient = Stomp.over(socket)
      self.stompClient.heartbeat.outgoing = 5000
      self.stompClient.heartbeat.incoming = 0

      const headers = {

      }
      self.stompClient.connect(headers, function (resp) {
        self.successCallBack(resp)
      }, function (error) {
        self.failCallBack(error)
      })
      console.log(self.stompClient)
    },
    message (e) { // 数据接收
      const redata = JSON.parse(e.data)
      console.log(redata)
    },
    successCallBack (resp) {
      const self = this
      NProgress.done()
      Notify({
        message: '连接成功',
        type: 'success'
      })
      self.stompClient.subscribe('/user' + self.chatTopic, function (response) {
        console.log(response.body)
      })
    },

    failCallBack (error) {
      console.error(error)
      NProgress.done()
      Notify({
        message: '连接失败',
        type: 'error'
      })
    },
    sendMessage () {
      const self = this
      console.log(1)
      if (!self.content) {
        Notify({ type: 'warning', message: '你不写点啥。。。。' })
        return
      }
      if (self.stompClient && self.stompClient.connected) {
        const tx = self.stompClient.begin()
        const commonHeader = {
          transaction: tx.id
        }
        self.stompClient.send(
          self.chatTopic,
          Object.assign({}, commonHeader, {}),
          JSON.stringify({'content': self.content})
        )
        tx.commit()
        self.content = ''
      }
    },
    disconnect () { // 关闭
      const self = this
      if (self.stompClient && self.stompClient.connected) {
        self.stompClient.disconnect()
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
