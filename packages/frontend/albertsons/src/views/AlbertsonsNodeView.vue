<script setup>
import { defineAsyncComponent } from 'vue';

const NodeView = defineAsyncComponent(() => import('@src/app/views/NodeView.vue'));

//Ensure Editors can edit workflows (and view), while non-editors can only view workflows.
// TODO:
//Set isViewer = false only when the user owns the workflow
// OR the workflow belongs to a project where the user’s role is Editor.
</script>

<template>
	<NodeView :isViewer="true" />
</template>
