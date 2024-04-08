import { systemRoles } from "../../utils/system-enums.js";

export const endPointsRoles = {
  ADD_BRAND: [systemRoles.ADMIN],
  GET_BRANDS: [systemRoles.ADMIN, systemRoles.SUPER_ADMIN, systemRoles.USER],
  DELETE_BRAND: [systemRoles.ADMIN, systemRoles.SUPER_ADMIN],
};
