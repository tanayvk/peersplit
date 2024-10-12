<template>
  <div class="flex flex-col gap-2 h-full px-2">
    <div class="h-12 flex justify-between items-center gap-2">
      <UButton
        to="/app/groups"
        icon="i-heroicons-arrow-left"
        variant="ghost"
        color="gray"
        square
      />
      <span class="text-center font-medium text-lg"> Join Group </span>
      <UButton
        disabled
        icon="i-heroicons-information-circle"
        variant="ghost"
        color="gray"
        square
      />
    </div>
    <SpinLoader :text="text" height="h-full" />
  </div>
</template>

<script setup>
const groupID = useRoute().params.group_id?.[0];
const text = ref("Finding group..."),
  found = ref(false);
const cancel = ref(null);
onMounted(async () => {
  if (await getGroup(groupID)) {
    navigateTo(`/app/groups/group/${groupID}`);
    return;
  }
  const [c, promise] = findGroup(groupID);
  setTimeout(() => {
    if (!found.value) {
      text.value =
        "This is taking longer than expected.\nPlease ask one of your group members to open PeerSplit.";
    }
  }, 5000);
  cancel.value = c;
  await promise;
  found.value = true;
  text.value = "Fetching group data...";
  await createEmptyGroup(groupID);
  await updateGroup(groupID);
  groupOnApply(groupID, () => {
    navigateTo(`/app/groups/group/${groupID}`);
  });
  listenGroup(useGroups().getGroupByID(groupID));
});
onBeforeUnmount(() => {
  if (cancel.value) cancel.value.value = true;
});
</script>
