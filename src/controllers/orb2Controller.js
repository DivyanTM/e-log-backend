import { fetchOperation, processOperation } from "../services/orb2Service.js";
  
async function handleOperation(req, res) {
    try {
        const { operationType, formData } = req.body;
        console.log(operationType,formData);
        console.log(req.body);
        if (!operationType || !formData) {
            return res.status(400).json({ message: "Invalid input data" });
        }
        const user = req.user.user_id;
        const vessel = req.user.vessel_id;
        const result = await processOperation(operationType, formData, user, vessel);
        return res.status(200).json(result);

    } catch (error) {
        console.error("Error handling operation:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}


async function getallOperations(req,res) {
    try {
        const vessel = req.user.vessel_id;
        const result = await fetchOperation( vessel);
        return res.status(200).json({message:'Data received successfully',records:result});

    } catch (error) {
        console.error("Error handling operation:", error);
        return res.status(500).json({ message: error.message });
    }
}


export default { handleOperation, getallOperations };
