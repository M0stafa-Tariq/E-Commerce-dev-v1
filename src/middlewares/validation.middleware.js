

const reqKeys = ['query', 'body', 'params', 'headers'];

/**
 * loop through reqKeys and validate each key with the schema related to the key
 * if there is any error in validationResult push the error to validationErrorArr after spread it to be 1D array
 * after complete the loop , we check if validationErrorArr.length is greater than 0 then return 400 status code with the error message and the errors array
 * if there is no length then call next()
 */
export const validationMiddleware = (schema) => {
    return (req, res, next) => {
        let validationErrorArr = []
        for (const key of reqKeys) {
            const validationResult = schema[key]?.validate(req[key], { abortEarly: false })
            if (validationResult?.error) {
                validationErrorArr.push(...validationResult.error.details)
            }
        }

        if (validationErrorArr.length) {
            return res.status(400).json({
                err_msg: "validation error",
                errors: validationErrorArr.map(ele => ele.message)
            })
        }

        next()
    }
}
