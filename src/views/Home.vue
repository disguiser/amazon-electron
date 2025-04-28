<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png" />
    <HelloWorld msg="Welcome to Your Vue.js + TypeScript App in Electron" />
    <div class="counter">
      <p>Count: {{ count }}</p>
      <p>Double Count: {{ doubleCount }}</p>
      <button @click="increment">Increment</button>
      <button @click="incrementAsync">Increment Async</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useStore } from 'vuex'
import HelloWorld from '@/components/HelloWorld.vue'

export default defineComponent({
  name: 'Home',
  components: {
    HelloWorld
  },
  setup() {
    const store = useStore()
    
    return {
      count: computed(() => store.state.count),
      doubleCount: computed(() => store.getters.doubleCount),
      increment: () => store.commit('increment'),
      incrementAsync: () => store.dispatch('incrementAsync')
    }
  }
})
</script>

<style scoped>
.home {
  text-align: center;
  margin-top: 40px;
}

.counter {
  margin-top: 20px;
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 8px;
  display: inline-block;
}

button {
  margin: 0 5px;
  padding: 8px 16px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #3aa876;
}
</style>
