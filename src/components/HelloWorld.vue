<template>
  <div class="hello">
    <h2>{{ msg }}</h2>
    <p>
      For a guide and recipes on how to configure / customize this project,<br>
      check out the
      <a href="https://cli.vuejs.org" target="_blank" rel="noopener">vue-cli documentation</a>.
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'HelloWorld',
  props: {
    msg: {
      type: String,
      required: true
    }
  }
});
</script>

<style scoped>
.hello {
  margin: 20px 0;
}
h2 {
  margin: 20px 0 0;
}
</style>
