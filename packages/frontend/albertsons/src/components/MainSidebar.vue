<script setup>
import { ref, watch, h } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import albertsonsLogo from '../assets/albertsons-logo.png';
import { NIcon, NDropdown } from 'naive-ui';
import {
	Activity,
	Bot,
	FolderKanban,
	Play,
	LayoutTemplate,
	Users,
	Store,
	ShieldCheck,
	Settings,
	ChevronLeft,
	ChevronRight,
	ChevronDown,
	CircleUserRound,
	LogOut,
} from 'lucide-vue-next';
import { useUsersStore } from '@/features/settings/users/users.store';
const { currentUser, logout } = useUsersStore();

const router = useRouter();
const route = useRoute();
const isCollapsed = ref(false);

function renderIcon(icon) {
	return () => {
		return h(NIcon, null, {
			default: () => h(icon),
		});
	};
}

const options = [
	{
		label: 'User Profile',
		key: 'profile',
		icon: renderIcon(CircleUserRound),
		disabled: true,
	},
	{
		label: 'Logout',
		key: 'logout',
		icon: renderIcon(LogOut),
	},
];

const menuItems = ref([
	{ label: 'Pulse', icon: Activity, path: '/dashboard', active: false },
	{ label: 'My Agents', icon: Bot, path: '/agents', active: false },
	{ label: 'Projects', icon: FolderKanban, path: '/projects', active: false },
	{ label: 'Executions', icon: Play, path: '/executions', active: false },
	{ label: 'Templates', icon: LayoutTemplate, path: '/templates', active: false },
	{ label: 'Agent Library', icon: Store, path: '/agent-library', active: false },
	{ label: 'Teams', icon: Users, path: '/teams', active: false },
	{ label: 'Settings', icon: Settings, path: '/settings', active: false },
	{ label: 'Admin Console', icon: ShieldCheck, path: '/superadmin', active: false },
]);

function navigate(item) {
	router.push(item.path);
	updateActiveState();
}

function updateActiveState() {
	menuItems.value.forEach((i) => (i.active = false));
	menuItems.value.forEach((i) => {
		if (route.path.startsWith(i.path)) i.active = true;
	});
}

function toggleSidebar() {
	isCollapsed.value = !isCollapsed.value;
}

async function handleSelect(key) {
	if (key === 'logout') {
		try {
			await logout();
			router.push('/login');
		} catch (err) {
			console.error('Error while logging out ->', err);
		}
	}
}

watch(() => route.path, updateActiveState, { immediate: true });
</script>

<template>
	<aside class="sidebar" :class="{ 'sidebar--collapsed': isCollapsed }">
		<!-- Header -->
		<div class="pt-5! px-4! pb-3! flex items-center gap-1.5">
			<img :src="albertsonsLogo" alt="Albertsons" class="h-8 w-8 object-contain shrink-0" />
			<div v-if="!isCollapsed" class="overflow-hidden whitespace-nowrap">
				<div class="text-base font-bold text-(--color--primary)">Albertsons</div>
			</div>
		</div>

		<!-- AI AgentSpace Title -->
		<div
			v-if="!isCollapsed"
			class="px-3.75 pt-0 pb-4! pl-8! block m-auto text-[15px] text-(--color--primary) font-semibold"
		>
			AI AgentSpace
		</div>

		<!-- Navigation -->
		<nav class="sidebar-nav">
			<template v-for="item in menuItems" :key="item.key">
				<button
					class="w-full border-0 bg-transparent flex items-center gap-3 px-3 py-2 mb-1 rounded-(--radius) text-(--color--text) text-sm cursor-pointer transition-all duration-200 text-left"
					:class="{ 'sidebar-nav-item--active': item.active }"
					@click="navigate(item)"
					:title="isCollapsed ? item.label : ''"
				>
					<NIcon :size="18">
						<component :is="item.icon" />
					</NIcon>

					<span v-if="!isCollapsed" class="whitespace-nowrap overflow-hidden text-ellipsis">
						{{ item.label }}
					</span>
				</button>

				<!-- Divider after Executions -->
				<div v-if="item.label === 'Executions'" class="my-2! h-px! bg-border-primary!" />
			</template>
		</nav>

		<!-- Footer with User Profile -->
		<div class="sidebar-footer">
			<n-dropdown
				trigger="click"
				placement="right-end"
				size="large"
				teleport="body"
				:options="options"
				@select="handleSelect"
				class="p-2! rounded-md!"
			>
				<div class="sidebar-user cursor-pointer">
					<div class="sidebar-user-avatar">
						{{
							currentUser?.fullName
								?.split(' ')
								.filter((_, i, arr) => i === 0 || i === arr.length - 1)
								.map((name) => name[0])
								.join('')
						}}
					</div>

					<div v-if="!isCollapsed" class="sidebar-user-info">
						<div class="sidebar-user-name">{{ currentUser?.fullName }}</div>
						<div class="sidebar-user-role">
							{{ currentUser?.email }}
						</div>
					</div>

					<NIcon>
						<component :is="ChevronDown" />
					</NIcon>
				</div>
			</n-dropdown>
		</div>

		<!-- Toggle Button - Right Side Middle -->
		<button
			class="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border border-(--border-color--light) bg-(--color--background--light-3) text-(--color--text) cursor-pointer flex items-center justify-center transition-all duration-200 z-10 shadow-(--shadow--light) hover:bg-(--color--background--light-2) hover:border-(--border-color) hover:shadow-(--shadow)"
			@click="toggleSidebar"
			:title="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
		>
			<NIcon>
				<component :is="isCollapsed ? ChevronRight : ChevronLeft" />
			</NIcon>
		</button>
	</aside>
</template>

<style scoped>
.sidebar {
	width: 190px;
	min-height: 100vh;
	border-right: 1px solid var(--border-color--light);
	background-color: var(--color--background--light-3);
	display: flex;
	flex-direction: column;
	transition: width 0.3s ease;
	position: relative;
}

.sidebar--collapsed {
	width: 64px;
}

/* Navigation */
.sidebar-nav {
	padding: 8px 12px;
	flex: 1;
	overflow-y: auto;
}

.sidebar--collapsed .sidebar-nav-item {
	justify-content: center;
	padding: 10px;
}

.sidebar-nav-item:hover {
	background-color: var(--color--background--light-2);
}

.sidebar-nav-item--active {
	background-color: var(--color--background--light-1);
	color: var(--color--primary);
	font-weight: 500;
}

/* Footer with User Profile */
.sidebar-footer {
	padding: 12px 16px;
	border-top: 1px solid var(--border-color--light);
}

.sidebar-user {
	display: flex;
	align-items: center;
	gap: 10px;
	cursor: pointer;
	padding: 6px;
	border-radius: var(--radius);
	transition: background 0.2s;
}

.sidebar-user:hover {
	background-color: var(--color--background--light-2);
}

.sidebar--collapsed .sidebar-user {
	justify-content: center;
	padding: 6px;
}

.sidebar-user-avatar {
	width: 36px;
	height: 36px;
	border-radius: 50%;
	background: var(--color--primary);
	color: var(--color--text--tint-3);
	display: flex;
	align-items: center;
	justify-content: center;
	font-weight: 600;
	font-size: 13px;
	flex-shrink: 0;
}

.sidebar-user-info {
	overflow: hidden;
	white-space: nowrap;
	flex: 1;
}

.sidebar-user-name {
	font-size: 13px;
	font-weight: 600;
	color: var(--color--text--shade-1);
	overflow: hidden;
	text-overflow: ellipsis;
}

.sidebar-user-role {
	font-size: 11px;
	color: var(--color--text);
	overflow: hidden;
	text-overflow: ellipsis;
}

.sidebar-user-dropdown {
	width: 16px;
	height: 16px;
	color: var(--color--text--tint-1);
	flex-shrink: 0;
}

/* Scrollbar */
.sidebar-nav::-webkit-scrollbar {
	width: 4px;
}

.sidebar-nav::-webkit-scrollbar-track {
	background: transparent;
}

.sidebar-nav::-webkit-scrollbar-thumb {
	background: var(--color--foreground);
	border-radius: 2px;
}

.sidebar-nav::-webkit-scrollbar-thumb:hover {
	background: var(--color--foreground--shade-1);
}

/* Responsive */
@media (max-width: 768px) {
	.sidebar {
		position: fixed;
		left: 0;
		top: 0;
		z-index: 1000;
		height: 100vh;
	}

	.sidebar--collapsed {
		transform: translateX(-100%);
	}

	.sidebar-collapse-toggle {
		display: none;
	}
}
</style>
