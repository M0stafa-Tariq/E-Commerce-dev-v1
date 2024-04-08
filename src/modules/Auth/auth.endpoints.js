import { systemRoles } from "../../utils/system-enums.js";

export const endPointsRoles = {
  UPDATE_PASSWORD: [
    systemRoles.ADMIN,
    systemRoles.SUPER_ADMIN,
    systemRoles.USER,
    systemRoles.DELIEVER_ROLE,
  ],
};
