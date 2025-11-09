import userModel from "../models/user.model.js";

async function readAllUser(request, response, next){
    try {
        //  Step 1: Get all users from DB -> gets all user documents
        const data = await userModel.find().select("-password")
        //  Step 2: Send success response
        return response.status(200).json({data})
    // Error Handling    
    } catch (error) {
        console.log("error from readAllUsers ", error)
        return response.status(400).json({message: "ReadAllusers is failed."})   
    }
}

async function readUser(request, response, next){
    try {
        // Step 1: Extract the ID from URL -> This pulls the id from the URL path.
        const {id} = request.params
        // console.log(id)
        // Step 2: Find the user by ID in MongoDB
        const data = await userModel.findOne({_id:id}).select("-password")
        console.log(data)
        // Step 3: Send success response
        return response.status(200).json(data)

     // Error Handling   
    } catch (error) {
        return next(error)
        // console.log("error from readUser ", error)
        // return response.status(400).json({msg: "ReadUser is failed.", error})  
    }
}


async function updateUser(request, response, next){
    try {
        // Step 1: Get ID from URL
        const {id} = request.params
        // const {username, email, password} = request.body
        //  Step 2: Update the user in the database
        const data = await userModel.findByIdAndUpdate(id, request.body, {new:true}).select("-password")
        console.log(data)
        // Step 3: Return success response
        return response.status(200).json(data)
    //  Error Handling
    } catch (error) {
        console.log("error from updateUser ", error)
        return response.status(400).json({msg: "User update is failed."})
        
    }
}

async function deleteUser(request, response, next){
    try {
        // Step 1: Get ID from URL
        const {id} = request.params
        //  Step 2: Delete user from database
        const data = await userModel.findByIdAndDelete(id)
         console.log(data)
        //  Step 3: Check if user didn’t exist
         if(!data){
            return response.status(404).json({message: "User not found"})
         }

        // Step 4: Send success response
        return response.status(200).json({msg: "User deleted successfully."}, data)
    // Error Handling    
    } catch (error) {
        console.log("error from deleteUser ", error)
        return response.status(400).json({msg: "user deleted failed."})
        
    }
}


export { readAllUser, readUser, updateUser, deleteUser }

