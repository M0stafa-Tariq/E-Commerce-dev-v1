import { systemRoles } from "../../utils/system-enums.js";

export const endPointsRoles = {
  ADD_OREDER: [systemRoles.USER],
  DELIVER_ORDER:[systemRoles.DELIEVER_ROLE],
  REFUND_ORDER:[systemRoles.ADMIN,systemRoles.SUPER_ADMIN]
};
