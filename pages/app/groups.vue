<template>
  <div
    v-if="useRoute().name === 'app-groups' && !useGroups().currentGroup"
    class="flex flex-col h-full px-3 pt-5 space-y-4"
  >
    <div class="flex w-full gap-1">
      <UButton
        class="flex-grow"
        variant="solid"
        icon="i-heroicons-plus"
        size="lg"
        @click="showCreateGroupModal = true"
        >Create Group</UButton
      >
      <UButton
        class="flex-grow"
        variant="outline"
        icon="i-heroicons-arrow-right-circle"
        size="lg"
        @click="showJoinGroup = true"
        >Join Group</UButton
      >
    </div>
    <SpinLoader v-if="loading" height="flex-grow" />
    <div v-if="!loading && groupsList?.length === 0">
      <UAlert
        icon="i-heroicons-information-circle"
        title="No groups"
        description="You are not part of any groups."
        color="primary"
        variant="outline"
      />
    </div>
    <UAlert
      v-if="!loading && !useName().value"
      color="red"
      icon="i-heroicons-exclamation-triangle"
      variant="subtle"
      title="Name Needed!"
      description="It looks like you haven't set a name yet. Please update your name in settings."
      :actions="[
        {
          click() {
            navigateTo('/app/settings');
          },
          variant: 'solid',
          color: 'red',
          label: 'Go to Settings',
        },
      ]"
    />

    <div class="space-y-2" v-if="!loading && groupsList.length > 0">
      <GroupItem v-for="group in groupsList" :key="group.id" :group="group" />
    </div>
    <UModal v-model="showJoinGroup">
      <UCard>
        <template #header>
          <div class="flex justify-between items-center">
            <span class="font-medium">Join Group</span>
            <UButton
              @click="showJoinGroup = false"
              variant="ghost"
              color="gray"
              icon="i-heroicons-x-mark"
            />
          </div>
        </template>
        <UFormGroup label="Invite Link">
          <UInput
            placeholder="Paste the group invite link here"
            v-model="inviteLink"
          />
        </UFormGroup>
        <template #footer>
          <div class="flex gap-2">
            <UButton :disabled="invalidUrl" @click="joinGroup" variant="outline"
              >Join</UButton
            >
            <UButton @click="showJoinGroup = false" variant="link" color="white"
              >Cancel</UButton
            >
          </div>
        </template>
      </UCard>
    </UModal>
    <UModal v-model="showCreateGroupModal">
      <UCard>
        <template #header>
          <div class="flex justify-between items-center">
            <span class="font-medium">Create Group</span>
            <UButton
              @click="showCreateGroupModal = false"
              variant="ghost"
              color="gray"
              icon="i-heroicons-x-mark"
            />
          </div>
        </template>
        <div class="space-y-2">
          <UFormGroup label="Group Name">
            <UInput placeholder="New Group" v-model="groupName" />
          </UFormGroup>
          <UFormGroup label="Currency Symbol">
            <UInput placeholder="ex: $ or ₹" v-model="currency" />
          </UFormGroup>
        </div>
        <template #footer>
          <div class="flex gap-2">
            <UButton :loading="creatingGroup" @click="create" variant="outline"
              >Create</UButton
            >
            <UButton
              @click="showCreateGroupModal = false"
              variant="link"
              color="white"
              >Cancel</UButton
            >
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
  <Group v-else-if="useGroups().currentGroup" />
  <NuxtPage v-else />
</template>

<script setup>
const showCreateGroupModal = ref(false),
  groupName = ref(""),
  creatingGroup = ref(false),
  showJoinGroup = ref(false),
  inviteLink = ref(""),
  currency = ref("");
const invitePath = computed(() => {
  try {
    const url = new URL(inviteLink.value);
    return url.pathname;
  } catch {
    return null;
  }
});
const invalidUrl = computed(
  () => !invitePath.value || !invitePath.value.startsWith("/app/groups/join/"),
);
const { loading, groupsList } = storeToRefs(useGroups());
async function create() {
  creatingGroup.value = true;
  await createGroup(groupName.value, currency.value);
  creatingGroup.value = false;
  showCreateGroupModal.value = false;
  groupName.value = "";
  currency.value = "";
}
async function joinGroup() {
  navigateTo(invitePath.value);
  inviteLink.value = "";
  showJoinGroup.value = false;
}
</script>
