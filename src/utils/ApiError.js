class ApiError extends Error {
    constructor(
        status,
        message = "Somthing went wrong",
        errors = [],
        statck = ""
    ) {
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false
        this.errors = errors

    }
}
export { ApiError }