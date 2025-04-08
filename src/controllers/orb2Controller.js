import { fetchOperation, processOperation } from "../services/orb2Service.js";
import { fetchReceptionFacility,fetchMixedCargo,fetchOtherMethod,fetchTransferToTank } from "../services/orb2Service.js";
  
  async function getallCTDmethods(req, res) {
    try {
      const { methodType } = req.params;
  
      if (!methodType) {
        return res.status(400).json({ message: "Method type is required" });
      }
  
      const vessel = req.user.vessel_id;
  
      let result = [];
  
      switch (methodType) {
        case "disposal to reception facilities":
          result = await fetchReceptionFacility(vessel);
          break;
        case "mixed with cargo":
          result = await fetchMixedCargo(vessel);
          break;
        case "other method":
          result = await fetchOtherMethod(vessel);
          break;
        case "transfer-to-tank":
          result = await fetchTransferToTank(vessel);
          break;
        default:
          return res.status(400).json({ message: "Invalid method type" });
      }
  
      return res.status(200).json({ message: "Data received successfully", records: result });
  
    } catch (error) {
      console.error("Error fetching CTD method data:", error);
      return res.status(500).json({ message: error.message });
    }
  }
  
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
        const  operationType  = req.params;

        if (!operationType ) {
            return res.status(400).json({ message: "Invalid input data" });
        }
        const user = req.user.user_id;
        const vessel = req.user.vessel_id;
        const result = await fetchOperation(operationType,  user, vessel);
        return res.status(200).json({message:'Data received successfully',records:result});

    } catch (error) {
        console.error("Error handling operation:", error);
        return res.status(500).json({ message: error.message });
    }
}


export default { handleOperation, getallOperations, getallCTDmethods };
