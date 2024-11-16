class ValidationError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'ValidationError'
    }
}

class LLMResponseFormatError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'LLMResponseFormatError'
    }
}