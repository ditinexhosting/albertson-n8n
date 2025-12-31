<template>
	<div class="shadow bg-white! p-4! flex flex-row justify-between items-center">
		<div>
			<div class="font-bold! text-lg">{{ title }}</div>
			<div v-if="subtitle" class="text-base text-secondary">
				{{ subtitle }}
			</div>
		</div>
		<div><n-input v-if="showSearch" round placeholder="Search workflows, projects .." /></div>
		<div class="cursor-pointer hover:text-primary transition-all">
			<n-badge :value="3" :max="15"><Bell /></n-badge>
		</div>
	</div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { NBadge, NInput } from 'naive-ui';
import { Bell } from 'lucide-vue-next';

const route = useRoute();

const headerMeta = computed(() => route.meta?.header ?? {});

const title = computed(() => headerMeta.value.title ?? '');
const subtitle = computed(() => headerMeta.value?.subtitle ?? null);
const showSearch = computed(() => headerMeta.value.showSearch ?? false);
const showNotifications = computed(() => headerMeta.value.showNotifications ?? false);
</script>

<style scoped>
/* Add any additional custom styles here */
</style>
