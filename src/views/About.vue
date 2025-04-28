<template>
  <div class="about">
    <h1>About Page</h1>
    <p>This is an about page for the Vue.js + TypeScript + Electron application.</p>
    <p>
      <router-link to="/">Go back to Home</router-link>
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'About'
})
</script>

<style scoped>
.about {
  text-align: center;
  margin-top: 40px;
  padding: 20px;
}

h1 {
  color: #42b983;
}
</style>
