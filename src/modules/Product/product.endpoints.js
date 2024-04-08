import { systemRoles } from "../../utils/system-enums.js";

export const endPointsRoles = {
  ADD_PRODUCT: [systemRoles.SUPER_ADMIN, systemRoles.ADMIN],
  GET_PRODUCTS: [systemRoles.SUPER_ADMIN, systemRoles.ADMIN, systemRoles.USER],
};
