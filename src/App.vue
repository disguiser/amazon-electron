<template>
  <div class="app">
    <header>
      <nav>
        <router-link to="/">Home</router-link> |
        <router-link to="/about">About</router-link>
      </nav>
    </header>
    <main>
      <router-view />
    </main>
    <footer>
      <p>Vue.js + TypeScript + Electron Application</p>
    </footer>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'App'
})
</script>

<style>
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

header {
  background-color: #42b983;
  padding: 20px;
  text-align: center;
}

nav {
  padding: 10px 0;
}

nav a {
  color: white;
  margin: 0 10px;
  text-decoration: none;
  font-weight: bold;
}

nav a.router-link-active {
  text-decoration: underline;
}

main {
  flex: 1;
  padding: 20px;
}

footer {
  background-color: #f5f5f5;
  padding: 20px;
  text-align: center;
  color: #666;
}
</style>
