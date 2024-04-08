import { systemRoles } from "../../utils/system-enums.js";

export const endPointsRoles = {
  UPDATE_USER: [systemRoles.USER],
  DELETE_USER: [
    systemRoles.USER,
    systemRoles.ADMIN,
    systemRoles.SUPER_ADMIN,
    systemRoles.DELIEVER_ROLE,
  ],
  GET_PROFILE_DATA: [
    systemRoles.ADMIN,
    systemRoles.DELIEVER_ROLE,
    systemRoles.SUPER_ADMIN,
    systemRoles.USER,
  ],
};
