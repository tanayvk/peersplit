export const useName = () => useState("name", () => "");

export const setName = (name) => {
  useName().value = name;
  localStorage.setItem("peersplit.name", name);
};
