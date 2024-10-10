<template>
  <div
    v-if="useRoute().name === 'app-groups'"
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
    <div class="space-y-2" v-if="!loading && groupsList.length > 0">
      <GroupItem v-for="group in groupsList" :key="group.id" :group="group" />
    </div>
    <UModal v-model="showJoinGroup">
      <UCard>
        <template #header>
          <span class="font-medium">Join Group</span>
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
          <span class="font-medium">Create Group</span>
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
  console.log("navigate", invitePath.value);
  navigateTo(invitePath.value);
  inviteLink.value = "";
  showJoinGroup.value = false;
}
</script>
