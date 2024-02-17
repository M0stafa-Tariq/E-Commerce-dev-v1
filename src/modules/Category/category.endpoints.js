import { systemRoles } from "../../utils/system-roles.js";

export const endPointsRoles = {
    ADD_CATEGORY:[systemRoles.SUPER_ADMIN],
    GET_CATEGORIES:[systemRoles.ADMIN,systemRoles.SUPER_ADMIN,systemRoles.USER]
}