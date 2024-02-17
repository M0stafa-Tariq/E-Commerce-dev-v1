import { systemRoles } from "../../utils/system-roles.js";

export const endPointsRoles = {
    UPDATE_USER : [systemRoles.ADMIN,systemRoles.SUPER_ADMIN,systemRoles.USER]
}