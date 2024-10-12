<template>
  <div class="space-y-2">
    <div>
      <UFormGroup label="Add Member">
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
      </UFormGroup>
    </div>
    <div>
      <div class="flex gap-2 items-center">
        <span class="font-medium py-1 block">Members </span>
        <div v-if="myID && !assigning">
          <UButton @click="assigning = true" variant="link" class="p-0"
            >Assign</UButton
          >
        </div>
        <div v-if="myID && assigning">
          <UButton @click="assigning = false" variant="link" class="p-0"
            >Cancel</UButton
          >
        </div>
      </div>
      <div v-for="member in members">
        <div class="flex gap-2 items-center">
          <span
            :class="[
              'font-light text-primary-700 dark:text-primary-300',
              member.id === myID && 'font-medium',
            ]"
          >
            {{ member.name }}
            {{ member.id === myID ? " (You)" : "" }}
          </span>
          <UButton
            variant="link"
            class="p-0"
            v-if="(!myID || assigning) && myID !== member.id"
            @click="assign(member.id)"
            >That's me!</UButton
          >
        </div>
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
</template>

<script setup>
import { nanoid } from "nanoid";
const groupID = useGroupID();
const assigning = ref(false);
const members = computed(() => useGroups().getMembersList(groupID));
const myID = computed(() => {
  const { myID } = useGroups().getGroupByID(groupID);
  return myID;
});
const name = ref(""),
  copied = ref(false);
const link = import.meta.client
  ? `${window.location.origin}/app/groups/join/${groupID}`
  : "";
function add() {
  useGroups().addMember(groupID, { id: nanoid(), name: name.value });
  name.value = "";
}
function assign(id) {
  assigning.value = false;
  useGroups().assignMember(groupID, id);
}
function copy() {
  navigator.clipboard.writeText(link);
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 2000);
}
</script>
