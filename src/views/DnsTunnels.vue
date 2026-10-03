<template>
  <DnsTunnelVue
    v-model="modal.visible"
    :visible="modal.visible"
    :data="modal.data"
    @close="modal.visible = false"
  />
  <v-dialog
    v-model="clientCfg.visible"
    width="600"
  >
    <v-card
      class="rounded-lg"
      :title="$t('dnstunnel.clientConfig') + ' - ' + clientCfg.tag"
    >
      <v-divider />
      <v-card-text>
        <v-textarea
          :model-value="clientCfg.text"
          readonly
          auto-grow
          dir="ltr"
          class="font-monospace"
          hide-details
        />
        <div class="text-caption mt-2">
          {{ $t('dnstunnel.clientHint') }}
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          variant="tonal"
          color="primary"
          prepend-icon="mdi-content-copy"
          @click="copy(clientCfg.text)"
        >
          {{ $t('copyToClipboard') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-row>
    <v-col cols="12">
      <v-card
        rounded="xl"
        variant="tonal"
      >
        <v-card-text class="d-flex flex-wrap align-center ga-3">
          <v-icon
            icon="mdi-dns-outline"
            size="32"
          />
          <div class="flex-grow-1">
            <div class="text-subtitle-1">
              MasterDnsVPN
            </div>
            <div class="text-caption">
              {{ mdvVersion ? $t('dnstunnel.installed') + ': ' + mdvVersion : $t('dnstunnel.notInstalled') }}
            </div>
          </div>
          <v-btn
            :loading="installing"
            variant="outlined"
            prepend-icon="mdi-download"
            @click="install"
          >
            {{ mdvVersion ? $t('dnstunnel.update') : $t('dnstunnel.install') }}
          </v-btn>
          <v-btn
            color="primary"
            prepend-icon="mdi-plus"
            :disabled="!mdvVersion"
            @click="showModal(0)"
          >
            {{ $t('actions.add') }}
          </v-btn>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>

  <v-row v-if="tunnels.length == 0">
    <v-col
      cols="12"
      class="text-center text-medium-emphasis py-10"
    >
      <v-icon
        icon="mdi-dns"
        size="48"
        class="mb-2"
      />
      <div>{{ $t('dnstunnel.empty') }}</div>
    </v-col>
  </v-row>

  <v-row>
    <v-col
      v-for="(item, index) in tunnels"
      :key="item.tag"
      cols="12"
      sm="6"
      md="4"
      lg="3"
    >
      <v-card
        rounded="xl"
        elevation="5"
        :title="item.tag"
      >
        <template #append>
          <v-chip
            size="small"
            label
            :color="!item.enable ? 'grey' : status(item.tag)?.running ? 'success' : 'error'"
          >
            {{ !item.enable ? $t('disable') : status(item.tag)?.running ? $t('dnstunnel.running') : $t('dnstunnel.stopped') }}
          </v-chip>
        </template>
        <v-card-subtitle style="margin-top: -12px;">
          {{ item.domain }}
        </v-card-subtitle>
        <v-card-text>
          <v-row dense>
            <v-col cols="5">
              {{ $t('in.port') }}
            </v-col>
            <v-col
              cols="7"
              dir="ltr"
              class="text-truncate text-end"
            >
              {{ (item.listen || '*') + ':' + item.port }}/udp
            </v-col>
          </v-row>
          <v-row dense>
            <v-col cols="5">
              {{ $t('objects.inbound') }}
            </v-col>
            <v-col
              cols="7"
              class="text-truncate text-end"
            >
              {{ item.inbound }}
            </v-col>
          </v-row>
          <v-row dense>
            <v-col cols="5">
              {{ $t('dnstunnel.client') }}
            </v-col>
            <v-col
              cols="7"
              class="text-truncate text-end"
            >
              {{ item.client || '-' }}
            </v-col>
          </v-row>
          <v-row dense>
            <v-col cols="5">
              {{ $t('dnstunnel.method') }}
            </v-col>
            <v-col
              cols="7"
              class="text-truncate text-end"
            >
              {{ DnsTunnelMethods.find(m => m.value == item.method)?.title }}
            </v-col>
          </v-row>
          <v-row
            v-if="item.enable && status(item.tag)?.lastError && !status(item.tag)?.running"
            dense
          >
            <v-col class="text-error text-caption">
              {{ status(item.tag)?.lastError }}
            </v-col>
          </v-row>
        </v-card-text>
        <v-divider />
        <v-card-actions style="padding: 0;">
          <v-btn
            icon="mdi-file-edit"
            @click="showModal(item.id)"
          >
            <v-icon />
            <v-tooltip
              activator="parent"
              location="top"
              :text="$t('actions.edit')"
            />
          </v-btn>
          <v-btn
            icon="mdi-cellphone-link"
            style="margin-inline-start:0;"
            @click="showClient(item.tag)"
          >
            <v-icon />
            <v-tooltip
              activator="parent"
              location="top"
              :text="$t('dnstunnel.clientConfig')"
            />
          </v-btn>
          <v-btn
            icon="mdi-file-remove"
            style="margin-inline-start:0;"
            color="warning"
            @click="delOverlay[index] = true"
          >
            <v-icon />
            <v-tooltip
              activator="parent"
              location="top"
              :text="$t('actions.del')"
            />
          </v-btn>
          <v-overlay
            v-model="delOverlay[index]"
            contained
            class="align-center justify-center"
          >
            <v-card
              :title="$t('actions.del')"
              rounded="lg"
            >
              <v-divider />
              <v-card-text>{{ $t('confirm') }}</v-card-text>
              <v-card-actions>
                <v-btn
                  color="error"
                  variant="outlined"
                  @click="del(item.tag, index)"
                >
                  {{ $t('yes') }}
                </v-btn>
                <v-btn
                  color="success"
                  variant="outlined"
                  @click="delOverlay[index] = false"
                >
                  {{ $t('no') }}
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-overlay>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import Clipboard from 'clipboard'
import { push } from 'notivue'
import { i18n } from '@/locales'
import Data from '@/store/modules/data'
import HttpUtils from '@/plugins/httputil'
import DnsTunnelVue from '@/layouts/modals/DnsTunnel.vue'
import { DnsTunnel, DnsTunnelMethods, DnsTunnelStatus } from '@/types/dnsTunnels'

const tunnels = computed((): DnsTunnel[] => Data().dnsTunnels ?? [])

// Process state changes without a config change, so it is polled here rather
// than waiting for api/load to send the list again.
const statuses = ref<Record<string, DnsTunnelStatus | undefined>>({})
const mdvVersion = ref('')
const status = (tag: string) => statuses.value[tag] ?? tunnels.value.find(t => t.tag == tag)?.status

const refresh = async () => {
  const msg = await HttpUtils.get<{ dnstunnels: DnsTunnel[], mdvVersion: string }>('api/dnstunnels')
  if (msg.success) {
    mdvVersion.value = msg.obj.mdvVersion ?? ''
    const s: Record<string, DnsTunnelStatus | undefined> = {}
    msg.obj.dnstunnels?.forEach(t => { s[t.tag] = t.status })
    statuses.value = s
  }
}

let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  refresh()
  timer = setInterval(refresh, 5000)
})
onUnmounted(() => clearInterval(timer))

const installing = ref(false)
const install = async () => {
  installing.value = true
  const msg = await HttpUtils.post<string>('api/dnstunnelInstall', {})
  installing.value = false
  if (msg.success) {
    push.success({ message: i18n.global.t('dnstunnel.installed') + ': ' + msg.obj, duration: 5000 })
    refresh()
  }
}

const modal = ref({ visible: false, data: '' })
const showModal = (id: number) => {
  modal.value.data = id == 0 ? '' : JSON.stringify(tunnels.value.find(t => t.id == id))
  modal.value.visible = true
}

const clientCfg = ref({ visible: false, tag: '', text: '' })
const showClient = async (tag: string) => {
  const msg = await HttpUtils.get<string>('api/dnstunnelClient', { tag })
  if (msg.success) {
    clientCfg.value = { visible: true, tag, text: msg.obj }
  }
}

const copy = (txt: string) => {
  const btn = document.createElement('button')
  btn.className = 'clipboard-btn'
  document.body.appendChild(btn)
  const clipboard = new Clipboard('.clipboard-btn', { text: () => txt })
  const done = (ok: boolean) => {
    clipboard.destroy()
    btn.remove()
    if (ok) push.success({ message: i18n.global.t('success') + ': ' + i18n.global.t('copyToClipboard'), duration: 3000 })
  }
  clipboard.on('success', () => done(true))
  clipboard.on('error', () => done(false))
  btn.click()
}

const delOverlay = ref(new Array<boolean>())
const del = async (tag: string, index: number) => {
  const success = await Data().save('dnstunnels', 'del', tag)
  if (success) delOverlay.value[index] = false
}
</script>
