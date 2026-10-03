<template>
  <v-dialog
    transition="dialog-bottom-transition"
    width="800"
  >
    <v-card class="rounded-lg">
      <v-card-title>
        {{ $t('actions.' + (tunnel.id > 0 ? 'edit' : 'add')) + " " + $t('objects.dnstunnel') }}
      </v-card-title>
      <v-divider />
      <v-card-text style="padding: 0 16px; overflow-y: auto;">
        <v-alert
          type="info"
          variant="tonal"
          density="compact"
          class="my-3"
          :text="$t('dnstunnel.dnsHint')"
        />
        <v-row>
          <v-col
            cols="12"
            sm="6"
          >
            <v-text-field
              v-model="tunnel.tag"
              :label="$t('objects.tag')"
              hide-details
            />
          </v-col>
          <v-col
            cols="12"
            sm="6"
          >
            <v-switch
              v-model="tunnel.enable"
              color="primary"
              :label="$t('enable')"
              hide-details
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <v-text-field
              v-model="tunnel.domain"
              :label="$t('dnstunnel.domain')"
              placeholder="t.example.com"
              dir="ltr"
              hide-details
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col
            cols="12"
            sm="6"
          >
            <v-text-field
              v-model="tunnel.listen"
              :label="$t('in.addr')"
              placeholder="0.0.0.0"
              dir="ltr"
              hide-details
            />
          </v-col>
          <v-col
            cols="12"
            sm="6"
          >
            <v-text-field
              v-model.number="tunnel.port"
              type="number"
              min="1"
              max="65535"
              :label="$t('in.port') + ' (UDP)'"
              hide-details
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col
            cols="12"
            sm="6"
          >
            <v-select
              v-model="tunnel.inbound"
              :items="inTags"
              :label="$t('dnstunnel.inbound')"
              :hint="$t('dnstunnel.inboundHint')"
              persistent-hint
            />
          </v-col>
          <v-col
            cols="12"
            sm="6"
          >
            <v-select
              v-model="tunnel.client"
              :items="clientNames"
              :label="$t('dnstunnel.client')"
              :hint="$t('dnstunnel.clientHint')"
              persistent-hint
              clearable
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col
            cols="12"
            sm="6"
          >
            <v-select
              v-model="tunnel.method"
              :items="DnsTunnelMethods"
              :label="$t('dnstunnel.method')"
              hide-details
            />
          </v-col>
          <v-col
            cols="12"
            sm="6"
          >
            <v-text-field
              v-model="tunnel.key"
              :label="$t('dnstunnel.key')"
              :hint="$t('dnstunnel.keyHint')"
              :disabled="tunnel.method == 0"
              persistent-hint
              dir="ltr"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <v-textarea
              v-model="optionsText"
              :label="$t('dnstunnel.options')"
              :error-messages="optionsError"
              placeholder="{ &quot;UPLOAD_COMPRESSION_TYPE&quot;: 1 }"
              rows="3"
              auto-grow
              dir="ltr"
            />
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          color="primary"
          variant="outlined"
          @click="$emit('close')"
        >
          {{ $t('actions.close') }}
        </v-btn>
        <v-btn
          color="primary"
          variant="tonal"
          :loading="loading"
          :disabled="!tunnel.tag || !tunnel.domain || !tunnel.inbound || optionsError != ''"
          @click="saveChanges"
        >
          {{ $t('actions.save') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import Data from '@/store/modules/data'
import { DnsTunnel, DnsTunnelMethods, createDnsTunnel } from '@/types/dnsTunnels'
import RandomUtil from '@/plugins/randomUtil'

const props = defineProps<{ visible: boolean, data: string }>()
const emit = defineEmits<{ close: [] }>()

const tunnel = ref<DnsTunnel>(createDnsTunnel(''))
const optionsText = ref('')
const loading = ref(false)

watch(() => props.visible, (v) => {
  if (!v) return
  tunnel.value = props.data ? JSON.parse(props.data) : createDnsTunnel('dns-' + RandomUtil.randomSeq(3))
  delete tunnel.value.status
  optionsText.value = tunnel.value.options ? JSON.stringify(tunnel.value.options, null, 2) : ''
})

const optionsError = computed((): string => {
  if (optionsText.value.trim() == '') return ''
  try {
    const o = JSON.parse(optionsText.value)
    return o && typeof o == 'object' && !Array.isArray(o) ? '' : 'JSON object'
  } catch {
    return 'JSON'
  }
})

// Only socks and mixed inbounds can be the tunnel's exit.
const inTags = computed((): string[] => {
  return Data().inbounds?.filter(i => i.type == 'socks' || i.type == 'mixed').map(i => i.tag) ?? []
})

const clientNames = computed((): string[] => {
  const inb = Data().inbounds?.find(i => i.tag == tunnel.value.inbound)
  return Data().clients
    ?.filter(c => !inb || c.inbounds?.includes(inb.id))
    .map(c => c.name) ?? []
})

const saveChanges = async () => {
  loading.value = true
  const t = { ...tunnel.value, client: tunnel.value.client ?? '' }
  t.options = optionsText.value.trim() ? JSON.parse(optionsText.value) : null
  const success = await Data().save('dnstunnels', t.id > 0 ? 'edit' : 'new', t)
  loading.value = false
  if (success) emit('close')
}
</script>
