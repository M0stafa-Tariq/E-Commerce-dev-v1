import { systemRoles } from "../../utils/system-enums.js";

export const endPointsRoles={
    ADD_REVIEW:[systemRoles.USER],
    DELETE_REVIEW:[systemRoles.USER,systemRoles.ADMIN,systemRoles.SUPER_ADMIN]
}