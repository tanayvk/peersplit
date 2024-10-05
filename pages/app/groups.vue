<template>
  <div
    v-if="useRoute().name === 'app-groups'"
    class="flex flex-col h-full px-3 pt-5 space-y-4"
  >
    <UButton
      variant="solid"
      icon="i-heroicons-plus"
      size="lg"
      class="w-full"
      @click="showCreateGroupModal = true"
      >Create Group</UButton
    >
    <SpinLoader v-if="loading" height="flex-grow" />
    <UAlert
      icon="i-heroicons-information-circle"
      v-if="!loading && groupsList.length === 0"
      title="No groups"
      description="You are not part of any groups."
      color="primary"
      variant="outline"
    />
    <div class="space-y-2" v-if="!loading && groupsList.length > 0">
      <UCard
        v-for="group in Object.values(groupsList)"
        :key="group.id"
        class="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-950"
        :ui="{
          body: { padding: 'py-2' },
          rounded: 'rounded-none',
          shadow: 'shadow-none',
        }"
        @click="navigateTo(`/app/groups/group/${group.id}`)"
      >
        <div class="flex items-center space-y-2">
          <div
            class="text-2xl font-medium text-primary-700 dark:text-primary-300 flex-grow"
          >
            {{ group.name }}
          </div>
          <div v-if="group.balance > 0" class="flex flex-col items-end">
            <span class="text-xs">You owe</span>
            <span class="text-xl color-positive">${{ group.balance }}</span>
          </div>
          <div v-if="group.balance < 0" class="flex flex-col items-end">
            <span class="text-xs">You are owed</span>
            <span class="text-xl color-negative">${{ -group.balance }}</span>
          </div>
        </div>
      </UCard>
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
