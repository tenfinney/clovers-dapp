<template>
  <div class="fixed top-0 left-0 col-12 z3 pointer-events-none" style="max-height:100vh;overflow-y:scroll">
    <div class="max-width-3 mt-header-h m-auto pointer-events-auto" style="background:linear-gradient(to bottom, rgba(255,255,255,.9) 90%, transparent);">
      <ul class="list-reset pt1" v-if="messages.length > 0">
        <li
          v-for="msg in messages"
          :class="msgClass(msg)"
          class="relative pt1 px2 pb2 h6 mx1 mb1 rounded"
          :key="msg.id"
          >
            <h6 class="h2 mb1" v-if="msg.title" :class="{'anim--msg-strobe': msg.type === 'progress'}" v-html="escape(msg.title)"></h6>
            <small class="block" :class="msg.link ? 'pointer' : ''" @click="clickMessage(msg)" v-html="escape(msg.msg)"/>
            <button class="absolute top-0 right-0 pt1 pr1 pb2 pl2 pointer" @click="removeMessage(msg.id)">
              <svg-x style="width:7px;height:7px" />
            </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { mapMutations } from 'vuex'
import xss from 'xss'
import svgX from '@/components/Icons/SVG-X'

export default {
  name: 'Messages',
  components: { svgX },
  data () {
    return {}
  },
  computed: {
    messages () {
      return this.$store.state.messages
    }
  },
  methods: {
    escape (msg) {
      return xss(msg)
    },
    clickMessage (msg) {
      if (msg.link) {
        this.$router.push(msg.link)
        this.removeMessage(msg.id)
      }
    },
    msgClass (msg) {
      switch (msg.type) {
        case 'success': return 'bg-green white'
        case 'info': return 'bg-white orange border'
        case 'progress': return 'bg-white green border'
        case 'error': return 'bg-red white'
        default: return 'bg-white green border'
      }
    },
    ...mapMutations({
      removeMessage: 'REMOVE_MSG',
      addMessage: 'ADD_MSG'
    })
  }
}
</script>

<style>
  .anim--msg-strobe{
    animation:msg-strobe 1.25s infinite;
  }

  @keyframes msg-strobe {
    0%{ opacity:1; }
    50%{opacity:0.25;}
    100%{opacity:1;}
  }
</style>
