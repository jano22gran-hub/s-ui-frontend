<template>
  <v-navigation-drawer
    v-model="showDrawer"
    :temporary="isMobile"
    :expand-on-hover="!isMobile"
    :rail="!isMobile"
    :permanent="!isMobile"
    @click="isMobile ? $emit('toggleDrawer') : null"
  >
    <v-list-item
      height="63"
      prepend-avatar="@/assets/logo.svg"
      title="S-UI"
    >
      <template
        v-if="isMobile"
        #append
      >
        <v-icon icon="mdi-close" />
      </template>
    </v-list-item>

    <v-divider />

    <v-list
      density="compact"
      nav
    >
      <template
        v-for="(group, gi) in menu"
        :key="group.title"
      >
        <v-divider
          v-if="gi > 0"
          class="my-1"
        />
        <v-list-subheader class="menu-group">
          {{ $t(group.title) }}
        </v-list-subheader>
        <v-list-item
          v-for="item in group.items"
          :key="item.title"
          link
          rounded="lg"
          :to="item.path"
          :active="router.currentRoute.value.path == item.path"
        >
          <template #prepend>
            <v-icon :icon="item.icon" />
          </template>
          <v-list-item-title>{{ $t(item.title) }}</v-list-item-title>
        </v-list-item>
      </template>
    </v-list>
    <template #append>
      <v-list-item
        prepend-icon="mdi-logout"
        :title="$t('menu.logout')"
        @click="Logout"
      />
    </template>
  </v-navigation-drawer>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import router from '@/router'
import { logout } from '@/plugins/httputil'

const props = defineProps<{ isMobile: boolean, displayDrawer: boolean }>()
defineEmits<{ toggleDrawer: [] }>()

const showDrawer = computed((): boolean => {
  return props.displayDrawer
})

// Grouped by what the operator is doing, not by sing-box section: traffic in,
// routing out, extra servers, then panel administration.
const menu = [
  { title: 'menu.overview', items: [
    { title: 'pages.home', icon: 'mdi-view-dashboard', path: '/' },
  ]},
  { title: 'menu.users', items: [
    { title: 'pages.inbounds', icon: 'mdi-cloud-download', path: '/inbounds' },
    { title: 'pages.clients', icon: 'mdi-account-multiple', path: '/clients' },
    { title: 'pages.tls', icon: 'mdi-certificate', path: '/tls' },
  ]},
  { title: 'menu.routing', items: [
    { title: 'pages.outbounds', icon: 'mdi-cloud-upload', path: '/outbounds' },
    { title: 'pages.endpoints', icon: 'mdi-cloud-tags', path: '/endpoints' },
    { title: 'pages.rules', icon: 'mdi-routes', path: '/rules' },
    { title: 'pages.dns', icon: 'mdi-dns', path: '/dns' },
  ]},
  { title: 'menu.services', items: [
    { title: 'pages.services', icon: 'mdi-server', path: '/services' },
    { title: 'pages.dnstunnels', icon: 'mdi-tunnel', path: '/dnstunnels' },
  ]},
  { title: 'menu.system', items: [
    { title: 'pages.basics', icon: 'mdi-application-cog', path: '/basics' },
    { title: 'pages.admins', icon: 'mdi-account-tie', path: '/admins' },
    { title: 'pages.settings', icon: 'mdi-cog', path: '/settings' },
  ]},
]

const Logout = async () => {
  logout()
}
</script>
<style scoped>
/* In rail mode only icons fit; the group titles show once the drawer opens. */
.v-navigation-drawer--rail:not(.v-navigation-drawer--is-hovering) .menu-group {
  visibility: hidden;
  height: 0;
  min-height: 0;
  padding: 0;
}
.menu-group {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  min-height: 28px;
}
</style>
