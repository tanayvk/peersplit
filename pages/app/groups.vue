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
        to="/app/groups/join"
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
    <UModal v-model="showCreateGroupModal">
      <UCard>
        <template #header>
          <span class="font-medium">Create Group</span>
        </template>
        <UFormGroup label="Group Name">
          <UInput placeholder="New Group" v-model="groupName" />
        </UFormGroup>
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
  creatingGroup = ref(false);
const { loading, groupsList } = storeToRefs(useGroups());
async function create() {
  creatingGroup.value = true;
  await createGroup(groupName.value);
  creatingGroup.value = false;
  showCreateGroupModal.value = false;
  groupName.value = "";
}
</script>
