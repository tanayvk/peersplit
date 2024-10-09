export const useName = () => useState("name", () => "");

export const setName = (name) => {
  useName().value = name;
  localStorage.setItem("peersplit.name", name);
  for (const group of Object.values(useGroups().groups)) {
    const member = group.members[group.myID];
    useGroups().updateMember(group.id, { ...member, name });
  }
};
