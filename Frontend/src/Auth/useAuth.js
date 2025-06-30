export const useIsAuthenticated = () => {
  const token = localStorage.getItem("token");
  let isAuthenticated = token;
  console.log(token, "test")
  return isAuthenticated;
};
