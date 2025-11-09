 async function errorHandler(error, request, response, next){
    console.log("pinki ", error.stack)
    try {
        const statusCode = error.statusCode || 500
        const message = error.message || "Internal Server Error"
        
        return response.status(statusCode).json({message})
        
    } catch (error) {
        console.log("Error from global middleware")
        return response.status(500).json({message:"Internal Server error"})   
    }
 }

 export { errorHandler };