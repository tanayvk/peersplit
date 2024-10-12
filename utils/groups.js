export const navigateToGroup = (groupID) => {
  useGroups().setCurrentGroup(groupID);
  navigateTo("/app/groups");
};
