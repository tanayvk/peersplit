<template>
  <UCard>
    <template #header>
      <div class="flex justify-between items-center">
        <span class="font-medium">Manage Members</span>
        <UButton
          @click="$emit('close')"
          variant="ghost"
          color="gray"
          icon="i-heroicons-x-mark"
        />
      </div>
    </template>
    <div class="space-y-2">
      <div>
        <div class="flex w-full gap-2">
          <UInput
            class="flex-grow"
            v-model="name"
            placeholder="New member name"
          />
          <UButton variant="outline" @click="add" :disabled="name.length === 0"
            >Add</UButton
          >
        </div>
      </div>
      <div>
        <span class="font-medium py-1 block">Members</span>
        <div v-for="member in members">
          <span class="font-light">
            {{ member.name }}
          </span>
        </div>
      </div>
      <UDivider />
      <div class="space-y-2">
        <span class="font-medium py-1 block">Invite Link</span>
        <UAlert
          color="blue"
          variant="subtle"
          icon="i-heroicons-information-circle"
          description="Anyone with this link can join the group and edit or delete transactions. Only share it with
          people you trust."
        />
        <UButtonGroup class="w-full" size="sm" orientation="horizontal">
          <UInput disabled v-model="link" :ui="{ wrapper: 'flex-grow' }" />
          <UTooltip
            :text="copied ? 'Copied!' : 'Copy'"
            class="w-fit cursor-pointer flex space-x-2 items-center"
            :popper="{ placement: 'right', arrow: true }"
          >
            <UButton
              @click="copy"
              icon="i-heroicons-clipboard-document"
              color="gray"
            />
          </UTooltip>
        </UButtonGroup>
      </div>
    </div>
  </UCard>
</template>

<script setup>
import { nanoid } from "nanoid";
const groupID = useRoute().params.group_id;
const members = computed(() => useGroups().getMembersList(groupID));
const name = ref(""),
  copied = ref(false);
const link = import.meta.client
  ? `${window.location.origin}/app/groups/join/${groupID}`
  : "";
function add() {
  useGroups().addMember(groupID, { id: nanoid(), name: name.value });
  name.value = "";
}
function copy() {
  navigator.clipboard.writeText(link);
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 2000);
}
</script>
