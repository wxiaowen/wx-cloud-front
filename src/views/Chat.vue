/* eslint-disable vue/valid-v-for */
<template>
  <div>
    <v-app>
      <v-app-bar app dense>
        <v-toolbar-title> {{ uuid }}</v-toolbar-title>
 
      </v-app-bar>

      <v-main >
               <van-notice-bar
               left-icon="volume-o"
               v-if="noticeBarMessage"
  wrapable
  :scrollable="true"
  :text="noticeBarMessage"
/>
        <!-- 给应用提供合适的间距 -->
        <v-container fluid >
     <v-list two-line >
      <v-list-item-group
        multiple id="message-list"
      >
        <template v-for="(item, index) in messageList">
               <v-divider
          ></v-divider>
          <v-list-item :key="item.id">
            <template >
              <v-list-item-content>
                <v-list-item-title v-text="item.from"></v-list-item-title>

                <v-list-item-subtitle
                  class="text--primary"
                  v-text="item.content"
                ></v-list-item-subtitle>
              </v-list-item-content>

            </template>
          </v-list-item>
          <v-divider
          ></v-divider>
        </template>
      </v-list-item-group>
    </v-list>
        </v-container >
      </v-main>

      <v-footer app ref="button">
        <v-container>
          <v-row>
            <v-col>
              <v-textarea label=" " rows="2" v-model="content">
                <template slot="append-outer"
                  ><v-icon color="blue" x-large @click="sendMessage"
                    >mdi-send</v-icon
                  ></template
                >
              </v-textarea>
            </v-col>
          </v-row>
        </v-container>
      </v-footer>
    </v-app>
  </div>
</template>

<script>
import Stomp from "stompjs";
import SockJS from "sockjs-client";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { Notify   } from "vant";
NProgress.configure({ showSpinner: false });
export default {
  name: "Chat",
  components: {
    [Notify.Component.name]: Notify.Component,
  },
  data() {
    return {
      websocket: undefined,
      content: "",
      wsUrl: "/ws/connect",
      stompClient: undefined,
      uuid: undefined,
      clientId: undefined,
      chatTopic: "/many-chat",
      messageList: [
        
      ],
      noticeBarMessage:''
    };
  },
  mounted() {
    this.uuid = this.$uuid.v1();
    this.clientId = this.$uuid.v1();
    this.initWebSocket();
  },
  created() {},
  beforeDestroy: function () {
    this.disconnect();
  },
  methods: {
    initWebSocket() {
      const self = this;
      NProgress.start();
      const socket = new SockJS(self.wsUrl);

      self.stompClient = Stomp.over(socket);
      self.stompClient.heartbeat.outgoing = 5000;
      self.stompClient.heartbeat.incoming = 0;

      const headers = {
        uuid: self.uuid,
        clientId: self.clientId,
      };
      self.stompClient.connect(
        headers,
        function (resp) {
          self.successCallBack(resp);
        },
        function (error) {
          self.failCallBack(error);
        }
      );
      console.log(self.stompClient);
    },
    message(e) {
      // 数据接收
      const redata = JSON.parse(e.data);
      console.log(redata);
    },
    successCallBack() {
      const self = this;
      NProgress.done();
      Notify({
        message: "连接成功",
        type: "success",
      });
      self.stompClient.subscribe("/topic" + self.chatTopic, function (result) {
        if (result && result.body) {
          const message = JSON.parse(result.body);
          console.log("message " + message);
          self.messageList.push(message)
      //     self.$nextTick(() => {
      //   let msg = document.getElementById('message-list') // 获取对象
      //   msg.scrollTop = msg.scrollHeight // 滚动高度
      // })
      self.$vuetify.goTo(self.$refs.button, {})
          result.ack();

        }
      },{uuid:self.uuid,ack: 'client'});

          self.stompClient.subscribe("/app/online",function(result){
            result.ack();
          },{uuid:self.uuid,ack: 'client'})
          self.stompClient.subscribe("/topic/online" , function (result) {
        if (result && result.body) {
          const message = JSON.parse(result.body);
          console.log("message " + message);
          const from = message.from
          if(from!==self.uuid){
          self.noticeBarMessage=message.from
          setTimeout(function(){
            self.noticeBarMessage=''
          },5000)
          }
           result.ack();
        }
      },{uuid:self.uuid,ack: 'client'});
    },

    failCallBack(error) {
      console.error(error);
      NProgress.done();
      Notify({
        message: "连接失败",
        type: "error",
      });
    },
    sendMessage() {
      const self = this;
      if (!self.content) {
        Notify({ type: "warning", message: "你不写点啥。。。。" });
        return;
      }
      if (self.stompClient && self.stompClient.connected) {
        const tx = self.stompClient.begin();
        const commonHeader = {
          transaction: tx.id,
          uuid: self.uuid,
        };
        self.stompClient.send(
          "/app" + self.chatTopic,
          Object.assign({}, commonHeader, {}),
          JSON.stringify({ content: self.content,from:self.uuid})
        );
        tx.commit();
        self.content = "";
      }
    },
    disconnect() {
      // 关闭
      const self = this;
      if (self.stompClient && self.stompClient.connected) {
        self.stompClient.disconnect();
      }
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
