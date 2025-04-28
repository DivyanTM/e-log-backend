import sql  from "mssql";
import {getPool} from "../config/DBConfig.js";

let pool;

(async () => {
    try {
            pool = await getPool();
        } catch (err) {
            console.error('Error while getting pool in ODS record Services', err);
        }
})();



async function processOperation(operationType, formData, user, vessel) {
    try {
        switch (operationType) {
            case "A":
        
        return await insertLoadingOilCargo('Loading of oil cargo', formData,user,vessel);

            case "B":
                
               
                return await insertInternalTransfer('Internal transfer of oil cargo during voyage', formData,user,vessel);
            case "C":
                
                return await insertUnloadingCargo('Unloading of oil cargo', formData,user,vessel);
            case 'D':
                
                return await insertCrudeOilWashing('Crude Oil Washing (COW Tankers only)', formData,user,vessel);
            case 'E':
                    return await insertBallastingOfCargoTanks('Ballasting of cargo tanks', formData,user,vessel);
            
            case 'F':
                    return await insertCleanBallastingTanks('Ballasting of dedicated clean ballasting tanks (CBT Tankers only)', formData, user, vessel);
            case 'G':
                    return await insertCleaningOfCargoTanks('Cleaning of cargo tanks', formData,user , vessel);
            case 'H':
                
                return await insertDischargeOfDirtyBallast('Discharge of dirty ballast', formData, user, vessel);
            case 'I':
        
                return await insertDischargeOfSlopTanks('Discharge of water from slop tanks into the sea', formData, user, vessel);
            case 'J':
               
                return await insertCTDR('Collection, Transfer and disposal of residues not otherwise dealt with', formData, user, vessel);
            case 'K':
               
                    return await insertCleanBallastContainedInCargoTanks('Discharge of clean ballast contained in cargo tanks', formData, user, vessel);
            case 'L':
            
                    return await insertDischargeOfDedicatedCBT('Discharge of ballast from dedicated clean ballast tanks (CBT Tankers only)', formData, user, vessel);
            case 'M':
               
                return await insertOilDischargeMonitoringSystem('Condition of oil discharge monitoring and control system', formData, user, vessel);
            case 'N':
                
                return await insertAccidentOtherDischarge('Accidental or other exceptional discharges of oil', formData, user, vessel);
            case 'O':
                
                return await insertAdditionalProcedure('Additional operational procedures and general remarks', formData, user, vessel);
            
            case 'P':
                
                return await insertLoadingBallastWater('Loading of ballast water', formData, user, vessel);
            
            case 'Q':
                    
                    return await insertReallocationBallastWater('Re-allocation of ballast water within the ship', formData,user, vessel);
            
                case 'R':
                       
                        return await insertBallastWaterDischargeTORF('Ballast water discharge to reception facility', formData, user, vessel);
            
            default:
                
                return { message: "Operation not implemented" };
        }
    } catch (error) {
        console.error("Service error:", error);
        throw new Error("Database operation failed");
    }
}

function flattenObject(obj, parent = "", res = {}) {
  for (let key in obj) {
    if (!obj.hasOwnProperty(key)) continue;

    const value = obj[key];
    const fullKey = parent ? `${parent}.${key}` : key;

    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        flattenObject(item, `${fullKey}[${index}]`, res);
      });
    } else if (typeof value === "object" && value !== null) {
      flattenObject(value, fullKey, res);
    } else {
      res[fullKey] = value;
    }
  }
  return res;
}


function prettifyKeys(obj) {
  const newObj = {};

  for (const key in obj) {
    if (!obj.hasOwnProperty(key)) continue;

    let prettyKey = key;

    // Convert array-style keys like Tanks[0].TankIdentity
    prettyKey = prettyKey.replace(/(\w+)\[(\d+)\]\.(\w+)/g, (_, arrayName, index, subKey) => {
      return `${singularize(arrayName)} ${parseInt(index) + 1} - ${insertSpaces(subKey)}`;
    });

    // Convert nested keys like placeOfLoading → Place Of Loading
    prettyKey = prettyKey
      .replace(/([a-z])([A-Z])/g, "$1 $2") // camelCase to words
      .replace(/^./, str => str.toUpperCase()); // Capitalize first letter

    newObj[prettyKey] = obj[key];
  }

  return newObj;
}


function insertSpaces(str) {
  return str.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, s => s.toUpperCase());
}


function singularize(word) {
  if (word.endsWith('s')) return word.slice(0, -1);
  return word;
}


function formatDates(obj) {
  const isDate = (val) => /^\d{4}-\d{2}-\d{2}$/.test(val);
  const isTime = (val) => /^\d{2}:\d{2}:\d{2}$/.test(val);
  const isDateTime = (val) => /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z?$/.test(val);

  const timeOnlyKeys = [
    "startTimeWashing",
    "stopTimeWashing",
    "startTime",
    "stopTime",
    "timeSystemOperational",
    "timeOfSystemFailure",
    "timeOfOccurrence",
    "timeStart",
    "timeCompletion",
    "valveCloseTime",
    "settlingLastResidues",
    "settlingLastDischarge"
   
  ];

  const dateOnlyKeys = [
    "dateOfOperation",
    "dateOfUnloading",
    "dateOfTransfer",
    "failureDate",
    "occurrenceDate",
    "operationDate"
  ];

  const dateTimeKeys = [
    "StartTime",
    "endTime",
    "createdAt"
    
  ];

  for (const key in obj) {
    const val = obj[key];

    if (val instanceof Date) {
      if (timeOnlyKeys.includes(key)) {
        obj[key] = val.toLocaleTimeString();
      } else if (dateOnlyKeys.includes(key)) {
        obj[key] = val.toLocaleDateString();
      } else if (dateTimeKeys.includes(key)) {
        obj[key] = val.toLocaleString();
      }
    } else if (typeof val === "string") {
      if (isDateTime(val)) {
        const date = new Date(val);
        if (timeOnlyKeys.includes(key)) {
          obj[key] = date.toLocaleTimeString();
        } else if (dateOnlyKeys.includes(key)) {
          obj[key] = date.toLocaleDateString();
        } else if (dateTimeKeys.includes(key)) {
          obj[key] = date.toLocaleString();
        } else {
          obj[key] = date.toLocaleString(); // Default fallback
        }
      } else if (isDate(val)) {
        const date = new Date(val + "T00:00:00");
        obj[key] = date.toLocaleDateString();
      } else if (isTime(val)) {
        const date = new Date("1970-01-01T" + val);
        obj[key] = date.toLocaleTimeString();
      }
    }
  }

  return obj;
}


function renameKeys(obj, keyMap) {
  for (const oldKey in keyMap) {
    if (obj.hasOwnProperty(oldKey)) {
      obj[keyMap[oldKey]] = obj[oldKey];
      delete obj[oldKey];
    }
  }
  return obj;
}
  
  async function fetchOperation(vesselID) {
    try {
      const result = await pool
        .request()
        .input("vesselID", sql.Int, vesselID)
        .query(`
          
                SELECT 
    ods.*,
    u.fullname AS createdby
FROM 
    tbl_orb_2 AS ods
LEFT JOIN 
    tbl_user AS u ON ods.createdby = u.user_id
WHERE 
    ods.vesselId = @vesselId
ORDER BY 
    ods.createdAt DESC;
          `);
  
      const records = result.recordset;
  
      for (const record of records) {
        const { recordId } = record;
  
        if (record.Ballasting_id != null) {
          const mainRes = await pool
            .request()
            .input("operationId", sql.Int, record.Ballasting_id)
            .query("SELECT * FROM Ballasting WHERE operationId = @operationId");
        
          let mainData = mainRes.recordset[0];
        
          const tankRes = await pool
            .request()
            .input("ballastingId", sql.Int, mainData.operationId)
            .query("SELECT tankIdentity, startTime AS StartTime, endTime, quantity FROM BallastingTanks WHERE ballastingId = @ballastingId");
        
          delete mainData.operationId;
        
        
          const formattedTanks = tankRes.recordset.map(tank => {
            const formattedTank = formatDates({ ...tank });
            if (formattedTank.quantity !== undefined && formattedTank.quantity !== null) {
              formattedTank.quantity = `${formattedTank.quantity} m³`;
            }
            return formattedTank;
          });
        
     
          const formattedMainData = formatDates({ ...mainData });
        
      
          const mergedData = {
            ...formattedMainData,
            tanks: formattedTanks,
          };
        

          record.details = prettifyKeys(flattenObject(mergedData));
        
        }
        
        
        else if (record.UnloadingOfOilCargo_id != null) { 
          const mainRes = await pool
            .request()
            .input("orb2Id", sql.Int, record.UnloadingOfOilCargo_id)
            .query("SELECT operationId,placeOfUnloading,tankEmptied,quantityRetainedM3 AS quantityRetained FROM UnloadingOfOilCargo WHERE operationId = @orb2Id");
          let mainData = mainRes.recordset[0];
        
        
          if (mainData) {
            const tankRes = await pool
              .request()
              .input("orb2Id", sql.Int, mainData.operationId)
              .query("SELECT * FROM UnloadingOfOilCargo_Tanks WHERE operationId = @orb2Id");
        
            delete mainData.operationId;
        
            const enrichedTanks = tankRes.recordset.map(tank => ({
              Tank: tank.tankIdentity,
              quantityDischarged: parseFloat(tank.quantity).toFixed(2) + " m³"
            }));
        
            const result = {
              ...mainData,
              quantityRetained: parseFloat(mainData.quantityRetained).toFixed(2) + " m³",
              tanks: enrichedTanks
            };
        
            record.details = prettifyKeys(
              flattenObject(
                formatDates(result)
              )
            );
          }
        }
         
          
        else if (record.LoadingOfOilCargo_id != null) {
            
            const mainRes = await pool
              .request()
              .input("id", sql.Int, record.LoadingOfOilCargo_id)
              .query(`
                SELECT operationId, placeOfLoading, typeOfOilLoaded,
                       quantityAddedM3 AS quantityAdded, totalContentOfTanksM3 AS totalContentOfTanks, createdAt
                FROM LoadingOfOilCargo
                WHERE operationId = @id
              `);
         
            const mainData = mainRes.recordset[0];
          
            if (mainData) {
              
              const tankRes = await pool
                .request()
                .input("operationId", sql.Int, mainData.operationId)
                .query(`
                  SELECT  tankIdentity, quantityLoadedM3
                  FROM LoadingOfOilCargo_Tanks
                  WHERE operationId = @operationId
                `);
              delete mainData.operationId;
              const enrichedTanks = tankRes.recordset.map(tank => ({
                
                Tank: tank.tankIdentity,
                quantityLoaded: parseFloat(tank.quantityLoadedM3).toFixed(2) + " m³"
              }));
              const result = {
                
                ...mainData,
                quantityAdded: parseFloat(mainData.quantityAdded).toFixed(2) + " m³",
                totalContentOfTanks:parseFloat( mainData.totalContentOfTanks).toFixed(2) + " m³",
                tanks: enrichedTanks,
              };
          
              record.details = prettifyKeys(flattenObject(formatDates(result)));
              
            }
          }
          else if (record.InternalTransferOfOilcargo_id != null) {
            const mainRes = await pool
              .request()
              .input("orb2Id", sql.Int, record.InternalTransferOfOilcargo_id)
              .query(`SELECT * FROM InternalTransferOfOilCargo WHERE operationId = @orb2Id`);
          
            let mainData = mainRes.recordset[0];
          mainData = renameKeys(mainData,{"totalQuantityOfTanksM3":"totalQuantityOfTanks","quantityRetainedM3":"quantityRetained"});
            if (mainData) {
              const tankRes = await pool
                .request()
                .input("orb2Id", sql.Int, mainData.operationId)
                .query(`SELECT tankIdentity AS tank, tankRole, tankQuantity FROM InternalTransfer_Tanks WHERE operationId = @orb2Id`);
          
              delete mainData.operationId;
          
              const enrichedTanks = tankRes.recordset.map(tank => ({
                Tank: tank.tank,
                Role: tank.tankRole,
                quantity: parseFloat(tank.tankQuantity).toFixed(2) + " m³"
              }));
          
              const result = {
                ...mainData,
                quantityTransferred: mainData.quantityTransferred != null ? parseFloat(mainData.quantityTransferred).toFixed(2) + " m³" : null,
                totalQuantityOfTanks: mainData.totalQuantityOfTanks != null ? parseFloat(mainData.totalQuantityOfTanks).toFixed(2) + " m³" : null,
                quantityRetained: mainData.quantityRetained != null ? parseFloat(mainData.quantityRetained).toFixed(2) + " m³" : null,
                tanks: enrichedTanks,
              };
          
              record.details = prettifyKeys(flattenObject(formatDates(result)));
            }
          }
          else if (record.LoadingBallastWater_id != null) {
            const mainRes = await pool
              .request()
              .input("orb2Id", sql.Int, record.LoadingBallastWater_id)
              .query(`SELECT * FROM LoadingBallastWater WHERE operationId = @orb2Id`);
        
            const tankRes = await pool
              .request()
              .input("orb2Id", sql.Int,mainRes.recordset[0].operationId)
              .query(`SELECT tankIdentity AS tankName FROM LoadingBallastWaterTanks WHERE operationId = @orb2Id`);
            delete mainRes.recordset[0].operationId;
            record.details = prettifyKeys(
              flattenObject(
                formatDates(
                    {
                        
                        ...mainRes.recordset[0],
                        tanks: tankRes.recordset,
                      }
                )
              )
            );
          }
          
          else if (record.BallastWaterDischargeReception_id != null) {
            const mainRes = await pool
              .request()
              .input("orb2Id", sql.Int, record.BallastWaterDischargeReception_id)
              .query(`SELECT * FROM BallastWaterDischargeReception WHERE operationId = @orb2Id`);
          delete mainRes.recordset[0].operationId;
            record.details = prettifyKeys(
              flattenObject(
                formatDates(
                    {
                        
                        ...mainRes.recordset[0],
                      }
                )
              )
            );
          }
          
          else if (record.CbtBallasting_id != null) {
            const mainRes = await pool
              .request()
              .input("orb2Id", sql.Int, record.CbtBallasting_id)
              .query(`SELECT * FROM CbtBallasting WHERE operationId = @orb2Id`);
          
            const tankRes = await pool
              .request()
              .input("orb2Id", sql.Int, record.CbtBallasting_id)
              .query(`SELECT * FROM CbtBallastingTanks WHERE operationId = @orb2Id`);
          
            record.details = prettifyKeys(
              flattenObject(formatDates(
                {
                    operation: "CBT Ballasting",
                    ...mainRes.recordset[0],
                    tanks: tankRes.recordset,
                  }
              ))
            );
          }
          
          else if (record.CargoTankCleaning_id != null) {
            const mainRes = await pool
              .request()
              .input("orb2Id", sql.Int, record.CargoTankCleaning_id)
              .query("SELECT * FROM CargoTankCleaning WHERE operationId = @orb2Id");
          
            let mainData = mainRes.recordset[0];
          
            if (mainData.tankWashingTransferredTo === 'Reception Facilities') {
              const twtRes = await pool
                .request()
                .input('operationId', sql.Int, mainData.operationId)
                .query(`
                  SELECT * FROM ReceptionFacilities WHERE operationId = @operationId;
                `);
          
              const rf = twtRes.recordset.map(recepFac => ({
                port: recepFac.port,
                quantity: parseFloat(recepFac.quantity || 0).toFixed(2) + ' m³'
              }));
          
              mainData.receptionFacilities = rf;
            } 
            else if (mainData.tankWashingTransferredTo === 'Slop/Cargo Tank(s)') {
              const slopRes = await pool
                .request()
                .input('operationId', sql.Int, mainData.operationId)
                .query(`
                  SELECT * FROM SlopCargoTanks WHERE operationId = @operationId;
                `);
          
              const st = slopRes.recordset.map(slopTank => ({
                tankName: slopTank.tankName,
                quantityTransferred: parseFloat(slopTank.quantityTransferred || 0).toFixed(2) + ' m³',
                totalQuantity: parseFloat(slopTank.totalQuantity || 0).toFixed(2) + ' m³'
              }));
          
              mainData.slopTanks = st;
            }
          
            const tankRes = await pool
              .request()
              .input("cargoTankCleaningId", sql.Int, mainData.operationId)
              .query("SELECT tankIdentity FROM CargoTankCleaningTanks WHERE operationId = @cargoTankCleaningId");
          
            delete mainData.operationId; // OK to delete here after all fetching is done
          
            // ✨ Format final object manually
            const fullData = {
              ...mainData,
              tanks: tankRes.recordset // keep tanks as array
            };
          
            record.details = prettifyKeys(
              {
                ...flattenObject(formatDates(fullData)),
                ...(mainData.receptionFacilities ? { receptionFacilities: mainData.receptionFacilities } : {}),
                ...(mainData.slopTanks ? { slopTanks: mainData.slopTanks } : {})
              }
            );
          
            console.log(record.details);
          }
          
          
  
        else if (record.DirtyBallastDischarge_id != null) {
          const mainRes = await pool
            .request()
            .input("orb2Id", sql.Int, record.DirtyBallastDischarge_id)
            .query("SELECT * FROM DirtyBallastDischarge WHERE operationId = @orb2Id");
          const tankRes = await pool
            .request()
            .input("dirtyBallastDischargeId", sql.Int, record.DirtyBallastDischarge_id)
            .query("SELECT * FROM DirtyBallastDischargeTanks WHERE operationId = @dirtyBallastDischargeId");
  
          record.details = prettifyKeys(
            flattenObject(
                formatDates(
                    {
                        operation: "Dirty Ballast Discharge",
                        ...mainRes.recordset[0],
                        tanks: tankRes.recordset,
                      }
                )
            )
          );
        }
  
        else if (record.SlopTankDischarge_id != null) {
          const mainRes = await pool
            .request()
            .input("orb2Id", sql.Int, record.SlopTankDischarge_id)
            .query("SELECT * FROM SlopTankDischarge WHERE operationId = @orb2Id");
          const tankRes = await pool
            .request()
            .input("slopTankDischargeId", sql.Int, record.SlopTankDischarge_id)
            .query("SELECT * FROM SlopTankDischargeTanks WHERE operationId = @slopTankDischargeId");
  
          record.details = prettifyKeys(
            flattenObject(formatDates({
              operation: "Slop Tank Discharge",
              ...mainRes.recordset[0],
              tanks: tankRes.recordset,
            })
          ));
        }
  
        else if (record.CleanBallastDischarge_id != null) {
          const mainRes = await pool
            .request()
            .input("orb2Id", sql.Int, record.CleanBallastDischarge_id)
            .query("SELECT * FROM CleanBallastDischarge WHERE operationId = @orb2Id");
          const tankRes = await pool
            .request()
            .input("cleanBallastDischargeId", sql.Int, record.CleanBallastDischarge_id)
            .query("SELECT * FROM CleanBallastDischargeTanks WHERE operationId = @cleanBallastDischargeId");
  
          record.details = prettifyKeys(
            flattenObject(formatDates({
              operation: "Clean Ballast Discharge",
              ...mainRes.recordset[0],
              tanks: tankRes.recordset,
            })
          ));
        }
  
        else if (record.CbtBallastDischarge_id != null) {
          const mainRes = await pool
            .request()
            .input("orb2Id", sql.Int, record.CbtBallastDischarge_id)
            .query("SELECT * FROM CbtBallastDischarge WHERE operationId = @orb2Id");
          const tankRes = await pool
            .request()
            .input("cbtBallastDischargeId", sql.Int, record.CbtBallastDischarge_id)
            .query("SELECT * FROM CbtBallastDischargeTanks WHERE operationId = @cbtBallastDischargeId");
  
          record.details = prettifyKeys(
            flattenObject(formatDates({
              operation: "Dedicated Clean Ballast Discharge",
              ...mainRes.recordset[0],
              tanks: tankRes.recordset,
            })
          ));
        }
  
        else if (record.ResidueTransferDisposal_id != null) {
          const mainRes = await pool
            .request()
            .input("orb2Id", sql.Int, record.ResidueTransferDisposal_id)
            .query("SELECT * FROM ResidueTransferDisposal WHERE operationId = @orb2Id");
        
          if (mainRes.recordset.length === 0) {
            console.warn(`No ResidueTransferDisposal found for ID ${record.ResidueTransferDisposal_id}`);
            continue;
          }
        
          const disposalId = mainRes.recordset[0].operationId;
        
          const result = await pool.request()
            .input("disposalId", sql.Int, disposalId)
            .query(`
              SELECT * FROM DisposalMixedCargo WHERE operationId = @disposalId;
              SELECT * FROM DisposalOtherMethod WHERE operationId = @disposalId;
              SELECT * FROM DisposalReceptionFacility WHERE operationId = @disposalId;
              SELECT * FROM DisposalTransferTanks WHERE operationId = @disposalId;
              SELECT * FROM ResidueTransferDisposalTanks WHERE rtdId = @disposalId;
            `);
        
          const transferTanks = result.recordsets[3] || [];
          const disposalTanks = result.recordsets[4] || [];
        
          let tankIdentities = [];
        
          if (transferTanks.length > 0) {
            for (const transfer of transferTanks) {
              const tanksResult = await pool.request()
                .input('transferId', sql.Int, transfer.transferId)
                .query(`
                  SELECT * FROM DisposalTransferTankList WHERE transferId = @transferId;
                `);
        
              tankIdentities.push({
                transferId: transfer.transferId,
                tanks: tanksResult.recordset
              });
            }
          }
        
          record.details = prettifyKeys(
            flattenObject(formatDates({
              operation: "Residue Transfer/Disposal",
              ...mainRes.recordset[0],
              mixedCargo: result.recordsets[0],
              otherMethod: result.recordsets[1],
              receptionFacility: result.recordsets[2],
              transferTanks,
              tanksIdentity: tankIdentities,
              disposalTanks
            }))
          );
        
          console.log(record);
        }
        
        else if (record.CrudeOilWashing_id != null) {
          const mainRes = await pool
            .request()
            .input("orb2Id", sql.Int, record.CrudeOilWashing_id)
            .query(`SELECT * FROM CrudeOilWashing WHERE operationId = @orb2Id`);
          delete mainRes.recordset[0].operationId;
          const mainData = mainRes.recordset[0];
          mainData.washingPattern = Boolean(mainData.washingPattern);
          if (mainData) {
            const formattedData = formatDates(mainData);
            const flattenedData = flattenObject(formattedData);
            const prettyData = prettifyKeys(flattenedData);
            record.details = prettyData;
          }
        }
        
          
  
        else if (record.AccidentalDischarge_id != null) {
          const mainRes = await pool
            .request()
            .input("orb2Id", sql.Int, record.AccidentalDischarge_id)
            .query("SELECT * FROM AccidentalDischarge WHERE operationId = @orb2Id");
          delete mainRes.recordset[0].operationId;
          record.details = prettifyKeys(
            flattenObject(formatDates({
              operation: "Accidental Discharge",
              ...mainRes.recordset[0],
            })
          ));
        }
  
        else if (record.ReallocationBallastWater_id != null) {
          const mainRes = await pool
            .request()
            .input("orb2Id", sql.Int, record.ReallocationBallastWater_id)
            .query("SELECT * FROM ReallocationBallastWater WHERE operationId = @orb2Id");
          delete mainRes.recordset[0].operationId;
          record.details = prettifyKeys(
            flattenObject(formatDates({
             
              ...mainRes.recordset[0],
            })
          ));
        }
  
        else if (record.AdditionalProcedures_id != null) {
          const mainRes = await pool
            .request()
            .input("orb2Id", sql.Int, record.AdditionalProcedures_id)
            .query("SELECT * FROM AdditionalProcedures WHERE operationId = @orb2Id");
  delete mainRes.recordset[0].operationId;
          record.details = prettifyKeys(
            flattenObject(formatDates({
              
              ...mainRes.recordset[0],
            })
          ));
        }
  
        else if (record.OilDischargeMonitoringSystem_id != null) {
          const mainRes = await pool
            .request()
            .input("orb2Id", sql.Int, record.OilDischargeMonitoringSystem_id)
            .query("SELECT * FROM OilDischargeMonitoringSystem WHERE operationId = @orb2Id");
            delete mainRes.recordset[0].operationId;
          record.details = prettifyKeys(
            flattenObject(formatDates({
              
              ...mainRes.recordset[0],
            })
          ));
        }
  
        else {
          record.details = { Operation: "Unknown or unhandled operation" };
        }
      }
      delete records.recordId;
      
      return records;
    } catch (err) {
      console.error(" Error in fetchOperation:", err);
      throw err;
    }
}
  
async function insertReallocationBallastWater(recordName, data, user, vessel) {
    let transaction;

    try {

        if (!recordName) {
            throw new Error("Invalid recordId.");
        }

        const { reasonForReallocation } = data;

        // Validate reasonForReallocation
        if (!reasonForReallocation || typeof reasonForReallocation !== "string" || reasonForReallocation.trim().length < 3) {
            throw new Error("Reason for reallocation must be at least 3 characters long.");
        }

        // Begin transaction
        transaction = new sql.Transaction(await pool);
        await transaction.begin();
        console.log("Transaction started...");

        // SQL Insert
        const insertQuery = `
            INSERT INTO ReallocationBallastWater ( reason)
            VALUES ( @reason);
            SELECT SCOPE_IDENTITY() AS operationId;
        `;

        const result = await transaction.request()
            
            .input("reason", sql.NVarChar(sql.MAX), reasonForReallocation.trim())
            .query(insertQuery);

        const operationId = result.recordset[0].operationId;
        const approvedby = 1;
    const approvalStatus = 0;
    const verificationStatus =0;
    const verifiedBy= 2;
    const verficationRemarks = `verified`;
    const result2 = await transaction.request()
      .input('approvedby', sql.Int, approvedby)
      .input('approvalStatus', sql.Int, approvalStatus)
      .input('createdBy', sql.Int,user )
      .input('vesselId', sql.Int, vessel)
      .input('verifiedBy', sql.Int, verifiedBy)
      .input('verifiedAt', sql.DateTime, new Date())
      .input('verificationStatus', sql.Int, verificationStatus)
      .input('verficationRemarks', sql.NVarChar(255), verficationRemarks)
      .input('ReallocationBallastWater_id', sql.Int, operationId)
      .input('operationName',sql.NVarChar(250),recordName)
      .query(`
        INSERT INTO tbl_orb_2 (
          approvedby, approvalStatus, createdBy, vesselId, 
          verifiedBy,verifiedAt,  verificationStatus, verificationRemarks,
          ReallocationBallastWater_id,operationName
        )
        VALUES (
          @approvedby, @approvalStatus, @createdBy, @vesselId, 
          @verifiedBy,@verifiedAt,  @verificationStatus, @verficationRemarks,
          @ReallocationBallastWater_id, @operationName
        )
      `);
        console.log("Inserted ReallocationBallastWater with operationId:", operationId);

        await transaction.commit();
        console.log("Transaction committed successfully.");
        return { message: "Reallocation of ballast water recorded successfully.", operationId };

    } catch (error) {
        console.error("Error in insertReallocationBallastWater:", error);
        if (transaction) {
            await transaction.rollback();
            console.log("Transaction rolled back.");
        }
        throw new Error("Database operation failed: " + error.message);
    } finally {
        transaction?.release?.();
    }
}

async function insertBallastWaterDischargeTORF(recordName, data, user, vessel) {
    let transaction;

    try {
       

        // Validate recordId
        if (!recordName) {
            throw new Error("Invalid recordId.");
        }

        // Extract and validate data
        const { portOfDischarge, receptionFacility, totalQuantityDischarged_m3 } = data;

        if (!portOfDischarge || typeof portOfDischarge !== "string" || portOfDischarge.trim().length < 2) {
            throw new Error("Port of discharge must be at least 2 characters long.");
        }

        if (!receptionFacility || typeof receptionFacility !== "string" || receptionFacility.trim().length < 2) {
            throw new Error("Reception facility must be at least 2 characters long.");
        }

        if (
            totalQuantityDischarged_m3 === undefined ||
            isNaN(totalQuantityDischarged_m3) ||
            Number(totalQuantityDischarged_m3) <= 0
        ) {
            throw new Error("Total quantity discharged must be a valid positive number.");
        }

        // Helper function
        function validateDecimal(value, precision = 10, scale = 2) {
            if (typeof value !== "number" || isNaN(value)) return 0.0;
            return parseFloat(Number(value).toFixed(scale));
        }

        // Begin transaction
        transaction = new sql.Transaction(await pool);
        await transaction.begin();
        console.log("Transaction started...");

        // Insert Query
        const insertQuery = `
            INSERT INTO BallastWaterDischargeReception 
                ( portName, receptionFacility, totalQuantityDischarged)
            VALUES 
                ( @portName, @receptionFacility, @totalQuantityDischarged);
            SELECT SCOPE_IDENTITY() AS operationId;
        `;

        const result = await transaction.request()
            
            .input("portName", sql.NVarChar(255), portOfDischarge.trim())
            .input("receptionFacility", sql.NVarChar(255), receptionFacility.trim())
            .input("totalQuantityDischarged", sql.Decimal(10, 2), validateDecimal(totalQuantityDischarged_m3))
            .query(insertQuery);

        const operationId = result.recordset[0].operationId;
        const approvedby = 1;
    const approvalStatus = 0;
    const verificationStatus =0;
    const verifiedBy= 2;
    const verficationRemarks = `verified`;
    const result2 = await transaction.request()
      .input('approvedby', sql.Int, approvedby)
      .input('approvalStatus', sql.Int, approvalStatus)
      .input('createdBy', sql.Int,user )
      .input('vesselId', sql.Int, vessel)
      .input('verifiedBy', sql.Int, verifiedBy)
      .input('verifiedAt', sql.DateTime, new Date())
      .input('verificationStatus', sql.Int, verificationStatus)
      .input('verficationRemarks', sql.NVarChar(255), verficationRemarks)
      .input('BallastWaterDischargeReception_id', sql.Int, operationId)
      .input('operationName',sql.NVarChar(250),recordName)
      .query(`
        INSERT INTO tbl_orb_2 (
          approvedby, approvalStatus, createdBy, vesselId, 
          verifiedBy,verifiedAt,  verificationStatus, verificationRemarks,
          BallastWaterDischargeReception_id,operationName
        )
        VALUES (
          @approvedby, @approvalStatus, @createdBy, @vesselId, 
          @verifiedBy,@verifiedAt,  @verificationStatus, @verficationRemarks,
          @BallastWaterDischargeReception_id, @operationName
        )
      `);
        console.log("Inserted BallastWaterDischargeReception with operationId:", operationId);

        await transaction.commit();
        console.log("Transaction committed successfully.");
        return { message: "Ballast water discharge to reception facility recorded successfully.", operationId };

    } catch (error) {
        console.error("Error in insertBallastWaterDischargeTORF:", error);
        if (transaction) {
            await transaction.rollback();
            console.log("Transaction rolled back.");
        }
        throw new Error("Database operation failed: " + error.message);
    } finally {
        transaction?.release?.();
    }
}

async function insertLoadingBallastWater(recordName, data, user, vessel) {
    let transaction;

    try {
        

        // Validate recordId
        if (!recordName) {
            throw new Error("Invalid recordId.");
        }

        // Extract data
        const { tanksLoaded, positionOfShip, quantityOfBallast, remarks } = data;

        // Field Validations
        if (!positionOfShip || typeof positionOfShip !== "string" || positionOfShip.trim() === "") {
            throw new Error("Position of ship is required.");
        }

        if (!quantityOfBallast || isNaN(quantityOfBallast) || Number(quantityOfBallast) <= 0) {
            throw new Error("Quantity of ballast water must be a valid positive number.");
        }

        if (!remarks || typeof remarks !== "string" || remarks.trim().length < 3) {
            throw new Error("Remarks must be at least 3 characters long.");
        }

        if (!Array.isArray(tanksLoaded) || tanksLoaded.length === 0) {
            throw new Error("At least one tank must be specified for ballast water loading.");
        }
        function validateDecimal(value, precision = 10, scale = 2) {
            if (typeof value !== "number" || isNaN(value)) return 0.0;
            return parseFloat(value.toFixed(scale));
        }
        transaction = new sql.Transaction(await pool);
        await transaction.begin();
        console.log("Transaction started...");

        // Insert into LoadingBallastWater table
        const insertDischargeQuery = `
            INSERT INTO LoadingBallastWater ( positionOfShip, totalQuantityM3, remarks)
            VALUES ( @positionOfShip, @totalQuantityM3, @remarks);
            SELECT SCOPE_IDENTITY() AS operationId;
        `;

        const result = await transaction.request()
            
            .input("positionOfShip", sql.NVarChar(255), positionOfShip.trim())
            .input("totalQuantityM3", sql.Decimal(10, 2),validateDecimal(quantityOfBallast))
            .input("remarks", sql.NVarChar(sql.MAX), remarks.trim())
            .query(insertDischargeQuery);

        const operationId = result.recordset[0].operationId;
        const approvedby = 1;
    const approvalStatus = 0;
    const verificationStatus =0;
    const verifiedBy= 2;
    const verficationRemarks = `verified`;
    const result2 = await transaction.request()
      .input('approvedby', sql.Int, approvedby)
      .input('approvalStatus', sql.Int, approvalStatus)
      .input('createdBy', sql.Int,user )
      .input('vesselId', sql.Int, vessel)
      .input('verifiedBy', sql.Int, verifiedBy)
      .input('verifiedAt', sql.DateTime, new Date())
      .input('verificationStatus', sql.Int, verificationStatus)
      .input('verficationRemarks', sql.NVarChar(255), verficationRemarks)
      .input('LoadingBallastWater_id', sql.Int, operationId)
      .input('operationName',sql.NVarChar(250),recordName)
      .query(`
        INSERT INTO tbl_orb_2 (
          approvedby, approvalStatus, createdBy, vesselId, 
          verifiedBy,verifiedAt,  verificationStatus, verificationRemarks,
          LoadingBallastWater_id,operationName
        )
        VALUES (
          @approvedby, @approvalStatus, @createdBy, @vesselId, 
          @verifiedBy,@verifiedAt,  @verificationStatus, @verficationRemarks,
          @LoadingBallastWater_id, @operationName
        )
      `);
        console.log("Inserted LoadingBallastWater with operationId:", operationId);

        // Insert into LoadingBallastWater_Tanks table
        for (const tank of tanksLoaded) {
            if (typeof tank === "string" && tank.trim() !== "") {
                await transaction.request()
                    .input("operationId", sql.Int, operationId)
                    .input("tankIdentity", sql.NVarChar(255), tank.trim())
                    .query(`
                        INSERT INTO LoadingBallastWaterTanks (operationId, tankIdentity)
                        VALUES (@operationId, @tankIdentity);
                    `);
            }
        }

        await transaction.commit();
        console.log("Transaction committed successfully.");
        return { message: "Loading ballast water data inserted successfully.", operationId };

    } catch (error) {
        console.error("Error in insertLoadingBallastWater:", error);
        if (transaction) {
            await transaction.rollback();
            console.log("Transaction rolled back.");
        }
        throw new Error("Database operation failed: " + error.message);
    } finally {
        transaction?.release?.();
    }
}

async function insertAdditionalProcedure(recordName, data, user, vessel) {
    let transaction;

    try {
        

       
        if (!recordName) {
            throw new Error("Invalid operation type provided.");
        }

      
        const { additionalOperationalProcedures, generalRemarks } = data;

      
        if (!additionalOperationalProcedures || additionalOperationalProcedures.trim().length < 3) {
            throw new Error("Additional operational procedures must be at least 3 characters long.");
        }

        if (!generalRemarks || generalRemarks.trim().length < 3) {
            throw new Error("General remarks must be at least 3 characters long.");
        }

       
        transaction = new sql.Transaction(await pool);
        await transaction.begin();
        console.log("Transaction started...");

        
        const insertQuery = `
            INSERT INTO AdditionalProcedures ( additionalProcedures, generalRemarks)
            VALUES ( @additionalProcedures, @generalRemarks);
            SELECT SCOPE_IDENTITY() AS operationId;
        `;

        const result = await transaction.request()
            
            .input("additionalProcedures", sql.NVarChar(sql.MAX), additionalOperationalProcedures.trim())
            .input("generalRemarks", sql.NVarChar(sql.MAX), generalRemarks.trim())
            .query(insertQuery);

        const operationId = result.recordset[0].operationId;
        const approvedby = 1;
    const approvalStatus = 0;
    const verificationStatus =0;
    const verifiedBy= 2;
    const verficationRemarks = `verified`;
    const result2 = await transaction.request()
      .input('approvedby', sql.Int, approvedby)
      .input('approvalStatus', sql.Int, approvalStatus)
      .input('createdBy', sql.Int,user )
      .input('vesselId', sql.Int, vessel)
      .input('verifiedBy', sql.Int, verifiedBy)
      .input('verifiedAt', sql.DateTime, new Date())
      .input('verificationStatus', sql.Int, verificationStatus)
      .input('verficationRemarks', sql.NVarChar(255), verficationRemarks)
      .input('AdditionalProcedures_id', sql.Int, operationId)
      .input('operationName',sql.NVarChar(250),recordName)
      .query(`
        INSERT INTO tbl_orb_2 (
          approvedby, approvalStatus, createdBy, vesselId, 
          verifiedBy,verifiedAt,  verificationStatus, verificationRemarks,
          AdditionalProcedures_id,operationName
        )
        VALUES (
          @approvedby, @approvalStatus, @createdBy, @vesselId, 
          @verifiedBy,@verifiedAt,  @verificationStatus, @verficationRemarks,
          @AdditionalProcedures_id, @operationName
        )
      `);
        console.log("Inserted AdditionalProcedures with operationId:", operationId);

        await transaction.commit();
        console.log("Transaction committed successfully.");
        return { message: "Additional procedures recorded successfully.", operationId };

    } catch (error) {
        console.error("Error in insertAdditionalProcedure:", error);
        if (transaction) {
            await transaction.rollback();
            console.log("Transaction rolled back.");
        }
        throw new Error("Database operation failed: " + error.message);
    } finally {
        transaction?.release?.();
    }
}

async function insertAccidentOtherDischarge(recordName, data, user, vessel) {
    let transaction;

    try {
       

        if (!recordName) {
            throw new Error("Invalid operation type provided.");
        }

        const {
            timeOfOccurrence,
            portAtTimeOfOccurrence,
            positionAtTimeOfOccurrence,
            approximateQuantityM3,
            typeOfOil,
            circumstancesOfDischarge,
            reasons,
            generalRemarks
        } = data;

        // === Validations ===
        if (!timeOfOccurrence || typeof timeOfOccurrence !== "string") {
            throw new Error("Time of occurrence is required.");
        }

        if (!portAtTimeOfOccurrence || typeof portAtTimeOfOccurrence !== "string" || portAtTimeOfOccurrence.trim() === "") {
            throw new Error("Port at time of occurrence is required.");
        }

        if (!positionAtTimeOfOccurrence || typeof positionAtTimeOfOccurrence !== "string" || positionAtTimeOfOccurrence.trim() === "") {
            throw new Error("Position of ship is required.");
        }

        const quantity = parseFloat(approximateQuantityM3);
        if (isNaN(quantity) || quantity < 0) {
            throw new Error("Approximate quantity must be a valid non-negative number.");
        }

        if (!typeOfOil || typeof typeOfOil !== "string" || typeOfOil.trim() === "") {
            throw new Error("Type of oil is required.");
        }

        if (!circumstancesOfDischarge || circumstancesOfDischarge.toString().trim().length < 3) {
            throw new Error("Circumstances of discharge must be at least 3 characters.");
        }

        if (!reasons || reasons.toString().trim().length < 3) {
            throw new Error("Reasons for discharge must be at least 3 characters.");
        }

        if (!generalRemarks || generalRemarks.toString().trim().length < 3) {
            throw new Error("General remarks must be at least 3 characters.");
        }

        // Convert time string to SQL Time
        const toSQLTime = (timeStr) => {
            const [h, m] = timeStr.split(":").map(Number);
            return new Date(1970, 0, 1, h, m, 0);
        };
        const sqlTime = toSQLTime(timeOfOccurrence);

        // === Start Transaction ===
        transaction = new sql.Transaction(await pool);
        await transaction.begin();
        console.log("Transaction started...");

        const insertQuery = `
            INSERT INTO AccidentalDischarge (
                 
                timeOfOccurrence,
                portAtTimeOfOccurrence,
                positionOfShip,
                approximateQuantityM3,
                typeOfOil,
                circumstances,
                reasons,
                generalRemarks
            ) VALUES (
                
                @timeOfOccurrence,
                @port,
                @position,
                @quantity,
                @typeOfOil,
                @circumstances,
                @reasons,
                @remarks
            );
            SELECT SCOPE_IDENTITY() AS operationId;
        `;

        const result = await transaction.request()
           
            .input("timeOfOccurrence", sql.Time(7), sqlTime)
            .input("port", sql.NVarChar(100), portAtTimeOfOccurrence.trim())
            .input("position", sql.NVarChar(255), positionAtTimeOfOccurrence.trim())
            .input("quantity", sql.Float, quantity)
            .input("typeOfOil", sql.NVarChar(100), typeOfOil.trim())
            .input("circumstances", sql.NVarChar(500), circumstancesOfDischarge.toString().trim())
            .input("reasons", sql.NVarChar(sql.MAX), reasons.toString().trim())
            .input("remarks", sql.NVarChar(sql.MAX), generalRemarks.toString().trim())
            .query(insertQuery);

        const operationId = result.recordset[0].operationId;
        const approvedby = 1;
    const approvalStatus = 0;
    const verificationStatus =0;
    const verifiedBy= 2;
    const verficationRemarks = `verified`;
    const result2 = await transaction.request()
      .input('approvedby', sql.Int, approvedby)
      .input('approvalStatus', sql.Int, approvalStatus)
      .input('createdBy', sql.Int,user )
      .input('vesselId', sql.Int, vessel)
      .input('verifiedBy', sql.Int, verifiedBy)
      .input('verifiedAt', sql.DateTime, new Date())
      .input('verificationStatus', sql.Int, verificationStatus)
      .input('verficationRemarks', sql.NVarChar(255), verficationRemarks)
      .input('AccidentalDischarge_id', sql.Int, operationId)
      .input('operationName',sql.NVarChar(250),recordName)
      .query(`
        INSERT INTO tbl_orb_2 (
          approvedby, approvalStatus, createdBy, vesselId, 
          verifiedBy,verifiedAt,  verificationStatus, verificationRemarks,
          AccidentalDischarge_id,operationName
        )
        VALUES (
          @approvedby, @approvalStatus, @createdBy, @vesselId, 
          @verifiedBy,@verifiedAt,  @verificationStatus, @verficationRemarks,
          @AccidentalDischarge_id, @operationName
        )
      `);
        console.log("Inserted AccidentalDischarge with operationId:", operationId);

        await transaction.commit();
        console.log("Transaction committed.");
        return { message: "Accidental discharge recorded successfully.", operationId };

    } catch (error) {
        console.error("Error in insertAccidentOtherDischarge:", error);
        if (transaction) {
            await transaction.rollback();
            console.log("Transaction rolled back.");
        }
        throw new Error("Database operation failed: " + error.message);
    } finally {
        transaction?.release?.();
    }
}

async function insertOilDischargeMonitoringSystem(recordName, data, user, vessel) {
    let transaction;

    try {
        

        if (!recordName) {
            throw new Error("Invalid recordId.");
        }

        const { timeOfSystemFailure, timeSystemOperational, reasonForFailure } = data;

        // === Validation ===
        if (!timeOfSystemFailure || typeof timeOfSystemFailure !== "string") {
            throw new Error("Time of system failure is required.");
        }

        if (!timeSystemOperational || typeof timeSystemOperational !== "string") {
            throw new Error("Time when system became operational is required.");
        }

        if (!reasonForFailure || typeof reasonForFailure !== "string" || reasonForFailure.trim().length < 5) {
            throw new Error("Reason for failure must be at least 5 characters.");
        }

        // Ensure operational time is after failure time
        const toSQLTime = (timeStr) => {
            const [h, m] = timeStr.split(":").map(Number);
            return new Date(1970, 0, 1, h, m, 0);
        };

        const failTime = toSQLTime(timeOfSystemFailure);
        const opTime = toSQLTime(timeSystemOperational);
        if (opTime <= failTime) {
            throw new Error("System operational time must be after the system failure time.");
        }

        // === Start DB Transaction ===
        transaction = new sql.Transaction(await pool);
        await transaction.begin();
        console.log("Transaction started...");

        const insertQuery = `
            INSERT INTO OilDischargeMonitoringSystem 
            ( timeOfSystemFailure, timeSystemOperational, reasonForFailure)
            VALUES 
            ( @timeOfSystemFailure, @timeSystemOperational, @reasonForFailure);
            SELECT SCOPE_IDENTITY() AS operationId;
        `;

        const result = await transaction.request()
            
            .input("timeOfSystemFailure", sql.Time(7), failTime)
            .input("timeSystemOperational", sql.Time(7), opTime)
            .input("reasonForFailure", sql.NVarChar(sql.MAX), reasonForFailure.trim())
            .query(insertQuery);

        const operationId = result.recordset[0].operationId;
        const approvedby = 1;
    const approvalStatus = 0;
    const verificationStatus =0;
    const verifiedBy= 2;
    const verficationRemarks = `verified`;
    const result2 = await transaction.request()
      .input('approvedby', sql.Int, approvedby)
      .input('approvalStatus', sql.Int, approvalStatus)
      .input('createdBy', sql.Int,user )
      .input('vesselId', sql.Int, vessel)
      .input('verifiedBy', sql.Int, verifiedBy)
      .input('verifiedAt', sql.DateTime, new Date())
      .input('verificationStatus', sql.Int, verificationStatus)
      .input('verficationRemarks', sql.NVarChar(255), verficationRemarks)
      .input('OilDischargeMonitoringSystem_id', sql.Int, operationId)
      .input('operationName',sql.NVarChar(250),recordName)
      .query(`
        INSERT INTO tbl_orb_2 (
          approvedby, approvalStatus, createdBy, vesselId, 
          verifiedBy,verifiedAt,  verificationStatus, verificationRemarks,
          OilDischargeMonitoringSystem_id,operationName
        )
        VALUES (
          @approvedby, @approvalStatus, @createdBy, @vesselId, 
          @verifiedBy,@verifiedAt,  @verificationStatus, @verficationRemarks,
          @OilDischargeMonitoringSystem_id, @operationName
        )
      `);
        console.log("Inserted OilDischargeMonitoringSystem with operationId:", operationId);

        await transaction.commit();
        console.log("Transaction committed.");
        return { message: "Oil discharge monitoring system failure logged successfully.", operationId };

    } catch (error) {
        console.error("Error in insertOilDischargeMonitoringSystem:", error);
        if (transaction) {
            await transaction.rollback();
            console.log("Transaction rolled back.");
        }
        throw new Error("Database operation failed: " + error.message);
    } finally {
        transaction?.release?.();
    }
}

async function insertDischargeOfDedicatedCBT(recordName, data, user, vessel) {
    let transaction;

    try {
        console.log("Data from front-end:", data);

        if (!recordName) throw new Error("Invalid operation type provided.");

        const {
            positionStart,
            timeStart,
            positionCompletion,
            timeCompletion,
            quantityDischargedSea,
            quantityDischargedRF,
            portRF,
            oilContamination,
            dischargeMonitored,
            valvePosition,
            valveTime,
            dischargedTanks
        } = data;

        // === Validation ===
        if (!positionStart || typeof positionStart !== "string" || positionStart.trim() === "")
            throw new Error("Position at start of discharge is required.");

        if (!timeStart || typeof timeStart !== "string")
            throw new Error("Time at start of discharge is required.");

        if (!positionCompletion || typeof positionCompletion !== "string" || positionCompletion.trim() === "")
            throw new Error("Position at completion of discharge is required.");

        if (!timeCompletion || typeof timeCompletion !== "string")
            throw new Error("Time at completion of discharge is required.");

        const validateDecimal = (value, label) => {
            const num = Number(value);
            if (isNaN(num) || num < 0) throw new Error(`${label} must be a valid non-negative number.`);
            return parseFloat(num.toFixed(2));
        };

        const qtySea = validateDecimal(quantityDischargedSea, "Quantity discharged into the sea");
        const qtyReception = validateDecimal(quantityDischargedRF, "Quantity discharged into reception facility");

        if (!portRF || typeof portRF !== "string" || portRF.trim() === "")
            throw new Error("Port of reception facility is required.");

        if (!["Yes", "No"].includes(oilContamination))
            throw new Error("Oil contamination must be 'Yes' or 'No'.");

        if (!["Yes", "No"].includes(dischargeMonitored))
            throw new Error("Discharge monitored must be 'Yes' or 'No'.");

        if (!valvePosition || typeof valvePosition !== "string" || valvePosition.trim() === "")
            throw new Error("Valve closing position is required.");

        if (!valveTime || typeof valveTime !== "string")
            throw new Error("Valve closing time is required.");

        if (!Array.isArray(dischargedTanks) || dischargedTanks.length === 0)
            throw new Error("At least one discharged tank is required.");

        const toSQLTime = (timeStr) => {
            const [h, m] = timeStr.split(":").map(Number);
            return new Date(1970, 0, 1, h, m, 0); // JavaScript Date obj
        };

        // === DB Transaction ===
        transaction = new sql.Transaction(await pool);
        await transaction.begin();
        console.log("Transaction started...");

        const insertQuery = `
            INSERT INTO CbtBallastDischarge 
            ( posStart, timeStart, posCompletion, timeCompletion, qtySea, qtyReception, portReception, 
             oilContamination, monitoredByOilMeter, valveClosePos, valveCloseTime)
            VALUES 
            ( @posStart, @timeStart, @posCompletion, @timeCompletion, @qtySea, @qtyReception, @portReception,
             @oilContamination, @monitoredByOilMeter, @valveClosePos, @valveCloseTime);
            SELECT SCOPE_IDENTITY() AS operationId;
        `;

        const result = await transaction.request()
            
            .input("posStart", sql.NVarChar(255), positionStart.trim())
            .input("timeStart", sql.Time(7), toSQLTime(timeStart))
            .input("posCompletion", sql.NVarChar(255), positionCompletion.trim())
            .input("timeCompletion", sql.Time(7), toSQLTime(timeCompletion))
            .input("qtySea", sql.Decimal(10, 2), qtySea)
            .input("qtyReception", sql.Decimal(10, 2), qtyReception)
            .input("portReception", sql.NVarChar(255), portRF.trim())
            .input("oilContamination", sql.Bit, oilContamination === "Yes" ? 1 : 0)
            .input("monitoredByOilMeter", sql.Bit, dischargeMonitored === "Yes" ? 1 : 0)
            .input("valveClosePos", sql.NVarChar(255), valvePosition.trim())
            .input("valveCloseTime", sql.Time(7), toSQLTime(valveTime))
            .query(insertQuery);

        const operationId = result.recordset[0].operationId;
        const approvedby = 1;
    const approvalStatus = 0;
    const verificationStatus =0;
    const verifiedBy= 2;
    const verficationRemarks = `verified`;
    const result2 = await transaction.request()
      .input('approvedby', sql.Int, approvedby)
      .input('approvalStatus', sql.Int, approvalStatus)
      .input('createdBy', sql.Int,user )
      .input('vesselId', sql.Int, vessel)
      .input('verifiedBy', sql.Int, verifiedBy)
      .input('verifiedAt', sql.DateTime, new Date())
      .input('verificationStatus', sql.Int, verificationStatus)
      .input('verficationRemarks', sql.NVarChar(255), verficationRemarks)
      .input('CbtBallastDischarge_id', sql.Int, operationId)
      .input('operationName',sql.NVarChar(250),recordName)
      .query(`
        INSERT INTO tbl_orb_2 (
          approvedby, approvalStatus, createdBy, vesselId, 
          verifiedBy,verifiedAt,  verificationStatus, verificationRemarks,
          CbtBallastDischarge_id,operationName
        )
        VALUES (
          @approvedby, @approvalStatus, @createdBy, @vesselId, 
          @verifiedBy,@verifiedAt,  @verificationStatus, @verficationRemarks,
          @CbtBallastDischarge_id, @operationName
        )
      `);
        console.log("Inserted CbtBallastDischarge with operationId:", operationId);

        // Insert tanks
        for (const tank of dischargedTanks) {
            if (typeof tank === "string" && tank.trim() !== "") {
                await transaction.request()
                    .input("operationId", sql.Int, operationId)
                    .input("tankIdentity", sql.NVarChar(100), tank.trim())
                    .query(`
                        INSERT INTO CbtBallastDischargeTanks (operationId, tankIdentity)
                        VALUES (@operationId, @tankIdentity);
                    `);
            }
        }

        await transaction.commit();
        console.log("Transaction committed.");
        return { message: "CBT discharge operation saved successfully.", operationId };

    } catch (error) {
        console.error("Error in insertDischargeOfDedicatedCBT:", error);
        if (transaction) {
            await transaction.rollback();
            console.log("Transaction rolled back.");
        }
        throw new Error("Database operation failed: " + error.message);
    } finally {
        transaction?.release?.();
    }
}

async function insertCleanBallastContainedInCargoTanks(recordName, data, user, vessel) {
    let transaction;

    try {
        

        if (!recordName ) throw new Error("Invalid recordId.");

        const {
            positionStart,
            positionCompletion,
            regularCheckup,
            tanksEmptyOnCompletion,
            dischargedTanks
        } = data;

        if (!positionStart || typeof positionStart !== "string" || positionStart.trim() === "") {
            throw new Error("Start position is required.");
        }

        if (!positionCompletion || typeof positionCompletion !== "string" || positionCompletion.trim() === "") {
            throw new Error("Completion position is required.");
        }

        if (typeof regularCheckup !== "string" || !["Yes", "No"].includes(regularCheckup)) {
            throw new Error("Regular checkup must be 'Yes' or 'No'.");
        }

        if (typeof tanksEmptyOnCompletion !== "string" || !["Yes", "No"].includes(tanksEmptyOnCompletion)) {
            throw new Error("Tanks empty on completion must be 'Yes' or 'No'.");
        }

        if (!Array.isArray(dischargedTanks) || dischargedTanks.length === 0) {
            throw new Error("At least one discharged tank identity is required.");
        }

        transaction = new sql.Transaction(await pool);
        await transaction.begin();
        console.log("Transaction started...");

        const insertDischargeQuery = `
            INSERT INTO CleanBallastDischarge 
            ( positionStart, positionCompletion, tankEmptyCompletion, regularCheck)
            VALUES ( @positionStart, @positionCompletion, @tankEmptyCompletion, @regularCheck);
            SELECT SCOPE_IDENTITY() AS operationId;
        `;

        const result = await transaction.request()
            
            .input("positionStart", sql.NVarChar(255), positionStart.trim())
            .input("positionCompletion", sql.NVarChar(255), positionCompletion.trim())
            .input("tankEmptyCompletion", sql.Bit, tanksEmptyOnCompletion === "Yes" ? 1 : 0)
            .input("regularCheck", sql.Bit, regularCheckup === "Yes" ? 1 : 0)
            .query(insertDischargeQuery);

        const operationId = result.recordset[0].operationId;
        console.log("Inserted CleanBallastDischarge with operationId:", operationId);
        const approvedby = 1;
    const approvalStatus = 0;
    const verificationStatus =0;
    const verifiedBy= 2;
    const verficationRemarks = `verified`;
    const result2 = await transaction.request()
      .input('approvedby', sql.Int, approvedby)
      .input('approvalStatus', sql.Int, approvalStatus)
      .input('createdBy', sql.Int,user )
      .input('vesselId', sql.Int, vessel)
      .input('verifiedBy', sql.Int, verifiedBy)
      .input('verifiedAt', sql.DateTime, new Date())
      .input('verificationStatus', sql.Int, verificationStatus)
      .input('verficationRemarks', sql.NVarChar(255), verficationRemarks)
      .input('CleanBallastDischarge_id', sql.Int, operationId)
      .input('operationName',sql.NVarChar(250),recordName)
      .query(`
        INSERT INTO tbl_orb_2 (
          approvedby, approvalStatus, createdBy, vesselId, 
          verifiedBy,verifiedAt,  verificationStatus, verificationRemarks,
          CleanBallastDischarge_id,operationName
        )
        VALUES (
          @approvedby, @approvalStatus, @createdBy, @vesselId, 
          @verifiedBy,@verifiedAt,  @verificationStatus, @verficationRemarks,
          @CleanBallastDischarge_id, @operationName
        )
      `);
        for (const tank of dischargedTanks) {
            if (typeof tank === "string" && tank.trim() !== "") {
                await transaction.request()
                    .input("operationId", sql.Int, operationId)
                    .input("tankIdentity", sql.NVarChar(100), tank.trim())
                    .query(`
                        INSERT INTO CleanBallastDischargeTanks (operationId, tankIdentity)
                        VALUES (@operationId, @tankIdentity);
                    `);
            }
        }

        await transaction.commit();
        console.log("Transaction committed successfully.");
        return { message: "Clean ballast discharge data inserted successfully.", operationId };

    } catch (error) {
        console.error("Error in insertCleanBallastContainedInCargoTanks:", error);
        if (transaction) {
            await transaction.rollback();
            console.log("Transaction rolled back.");
        }
        throw new Error("Database operation failed: " + error.message);
    } finally {
        transaction?.release?.();
    }
}


async function insertCTDR(recordName, data, user, vessel) {
    let transaction;

    try {
        
      console.log(data);
        if (!recordName) throw new Error("Invalid operation type provided.");
        if (!data.method_of_disposal) throw new Error("Method of disposal is required.");
        if (!data.dynamic_data) throw new Error("Dynamic data section is missing.");

        const method = data.method_of_disposal;
        const dynamic = data.dynamic_data;

        transaction = new sql.Transaction(await pool);
        await transaction.begin();
        console.log("Transaction started...");

        // Insert into ResidueTransferDisposal
        const disposalResult = await transaction.request()
            
            .input("methodOfDisposal", sql.NVarChar(255), method)
            .input('qt',sql.Decimal(10,3),data.transferred_quantity)
            .query(`
                INSERT INTO ResidueTransferDisposal ( methodOfDisposal,QuantityTransferred)
                VALUES ( @methodOfDisposal,@qt);
                SELECT SCOPE_IDENTITY() AS operationId;
            `);

        const operationId = disposalResult.recordset[0].operationId;
        for(const tank of data.tank_identity)
        {
          const result3 = await transaction
          .request()
          .input('rtdId',sql.Int,operationId)
          .input('tankName',sql.NVarChar,tank)
          
          .query(`
            INSERT INTO ResidueTransferDisposalTanks(tankName,rtdId) VALUES(@tankName,@rtdId);
            `);
      
        }
            const approvedby = 1;
    const approvalStatus = 0;
    const verificationStatus =0;
    const verifiedBy= 2;
    const verficationRemarks = `verified`;
    const result2 = await transaction.request()
      .input('approvedby', sql.Int, approvedby)
      .input('approvalStatus', sql.Int, approvalStatus)
      .input('createdBy', sql.Int,user )
      .input('vesselId', sql.Int, vessel)
      .input('verifiedBy', sql.Int, verifiedBy)
      .input('verifiedAt', sql.DateTime, new Date())
      .input('verificationStatus', sql.Int, verificationStatus)
      .input('verficationRemarks', sql.NVarChar(255), verficationRemarks)
      .input('ResidueTransferDisposal_id', sql.Int, operationId)
      .input('operationName',sql.NVarChar(250),recordName)
      .query(`
        INSERT INTO tbl_orb_2 (
          approvedby, approvalStatus, createdBy, vesselId, 
          verifiedBy,verifiedAt,  verificationStatus, verificationRemarks,
          ResidueTransferDisposal_id,operationName
        )
        VALUES (
          @approvedby, @approvalStatus, @createdBy, @vesselId, 
          @verifiedBy,@verifiedAt,  @verificationStatus, @verficationRemarks,
          @ResidueTransferDisposal_id, @operationName
        )
      `);
        console.log("Inserted ResidueTransferDisposal with operationId:", operationId);
         function validateDecimal(value, precision = 10, scale = 2) 
         {
        if (typeof value !== "number" || isNaN(value)) return 0.0;
        return parseFloat(value.toFixed(scale));
                            }
        // Handle method-specific insertions
        if (method === 'disposal to reception facilities') {
            const { port, quantity_involved } = dynamic;

            if (!port) throw new Error("Port name is required.");
            if (!quantity_involved || isNaN(quantity_involved)) {
                throw new Error("Valid quantity involved is required.");
            }

            await transaction.request()
                .input("operationId", sql.Int, operationId)
                .input("portName", sql.NVarChar(255), port)
                .input("quantityInvolved", sql.Decimal(10, 2),validateDecimal( parseFloat(quantity_involved)))
                .query(`
                    INSERT INTO DisposalReceptionFacility (operationId, portName, quantityInvolved)
                    VALUES (@operationId, @portName, @quantityInvolved);
                `);

        } else if (method === 'mixed with cargo') {
            const { quantity_involved } = dynamic;

            if (!quantity_involved || isNaN(quantity_involved)) {
                throw new Error("Valid quantity mixed is required.");
            }

            await transaction.request()
                .input("operationId", sql.Int, operationId)
                .input("quantityMixed", sql.Decimal(10, 2),validateDecimal(parseFloat(quantity_involved)))
                .query(`
                    INSERT INTO DisposalMixedCargo (operationId, quantityMixed)
                    VALUES (@operationId, @quantityMixed);
                `);

        } else if (method === 'other method') {
            const { method_name, quantity_disposed } = dynamic;

            if (!method_name) throw new Error("Other method name is required.");
            if (!quantity_disposed || isNaN(quantity_disposed)) {
                throw new Error("Valid quantity disposed is required.");
            }

            await transaction.request()
                .input("operationId", sql.Int, operationId)
                .input("methodName", sql.NVarChar(255), method_name)
                .input("quantityDisposed", sql.Decimal(10, 2),validateDecimal(parseFloat(quantity_disposed)))
                .query(`
                    INSERT INTO DisposalOtherMethod (operationId, methodName, quantityDisposed)
                    VALUES (@operationId, @methodName, @quantityDisposed);
                `);

        } else if (method === 'transferred to or from (an)other tank(s) including transfer from machinery space oil residue(sludge) and oily bilge water tanks') {
            const { transferred_quantity, total_quantity, tank_identities } = dynamic;

            if (!transferred_quantity || isNaN(transferred_quantity)) {
                throw new Error("Transferred quantity must be valid.");
            }
            if (!total_quantity || isNaN(total_quantity)) {
                throw new Error("Total quantity must be valid.");
            }
            if (!Array.isArray(tank_identities) || tank_identities.length === 0) {
                throw new Error("At least one transfer tank identity is required.");
            }

            const transferResult = await transaction.request()
                .input("operationId", sql.Int, operationId)
                .input("quantityTransferred", sql.Decimal(10, 2),validateDecimal( parseFloat(transferred_quantity)))
                .input("totalQuantity", sql.Decimal(10, 2),validateDecimal( parseFloat(total_quantity)))
                .query(`
                    INSERT INTO DisposalTransferTanks (operationId, quantityTransferred, totalQuantity)
                    VALUES (@operationId, @quantityTransferred, @totalQuantity);
                    SELECT SCOPE_IDENTITY() AS transferId;
                `);

            const transferId = transferResult.recordset[0].transferId;

            for (const tank of tank_identities) {
                if (tank && typeof tank === "string" && tank.trim() !== "") {
                    await transaction.request()
                        .input("transferId", sql.Int, transferId)
                        .input("tankIdentity", sql.NVarChar(255), tank.trim())
                        .query(`
                            INSERT INTO DisposalTransferTankList (transferId, tankIdentity)
                            VALUES (@transferId, @tankIdentity);
                        `);
                }
            }
        } else {
            throw new Error("Unsupported method of disposal.");
        }

        await transaction.commit();
        console.log("Transaction committed.");

        return {
            message: "Residue Transfer & Disposal data inserted successfully.",
            operationId
        };

    } catch (error) {
        console.error("Error in insertCTDR:", error);
        if (transaction) {
            await transaction.rollback();
            console.log("Transaction rolled back.");
        }
        throw new Error("Database operation failed: " + error.message);
    } finally {
        if (transaction) transaction.release?.();
    }
}

async function insertDischargeOfSlopTanks(recordName, data, user, vessel) {
    let transaction;

try {

        if (!recordName) {
            throw new Error("Invalid operation type provided.");
        }

        // Field validations
        if (!data.static) {
            throw new Error("Static field data is required.");
        }

        const {
            settling_last_residues,
            settling_last_discharge,
            rate_of_discharge,
            ullage_completion,
            valves_closed
        } = data.static;

        if (!settling_last_residues || !settling_last_discharge) {
            throw new Error("Settling time fields are required.");
        }

        if (!rate_of_discharge || isNaN(rate_of_discharge)) {
            throw new Error("Rate of discharge must be a valid number.");
        }

        if (!ullage_completion || typeof ullage_completion !== "string") {
            throw new Error("Ullage completion must be a valid string.");
        }

        if (!valves_closed || typeof valves_closed !== "string") {
            throw new Error("Valves closed must be a valid string.");
        }

        if (!Array.isArray(data.tanks) || data.tanks.length === 0) {
            throw new Error("At least one tank identity is required.");
        }

        function formatToSQLTime(timeStr) {
            if (!timeStr) return null;

            const timeParts = timeStr.split(":");
            if (timeParts.length === 2) {
                timeStr = `${timeStr}:00`; 
            } else if (timeParts.length !== 3) {
                throw new Error(`Invalid time format: ${timeStr}`);
            }

            const [hours, minutes, seconds] = timeStr.split(":").map(Number);
            return new Date(1970, 0, 1, hours, minutes, seconds);
        }

        transaction = new sql.Transaction(await pool);
        await transaction.begin();
        console.log("Transaction started...");

        const dischargeQuery = `
            INSERT INTO SlopTankDischarge 
                ( settlingLastResidues, settlingLastDischarge, rateOfDischarge, ullageCompletion, valvesClosed)
            VALUES 
                ( @settlingLastResidues, @settlingLastDischarge, @rateOfDischarge, @ullageCompletion, @valvesClosed);
            SELECT SCOPE_IDENTITY() AS operationId;
        `;

        const result = await transaction.request()
          
            .input("settlingLastResidues", sql.Time(7), formatToSQLTime(settling_last_residues))
            .input("settlingLastDischarge", sql.Time(7), formatToSQLTime(settling_last_discharge))
            .input("rateOfDischarge", sql.Decimal(10, 2), parseFloat(rate_of_discharge))
            .input("ullageCompletion", sql.NVarChar(100), ullage_completion)
            .input("valvesClosed", sql.NVarChar(10), valves_closed)
            .query(dischargeQuery);

        const operationId = result.recordset[0].operationId;

        const approvedby = 1;
    const approvalStatus = 0;
    const verificationStatus =0;
    const verifiedBy= 2;
    const verficationRemarks = `verified`;
    const result2 = await transaction.request()
      .input('approvedby', sql.Int, approvedby)
      .input('approvalStatus', sql.Int, approvalStatus)
      .input('createdBy', sql.Int,user )
      .input('vesselId', sql.Int, vessel)
      .input('verifiedBy', sql.Int, verifiedBy)
      .input('verifiedAt', sql.DateTime, new Date())
      .input('verificationStatus', sql.Int, verificationStatus)
      .input('verficationRemarks', sql.NVarChar(255), verficationRemarks)
      .input('SlopTankDischarge_id', sql.Int, operationId)
      .input('operationName',sql.NVarChar(250),recordName)
      .query(`
        INSERT INTO tbl_orb_2 (
          approvedby, approvalStatus, createdBy, vesselId, 
          verifiedBy,verifiedAt,  verificationStatus, verificationRemarks,
          SlopTankDischarge_id,operationName
        )
        VALUES (
          @approvedby, @approvalStatus, @createdBy, @vesselId, 
          @verifiedBy,@verifiedAt,  @verificationStatus, @verficationRemarks,
          @SlopTankDischarge_id, @operationName
        )
      `);
        
        console.log("Inserted SlopTankDischarge with operationId:", operationId);

        // Insert Tank Data
        for (const tank of data.tanks) {
            if (tank && typeof tank === "string" && tank.trim() !== "") {
                await transaction.request()
                    .input("operationId", sql.Int, operationId)
                    .input("tankIdentity", sql.NVarChar(100), tank.trim())
                    .query(`
                        INSERT INTO SlopTankDischargeTanks (operationId, tankIdentity)
                        VALUES (@operationId, @tankIdentity);
                    `);
            }
        }

        console.log("Inserted SlopTankDischargeTanks successfully.");
        await transaction.commit();
        console.log("Transaction committed.");

        return { message: "Slop Tank Discharge data inserted successfully.", operationId };
    } catch (error) {
        console.error("Error in insertDischargeOfSlopTanks:", error);
        if (transaction) {
            await transaction.rollback();
            console.log("Transaction rolled back.");
        }
        throw new Error("Database operation failed: " + error.message);
    } finally {
        if (transaction) transaction.release?.();
    }
}

async function insertDischargeOfDirtyBallast(recordName, data, user, vessel) {
    let transaction;

    try {
        

        // Validate recordId
        if (!recordName) {
            throw new Error("Invalid operation type provided.");
        }

        // Validate required fields
        if (!data.timeStart || !data.positionStart || !data.timeComplete || !data.positionComplete) {
            throw new Error("Start and complete time/positions are required.");
        }

        if (isNaN(data.shipsSpeed) || isNaN(data.quantityDischarged)) {
            throw new Error("Ship's speed and quantity discharged must be valid numbers.");
        }

        if (typeof data.monitoringSystem !== "boolean" || typeof data.regularCheckup !== "boolean") {
            throw new Error("Monitoring system and regular checkup must be boolean values.");
        }

        if (data.shorePort && typeof data.shorePort !== "string") {
            throw new Error("Shore port must be a string.");
        }

        if (data.shoreQuantity && isNaN(data.shoreQuantity)) {
            throw new Error("Shore quantity must be a valid number.");
        }

        function validateDecimal(value, precision = 10, scale = 2) {
            if (typeof value !== "number" || isNaN(value)) return 0.0;
            return parseFloat(value.toFixed(scale));
        }

        function formatToSQLTime(timeStr) {
            if (!timeStr) return null;

            const timeParts = timeStr.split(":");
            if (timeParts.length === 2) {
                timeStr = `${timeStr}:00`; // Append seconds if missing
            } else if (timeParts.length !== 3) {
                throw new Error(`Invalid time format: ${timeStr}`);
            }

            const [hours, minutes, seconds] = timeStr.split(":").map(Number);
            return new Date(1970, 0, 1, hours, minutes, seconds);
        }

        // Start transaction
        
        transaction = new sql.Transaction(await pool); 
        await transaction.begin();
        console.log("Transaction started...");

        // Insert into `DirtyBallastDischarge`
        const dischargeQuery = `
            INSERT INTO DirtyBallastDischarge 
            ( dischargeStartTime, dischargeStartPosition, dischargeCompleteTime, dischargeCompletePosition, 
             shipSpeedKnots, quantityDischargedM3, monitoringSystem, regularCheckup, shorePort, shoreQuantityM3) 
            VALUES 
            (@dischargeStartTime, @dischargeStartPosition, @dischargeCompleteTime, @dischargeCompletePosition, 
             @shipSpeedKnots, @quantityDischargedM3, @monitoringSystem, @regularCheckup, @shorePort, @shoreQuantityM3);
            SELECT SCOPE_IDENTITY() AS operationId;
        `;

        const result = await transaction.request()
            
            .input("dischargeStartTime", sql.Time(7), formatToSQLTime(data.timeStart))
            .input("dischargeStartPosition", sql.NVarChar(255), data.positionStart)
            .input("dischargeCompleteTime", sql.Time(7), formatToSQLTime(data.timeComplete))
            .input("dischargeCompletePosition", sql.NVarChar(255), data.positionComplete)
            .input("shipSpeedKnots", sql.Decimal(10, 2), validateDecimal(data.shipsSpeed))
            .input("quantityDischargedM3", sql.Decimal(10, 2), validateDecimal(data.quantityDischarged))
            .input("monitoringSystem", sql.Bit, data.monitoringSystem ? 1 : 0)
            .input("regularCheckup", sql.Bit, data.regularCheckup ? 1 : 0)
            .input("shorePort", sql.NVarChar(150), data.shorePort || null)
            .input("shoreQuantityM3", sql.Decimal(10, 2), validateDecimal(data.shoreQuantity) || 0)
            .query(dischargeQuery);

        const operationId = result.recordset[0].operationId;
        console.log("Inserted DirtyBallastDischarge with Operation ID:", operationId);
        const approvedby = 1;
    const approvalStatus = 0;
    const verificationStatus =0;
    const verifiedBy= 2;
    const verficationRemarks = `verified`;
    const result2 = await transaction.request()
      .input('approvedby', sql.Int, approvedby)
      .input('approvalStatus', sql.Int, approvalStatus)
      .input('createdBy', sql.Int,user )
      .input('vesselId', sql.Int, vessel)
      .input('verifiedBy', sql.Int, verifiedBy)
      .input('verifiedAt', sql.DateTime, new Date())
      .input('verificationStatus', sql.Int, verificationStatus)
      .input('verficationRemarks', sql.NVarChar(255), verficationRemarks)
      .input('DirtyBallastDischarge_id', sql.Int, operationId)
      .input('operationName',sql.NVarChar(250),recordName)
      .query(`
        INSERT INTO tbl_orb_2 (
          approvedby, approvalStatus, createdBy, vesselId, 
          verifiedBy,verifiedAt,  verificationStatus, verificationRemarks,
          DirtyBallastDischarge_id,operationName
        )
        VALUES (
          @approvedby, @approvalStatus, @createdBy, @vesselId, 
          @verifiedBy,@verifiedAt,  @verificationStatus, @verficationRemarks,
          @DirtyBallastDischarge_id, @operationName
        )
      `);
        // Insert Tank Identities into `DirtyBallastDischargeTanks`
        for (const tankIdentity of data.tankIdentities) {
            if (typeof tankIdentity === "string" && tankIdentity.trim() !== "") {
                await transaction.request()
                    .input("operationId", sql.Int, operationId)
                    .input("tankIdentity", sql.NVarChar(100), tankIdentity.trim())
                    .query(`
                        INSERT INTO DirtyBallastDischargeTanks (operationId, tankIdentity)
                        VALUES (@operationId, @tankIdentity);
                    `);
            }
        }

        console.log("Inserted DirtyBallastDischargeTanks successfully.");

        // Insert Slop Tank Identities into `OilyWaterSlopTanks`
        for (const slopTankIdentity of data.slopTanks) {
            if (typeof slopTankIdentity === "string" && slopTankIdentity.trim() !== "") {
                await transaction.request()
                    .input("operationId", sql.Int, operationId)
                    .input("slopTankIdentity", sql.NVarChar(100), slopTankIdentity.trim())
                    .query(`
                        INSERT INTO OilyWaterSlopTanks (operationId, slopTankIdentity)
                        VALUES (@operationId, @slopTankIdentity);
                    `);
            }
        }

        console.log("Inserted OilyWaterSlopTanks successfully.");

        // Commit transaction
        await transaction.commit();
        console.log("Transaction committed successfully.");

        return { message: "Dirty Ballast Discharge operation submitted successfully.", operationId };

    } catch (error) {
        console.error("Error in insertDischargeOfDirtyBallast:", error);

        // Rollback transaction on error
        if (transaction) {
            await transaction.rollback();
            console.log("Transaction rolled back due to an error.");
        }

        throw new Error("Database operation failed: " + error.message);
    } finally {
        // Release connection
        
            transaction.release();
       
    
}
}

async function insertCleaningOfCargoTanks(recordName, data, user, vessel) {
    let transaction;

    try {
        

        if (!recordName) {
            throw new Error("Invalid operation type provided.");
        }

        if (!data.portOrPosition || typeof data.portOrPosition !== "string" || data.portOrPosition.trim() === "") {
            throw new Error("Port or Ship Position is required.");
        }

        if (!data.durationCleaning) {
            throw new Error("Duration of Cleaning is required and must be a valid number.");
        }

        if (!data.methodCleaning || typeof data.methodCleaning !== "string" || data.methodCleaning.trim() === "") {
            throw new Error("Method of Cleaning is required.");
        }

        if (!data.TWT || typeof data.TWT !== "string") {
            throw new Error("Tanks Washing Transferred To is required.");
        }

        

        function validateDecimal(value, precision = 10, scale = 2) {
            if (typeof value !== "number" || isNaN(value)) return 0.0;
            return parseFloat(value.toFixed(scale));
        }

        function formatToSQLTime(timeStr) {
            if (!timeStr) return null;
            const timeParts = timeStr.split(":");
            if (timeParts.length === 2) {
                timeStr = `${timeStr}:00`; 
            } else if (timeParts.length !== 3) {
                throw new Error(`Invalid time format: ${timeStr}`);
            }
            const [hours, minutes, seconds] = timeStr.split(":").map(Number);
            return new Date(1970, 0, 1, hours, minutes, seconds);
        }

        
        transaction = new sql.Transaction(await pool);
        await transaction.begin();
        console.log("Transaction started...");

        const query = `
            INSERT INTO CargoTankCleaning 
            ( portOrShipPosition, durationOfCleaning, methodOfCleaning, tanksWashingTransferredTo,  createdAt)
            VALUES 
            ( @portOrShipPosition, @durationOfCleaning, @methodOfCleaning, @tanksWashingTransferredTo, GETDATE());
            SELECT SCOPE_IDENTITY() AS operationId;
        `;

        const result = await transaction.request()
            
            .input("portOrShipPosition", sql.NVarChar(255), data.portOrPosition.trim())
            .input("durationOfCleaning", sql.Time(7), formatToSQLTime(`${data.durationCleaning}:00`)) 
            .input("methodOfCleaning", sql.NVarChar(100), data.methodCleaning.trim())
            .input("tanksWashingTransferredTo", sql.NVarChar(100), data.TWT.trim() === 'rf' ? 'Reception Facilities':'Slop/Cargo Tank(s)')
           .query(query);

        const operationId = result.recordset[0].operationId;
        console.log("CargoTankCleaning Operation ID created:", operationId);
        const approvedby = 1;
    const approvalStatus = 0;
    const verificationStatus =0;
    const verifiedBy= 2;
    const verficationRemarks = `verified`;
    const result2 = await transaction.request()
      .input('approvedby', sql.Int, approvedby)
      .input('approvalStatus', sql.Int, approvalStatus)
      .input('createdBy', sql.Int,user )
      .input('vesselId', sql.Int, vessel)
      .input('verifiedBy', sql.Int, verifiedBy)
      .input('verificationStatus', sql.Int, verificationStatus)
      .input('verficationRemarks', sql.NVarChar(255), verficationRemarks)
      .input('CargoTankCleaning_id', sql.Int, operationId)
      .input('operationName',sql.NVarChar(250),recordName)
      .query(`
        INSERT INTO tbl_orb_2 (
          approvedby, approvalStatus, createdBy, vesselId, 
          verifiedBy,  verificationStatus, verificationRemarks,
          CargoTankCleaning_id,operationName
        )
        VALUES (
          @approvedby, @approvalStatus, @createdBy, @vesselId, 
          @verifiedBy,  @verificationStatus, @verficationRemarks,
          @CargoTankCleaning_id, @operationName
        )
      `);
      if (data.TWT === 'slop') {
        
    
        const query = `
            INSERT INTO slopCargoTanks
            (operationId, tankName, quantityTransferred, totalQuantity)
            VALUES
            (@operationId, @tankName, @quantityTransferred, @totalQuantity);
            SELECT SCOPE_IDENTITY() AS operationId;
        `;
    
        await transaction.request()
            .input("operationId", sql.Int, operationId)
            .input("tankName", sql.NVarChar(250), data.slopTankName)
            .input("quantityTransferred", sql.Decimal(10, 3), data.quantityTransferred)
            .input("totalQuantity", sql.Decimal(10, 3), data.totalQuantity)
            .query(query);
    
    } else if (data.TWT === 'rf') {
        
        
    
        const query = `
            INSERT INTO ReceptionFacilities
            (operationId, port, quantity)
            VALUES
            (@operationId, @portName, @quantity);
            SELECT SCOPE_IDENTITY() AS operationId;
        `;
    
        await transaction.request()
            .input("operationId", sql.Int, operationId)
            .input("portName", sql.NVarChar(250), data.portRF)
            .input("quantity", sql.Decimal(10, 3), data.quantityRF)
            .query(query);
    }
    
        for (const tankIdentity of data.tanks) {
            if (typeof tankIdentity === "string" && tankIdentity.trim() !== "") {
                const request = await transaction.request();
                    await request.input("operationId", sql.Int, operationId)
                    .input("tankIdentity", sql.NVarChar(100), tankIdentity.trim())
                    .query(`
                        INSERT INTO CargoTankCleaningTanks (operationId, tankIdentity)
                        VALUES (@operationId, @tankIdentity);
                    `);
            }
        }

        await transaction.commit();
        console.log("Transaction committed successfully.");

        return { message: `Cargo Tank Cleaning operation submitted successfully.`};

    } catch (error) {
        console.error("Error in insertCleaningOfCargoTanks:", error);
        if (transaction) {
            await transaction.rollback();
            console.log("Transaction rolled back due to an error.");
        }
        throw new Error("Database operation failed: " + error.message);
    } finally {
        
            transaction.release();
        
    }
}

async function insertCleanBallastingTanks(recordName, data, user, vessel) {
    let transaction;

    try {
        if(!recordName)
        {
            throw new Error("Invalid operation type provided");
            
        }
     

        // Validate required fields
        if (!data.port || typeof data.port !== "string" || data.port.trim() === "") {
            throw new Error("Port is required and must be a valid string.");
        }

        if (!data.positionFlush || typeof data.positionFlush !== "string" || data.positionFlush.trim() === "") {
            throw new Error("Position Flushed is required and must be a valid string.");
        }

        if (!data.oilyWaterQty || isNaN(data.oilyWaterQty) || Number(data.oilyWaterQty) < 0) {
            throw new Error("Oily Water Quantity must be a valid non-negative number.");
        }

        if (!data.cleanBallastQty || isNaN(data.cleanBallastQty) || Number(data.cleanBallastQty) < 0) {
            throw new Error("Clean Ballast Quantity must be a valid non-negative number.");
        }

        if (!data.valveTime || typeof data.valveTime !== "string") {
            throw new Error("Valve Time is required.");
        }

        if (!data.valvePosition || typeof data.valvePosition !== "string" || data.valvePosition.trim() === "") {
            throw new Error("Valve Position is required.");
        }

        // Validate tanks array
        if (!Array.isArray(data.tanks) || data.tanks.length === 0) {
            throw new Error("At least one valid tank identity is required.");
        }

        function validateDecimal(value, precision = 10, scale = 2) {
            if (typeof value !== "number" || isNaN(value)) return 0.0;
            return parseFloat(value.toFixed(scale));
        }

        function formatToSQLTime(timeStr) {
            if (!timeStr) return null;

            const timeParts = timeStr.split(":");
            if (timeParts.length === 2) {
                timeStr = `${timeStr}:00`; // Append seconds if missing
            } else if (timeParts.length !== 3) {
                throw new Error(`Invalid time format: ${timeStr}`);
            }

            const [hours, minutes, seconds] = timeStr.split(":").map(Number);
            return new Date(1970, 0, 1, hours, minutes, seconds);
        }

        // Start a transaction
      
        transaction = new sql.Transaction(await pool); 
        await transaction.begin();
        console.log("Transaction started...");

        // Insert into `CbtBallasting` Table
        const query = `
            INSERT INTO CbtBallasting (positionWhenAdditionalBallastWasTaken,positionWhenPortOrFlushWaterTakenToCBT, port, positionFlushed, oilyWaterQty, cleanBallastQty, valveTime, valvePosition)
            VALUES (@positionAdditionalBallast,@positionPortBallast, @port, @positionFlush, @oilyWaterQty, @cleanBallastQty, @valveTime, @valvePosition);
            SELECT SCOPE_IDENTITY() AS operationId;
        `;

        const result = await transaction.request()
            
            .input("port", sql.NVarChar(150), data.port.trim())
            .input("positionFlush", sql.NVarChar(255), data.positionFlush.trim())
            .input("oilyWaterQty", sql.Decimal(10, 2), validateDecimal(data.oilyWaterQty))
            .input("cleanBallastQty", sql.Decimal(10, 2), validateDecimal(data.cleanBallastQty))
            .input("valveTime", sql.Time(7), formatToSQLTime(data.valveTime))
            .input("valvePosition", sql.NVarChar(255), data.valvePosition.trim())
            .input("positionPortBallast",sql.NVarChar(255),data.positionPortBallast.trim())
            .input("positionAdditionalBallast",sql.NVarChar,data.positionAdditionalBallast)
            .query(query);

        const operationId = result.recordset[0].operationId;
        const approvedby = 1;
    const approvalStatus = 0;
    const verificationStatus =0;
    const verifiedBy= 2;
    const verificationRemarks = `verified`;
    const result2 = await transaction.request()
      .input('approvedby', sql.Int, approvedby)
      .input('approvalStatus', sql.Int, approvalStatus)
      .input('createdBy', sql.Int,user )
      .input('vesselId', sql.Int, vessel)
      .input('verifiedBy', sql.Int, verifiedBy)
      .input('verificationStatus', sql.Int, verificationStatus)
      .input('verificationRemarks', sql.NVarChar(255), verificationRemarks)
      .input('CbtBallasting_id', sql.Int, operationId)
      .input('operationName',sql.NVarChar(250),recordName)
      .query(`
        INSERT INTO tbl_orb_2 (
          approvedby, approvalStatus, createdBy, vesselId, 
          verifiedBy,  verificationStatus, verificationRemarks,
          CbtBallasting_id,operationName
        )
        VALUES (
          @approvedby, @approvalStatus, @createdBy, @vesselId, 
          @verifiedBy,  @verificationStatus, @verificationRemarks,
          @CbtBallasting_id, @operationName
        )
      `);
        console.log("CbtBallasting Operation ID created:", operationId);

        // Insert Tank Identities into `CbtBallastingTanks`
        for (const tankIdentity of data.tanks) {
            if (typeof tankIdentity === "string" && tankIdentity.trim() !== "") {
                const request = await transaction.request();
                
                await request.input("operationId", sql.Int, operationId)
                    .input("tankIdentity", sql.NVarChar(100), tankIdentity.trim())
                    .query(`
                        INSERT INTO CbtBallastingTanks (operationId, tankIdentity)
                        VALUES (@operationId, @tankIdentity);
                    `);
            }
        }

        //Insert Slop Tank Identities into 'SlopTankCbtBallasting'
        for (const tankIdentity of data.slopTankIdentities) {
          if (typeof tankIdentity === "string" && tankIdentity.trim() !== "") {
              const request = await transaction.request();
                  await request.input("operationId", sql.Int, operationId)
                  .input("tankName", sql.NVarChar(100), tankIdentity.trim())
                  .query(`
                      INSERT INTO SlopTankCbtBallasting (operationId, tankName)
                      VALUES (@operationId, @tankName);
                  `);
          }
      }


        // Commit the transaction
        await transaction.commit();
        console.log("Transaction committed successfully.");

        return { message: `Clean Ballasting operation submitted successfully.`, operationId };

    } catch (error) {
        console.error("Error in insertCleanBallastingTanks:", error);

        // Rollback transaction on error
        if (transaction) {
            await transaction.rollback();
            console.log("Transaction rolled back due to an error.");
        }

        throw new Error("Database operation failed: " + error.message);
    } finally {
       
      if (transaction && transaction.connection) {
        transaction.connection.close(); 
    }
         
    }
}

async function insertBallastingOfCargoTanks(recordName, data,user, vessel) {
    let transaction;

    try {
        
        // Validate `recordName`
        if (!recordName) {
            throw new Error("Invalid operation type provided.");
        }

        // Validate `startBallastingPlace` and `endBallastingPlace`
        if (!data.startBallasting || typeof data.startBallasting !== "string" || data.startBallasting.trim() === "") {
            throw new Error("Start Ballasting Place is required and must be a valid string.");
        }

        if (!data.endBallasting || typeof data.endBallasting !== "string" || data.endBallasting.trim() === "") {
            throw new Error("End Ballasting Place is required and must be a valid string.");
        }

        // Validate tanks array
        if (!Array.isArray(data.tanks) || data.tanks.length === 0) {
            throw new Error("At least one valid tank identity is required.");
        }

        // Start a transaction
      
        transaction = new sql.Transaction(await pool); 
        await transaction.begin();
        console.log("Transaction started...");

        // Insert into Ballasting Table
        const query = `
            INSERT INTO Ballasting ( startBallastingPlace, endBallastingPlace)
            VALUES ( @startBallasting, @endBallasting);
            SELECT SCOPE_IDENTITY() AS ballastingId;
        `;
        function convertToSQLDateTime(datetimeLocalValue) {
          if (!datetimeLocalValue) return null;
      
          const [date, time] = datetimeLocalValue.split('T');
          
          return `${date} ${time}:00`;
      }
      
        const result = await transaction.request()
            
            .input("startBallasting", sql.NVarChar(150), data.startBallasting.trim())
            .input("endBallasting", sql.NVarChar(150), data.endBallasting.trim())
            .query(query);

        const operationId = result.recordset[0].ballastingId;
        const approvedby = 1;
    const approvalStatus = 0;
    const verificationStatus =0;
    const verifiedBy= 2;
    const verificationRemarks = `verified`;
    const result2 = await transaction.request()
      .input('approvedby', sql.Int, approvedby)
      .input('approvalStatus', sql.Int, approvalStatus)
      .input('createdBy', sql.Int,user )
      .input('vesselId', sql.Int, vessel)
      .input('verifiedBy', sql.Int, verifiedBy)
      .input('verificationStatus', sql.Int, verificationStatus)
      .input('verifiedAt',sql.DateTime,new Date())
      .input('verificationRemarks', sql.NVarChar(255), verificationRemarks)
      .input('Ballasting_id', sql.Int, operationId)
      .input('operationName',sql.NVarChar(250),recordName)
      .query(`
        INSERT INTO tbl_orb_2 (
          approvedby, approvalStatus, createdBy, vesselId, 
          verifiedBy,verifiedAt,  verificationStatus, verificationRemarks,
          Ballasting_id,operationName
        )
        VALUES (
          @approvedby, @approvalStatus, @createdBy, @vesselId, 
          @verifiedBy,@verifiedAt,  @verificationStatus, @verificationRemarks,
          @Ballasting_id, @operationName
        )
      `);
       

        // Insert Tank Identities into Ballasting_Tanks
        for (const tank of data.tanks) {
            
                await transaction.request()
                    .input("ballastingId", sql.Int, operationId)
                    .input("tankIdentity", sql.NVarChar(100), tank.identity.trim())
                    .input("startTime",sql.DateTime,convertToSQLDateTime(tank.startTime))
                    .input("endTime",sql.DateTime,convertToSQLDateTime(tank.endTime))
                    .input("quantity",sql.Decimal(10,3),tank.quantity)
                    .query(`
                        INSERT INTO BallastingTanks (ballastingId, tankIdentity,quantity,startTime,endTime)
                        VALUES (@ballastingId, @tankIdentity,@quantity,@startTime,@endTime);
                    `);
            
        }

        // Commit transaction
        await transaction.commit();
        console.log("Transaction committed successfully.");

        return { message: `Ballasting operation submitted successfully.` };

    } catch (error) {
        console.error("Error in insertBallastingOfCargoTanks:", error);

        // Rollback transaction on error
        if (transaction) {
            await transaction.rollback();
            console.log("Transaction rolled back due to an error.");
        }

        throw new Error("Database operation failed: " + error.message);
    } finally {
        // Release connection
        
            transaction.release(); 
         
    }
}

async function insertCrudeOilWashing(recordName, data, user, vessel) {
    
    if (!recordName) {
        throw new Error("Invalid operation type provided.");
    }
    

    if (!data.tanks || !Array.isArray(data.tanks) || data.tanks.length === 0) {
        throw new Error("Tanks data is required.");
    }

    let transaction;
    try {
        // Start transaction
        
        transaction = new sql.Transaction(await pool); 
        await transaction.begin();
        console.log("Transaction started...");
        await insertCrudeOilWashingTanks(transaction, recordName, data.tanks,user,vessel);

        // Commit transaction
        await transaction.commit();
        console.log("Transaction committed successfully.");

        return { message: `Crude Oil Washing submitted successfully.` };

    } catch (error) {
        console.error("Error in insertCrudeOilWashing:", error);

        // Rollback transaction on error
        if (transaction) {
            await transaction.rollback();
            console.log("Transaction rolled back due to an error.");
        }

        throw new Error("Database operation failed: " + error.message);
    } finally {
        // Release connection
       
            transaction.release(); 
         
    }
}

async function insertCrudeOilWashingTanks(transaction, recordName, tanks, user, vessel) {
    for (const tank of tanks) {
        const {
            tankIdentity,
            cowPort,
            cowShipPosition,
            machinesInUse,
            startTimeWashing,
            washingPattern,
            washingLinePressure,
            endTimeWashing,
            methodOfEstablishing,
            cowRemarks
        } = tank;

        function formatToSQLTime(timeStr) {
            if (!timeStr) return null;

            const timeParts = timeStr.split(":");
            if (timeParts.length === 2) {
                timeStr = `${timeStr}:00`; // Append seconds if missing
            } else if (timeParts.length !== 3) {
                throw new Error(`Invalid time format: ${timeStr}`);
            }

            const [hours, minutes, seconds] = timeStr.split(":").map(Number);
            return new Date(1970, 0, 1, hours, minutes, seconds);
        }

        // Validation
        if (!tankIdentity || !cowPort || !cowShipPosition || !washingPattern || !washingLinePressure || !methodOfEstablishing) {
            throw new Error("Required fields missing in tank data.");
        }

        if (!Number.isInteger(machinesInUse) || machinesInUse < 0) {
            throw new Error("Machines in use must be a valid integer.");
        }

        if (!startTimeWashing || !endTimeWashing) {
            throw new Error("Washing time is required.");
        }

        const formattedStartTime = formatToSQLTime(startTimeWashing);
        const formattedEndTime = formatToSQLTime(endTimeWashing);
        // SQL Insert Query
        const query = `
            INSERT INTO CrudeOilWashing (
                 tankIdentity, portOfWash, shipPosition, machinesInUse,
                startTimeWashing, washingPattern, washingLinePressure, stopTimeWashing,
                cleanlinessMethod, remarks
            ) VALUES (
                 @tankIdentity, @portOfWash, @shipPosition, @machinesInUse,
                @startTimeWashing, @washingPattern, @washingLinePressure, @stopTimeWashing,
                @cleanlinessMethod, @remarks
            );
            SELECT SCOPE_IDENTITY() AS operationId;
        `;
        
        const results = await transaction.request()
            
            .input("tankIdentity", sql.NVarChar(100), tankIdentity)
            .input("portOfWash", sql.NVarChar(150), cowPort)
            .input("shipPosition", sql.NVarChar(150), cowShipPosition)
            .input("machinesInUse", sql.Int, machinesInUse)
            .input("startTimeWashing", sql.Time, formattedStartTime) // Fixed conversion
            .input("washingPattern", sql.NVarChar(150), washingPattern)
            .input("washingLinePressure", sql.NVarChar(100), washingLinePressure.toString())
            .input("stopTimeWashing", sql.Time, formattedEndTime) // Fixed conversion
            .input("cleanlinessMethod", sql.NVarChar(255), methodOfEstablishing)
            .input("remarks", sql.NVarChar(255), cowRemarks || null)
            .query(query);

    const operationId = results.recordset[0].operationId;
    const approvedby = 1;
    const approvalStatus = 0;
    const verificationStatus =0;
    const verifiedBy= 2;
    const verificationRemarks = `verified`;
    const result2 = await transaction.request()
      .input('approvedby', sql.Int, approvedby)
      .input('approvalStatus', sql.Int, approvalStatus)
      .input('createdBy', sql.Int,user )
      .input('vesselId', sql.Int, vessel)
      .input('verifiedAt',sql.DateTime,new Date())
      .input('verifiedBy', sql.Int, verifiedBy)
      .input('verificationStatus', sql.Int, verificationStatus)
      .input('verificationRemarks', sql.NVarChar(255), verificationRemarks)
      .input('CrudeOilWashing_id', sql.Int, operationId)
      .input('operationName',sql.NVarChar(250),recordName)
      .query(`
        INSERT INTO tbl_orb_2 (
          approvedby, approvalStatus, createdBy, vesselId, 
          verifiedBy,verifiedAt,  verificationStatus, verificationRemarks,
          CrudeOilWashing_id,operationName
        )
        VALUES (
          @approvedby, @approvalStatus, @createdBy, @vesselId, 
          @verifiedBy,@verifiedAt,  @verificationStatus, @verificationRemarks,
          @CrudeOilWashing_id, @operationName
        )
      `);
            
    }
}

async function insertLoadingOilCargo(recordName, data,user,vessel) {
    if (!recordName) {
        throw new Error("Invalid operation type provided.");
    }

    function validateDecimal(value, precision = 10, scale = 2) {
        if (typeof value !== "number" || isNaN(value)) return 0.0;
        return parseFloat(value.toFixed(scale));
    }

    const quantityAddedM3 = validateDecimal(data.quantityAdded);
    const totalContentOfTanksM3 = validateDecimal(data.totalContentOfTanks);
    const approvedby = 1;
    const approvalStatus = 0;
    const verificationStatus =0;
    const verifiedBy= 2;
    const verificationRemarks = `verified`;
    let transaction;
    try {
        
        transaction = new sql.Transaction(await pool); 
        await transaction.begin();
        console.log("Transaction started...");

        const query = `
            INSERT INTO LoadingOfOilCargo ( placeOfLoading, typeOfOilLoaded, quantityAddedM3, totalContentOfTanksM3) 
            VALUES ( @placeOfLoading, @typeOfOilLoaded, @quantityAddedM3, @totalContentOfTanksM3);
            SELECT SCOPE_IDENTITY() AS operationId;
        `;

        const result = await transaction.request()
            .input("placeOfLoading", sql.NVarChar(150), data.placeOfLoading)
            .input("typeOfOilLoaded", sql.NVarChar(100), data.typeOfOilLoaded)
            .input("quantityAddedM3", sql.Decimal(20, 2), quantityAddedM3)
            .input("totalContentOfTanksM3", sql.Decimal(20, 2),  totalContentOfTanksM3)
            .query(query);

        const operationId = result.recordset[0].operationId;
        const result2 = await transaction.request()
      .input('approvedby', sql.Int, approvedby)
      .input('approvalStatus', sql.Int, approvalStatus)
      .input('createdBy', sql.Int,user )
      .input('vesselId', sql.Int, vessel)
      .input('verifiedBy', sql.Int, verifiedBy)
      .input('verifiedAt', sql.DateTime, new Date())
      .input('verificationStatus', sql.Int, verificationStatus)
      .input('verificationRemarks', sql.NVarChar(255), verificationRemarks)
      .input('LoadingOfOilCargo_id', sql.Int, operationId)
      .input('operationName',sql.NVarChar(250),recordName)
      .query(`
        INSERT INTO tbl_orb_2 (
          approvedby, approvalStatus, createdBy, vesselId, 
          verifiedBy,  verificationStatus,verifiedAt, verificationRemarks,
          LoadingOfOilCargo_id,operationName
        )
        VALUES (
          @approvedby, @approvalStatus, @createdBy, @vesselId, 
          @verifiedBy,  @verificationStatus,@verifiedAt, @verificationRemarks,
          @LoadingOfOilCargo_id, @operationName
        )
      `);

        if (data.tanks && data.tanks.length > 0) {
            await insertLoadingOilCargoTanks(transaction, operationId, data.tanks);
        }

        await transaction.commit();
        console.log("Transaction committed successfully.");
        return { message: `Loading Of Oil Cargo submitted successfully` };

    } catch (error) {
        console.error("Error in insertLoadingOilCargo:", error);

        if (transaction) {
            await transaction.rollback();
            console.log("Transaction rolled back due to an error.");
        }

        throw new Error("Database operation failed: " + error.message);
    } finally {
        
            transaction.release(); 
         
    }
}

async function insertLoadingOilCargoTanks(transaction, operationId, tanks) {
    if (!operationId) {
        throw new Error("Invalid operationId provided.");
    }

    for (const tank of tanks) {
        const query = `
            INSERT INTO LoadingOfOilCargo_Tanks (operationId, tankIdentity, quantityLoadedM3) 
            VALUES (@operationId, @tankIdentity, @quantityLoadedM3)
        `;

        await transaction.request()
            .input("operationId", sql.Int, operationId)
            .input("tankIdentity", sql.NVarChar(100), tank.tankIdentity)
            .input("quantityLoadedM3", sql.Decimal(20, 2), tank.quantityLoadedM3)
            .query(query);
    }
}

async function insertInternalTransfer(recordName, data,user,vessel) {
    let transaction;

    try {
        if (!recordName) {
            throw new Error("Invalid operation type provided.");
        }
        function validateDecimal(value, precision = 10, scale = 2) {
            if (typeof value !== "number" || isNaN(value)) return 0.0;
            return parseFloat(value.toFixed(scale));
        }

        
        const totalQuantityOfTanksM3 = validateDecimal(data.totalQuantityTanks);
        const quantityRetainedM3 = validateDecimal(data.quantityRetained);
        const quantityTransferred = validateDecimal(data.quantityTransferred);
        const approvedby = 1;
        const approvalStatus = 0;
        const verificationStatus =0;
        const verifiedBy= 2;
        const verificationRemarks = `verified`;
        // Start transaction
         
        transaction = new sql.Transaction(await pool); 
        await transaction.begin();
        console.log("Transaction started...");

        const query = `
            INSERT INTO InternalTransferOfOilCargo 
            (   quantityTransferred, totalQuantityOfTanksM3, tankEmptied, quantityRetainedM3) 
            VALUES 
            (   @quantityTransferred, @totalQuantityOfTanksM3, @tankEmptied, @quantityRetainedM3);
            SELECT SCOPE_IDENTITY() AS operationId;
        `;

        const result = await transaction.request()
            .input("quantityTransferred", sql.Decimal(20, 2), quantityTransferred)
            .input("totalQuantityOfTanksM3", sql.Decimal(20, 2), totalQuantityOfTanksM3)
            .input("tankEmptied", sql.NVarChar(10), data.tankEmptied || "No")
            .input("quantityRetainedM3", sql.Decimal(10, 2), quantityRetainedM3 || 0.0)
            .query(query);

        const operationId = result.recordset[0].operationId;

        const result2 = await transaction.request()
      .input('approvedby', sql.Int, approvedby)
      .input('approvalStatus', sql.Int, approvalStatus)
      .input('createdBy', sql.Int,user )
      .input('vesselId', sql.Int, vessel)
      .input('verifiedBy', sql.Int, verifiedBy)
      .input('verifiedAt', sql.DateTime, new Date())
      .input('verificationStatus', sql.Int, verificationStatus)
      .input('verificationRemarks', sql.NVarChar(255), verificationRemarks)
      .input('InternalTransferOfOilCargo_id', sql.Int, operationId)
      .input('operationName',sql.NVarChar(250),recordName)
      .query(`
        INSERT INTO tbl_orb_2 (
          approvedby, approvalStatus, createdBy, vesselId, 
          verifiedBy,verifiedAt,  verificationStatus, verificationRemarks,
          InternalTransferOfOilCargo_id,operationName
        )
        VALUES (
          @approvedby, @approvalStatus, @createdBy, @vesselId, 
          @verifiedBy,@verifiedAt,  @verificationStatus, @verificationRemarks,
          @InternalTransferOfOilCargo_id, @operationName
        )
      `);

        // Insert related tank entries
        if (data.tanks && data.tanks.length > 0) {
            await insertInternalTransferTanks(transaction, operationId, data.tanks);
        }

        // Commit transaction
        await transaction.commit();
        console.log("Transaction committed successfully.");

        return { message: `Internal Transfer submitted successfully` };

    } catch (error) {
        console.error("Error in insertInternalTransfer:", error.message);

        if (transaction) {
            await transaction.rollback();
            console.log("Transaction rolled back due to an error.");
        }

        throw new Error("Database operation failed: " + error.message);
    } finally {
       
            transaction.release(); 
         
    }
}

async function insertInternalTransferTanks(transaction, operationId, tanks) {
    for (const tank of tanks) {
        try {
            const query = `
                INSERT INTO InternalTransfer_Tanks (operationId, tankIdentity,tankRole,tankQuantity) 
                VALUES (@operationId, @tankIdentity,@tankRole,@tankQuantity);
            `;

            await transaction.request()
                .input("operationId", sql.Int, operationId)
                .input("tankIdentity", sql.NVarChar(100), tank.tankIdentity)
                .input("tankRole", sql.NVarChar(5), tank.tankRole)
                .input("tankQuantity", sql.Decimal(10,3), tank.tankQuantity)
                .query(query);

        } catch (error) {
            console.error(`Error inserting tank ${tank}:`, error.message);
            throw new Error(`Error inserting tank ${tank}: ${error.message}`);
        }
    }
}

async function insertUnloadingCargo(recordName, data,user,vessel) {
    let transaction;

    try {
        // Start a transaction
        if(!recordName)
        {
            throw new Error("Invalid Operation type provided");
            
        }
        transaction = new sql.Transaction(await pool); 
        await transaction.begin();
        console.log("Transaction started...");

        // Insert into UnloadingOfOilCargo table
        const query1 = `
            INSERT INTO UnloadingOfOilCargo ( placeOfUnloading, tankEmptied, quantityRetainedM3) 
            VALUES ( @placeOfUnloading, @tankEmptied, @quantityRetainedM3);
            SELECT SCOPE_IDENTITY() AS newOperationId;
        `;

        // Validate decimal values
        function validateDecimal(value, precision = 10, scale = 2) {
            if (typeof value !== "number" || isNaN(value)) return 0.0;
            return parseFloat(value.toFixed(scale));
        }
        const quantityRetainedUnloadM3 = validateDecimal(data.quantityRetainedUnload);
        const approvedby = 1;
        const approvalStatus = 0;
        const verificationStatus =0;
        const verifiedBy= 2;
        const verificationRemarks = `verified`;
        const result1 = await transaction.request()
            
            .input("placeOfUnloading", sql.NVarChar(150), data.placeOfUnloading)
            .input("tankEmptied", sql.NVarChar(10), data.tankEmptiedUnload)
            .input("quantityRetainedM3", sql.Decimal(10, 2), quantityRetainedUnloadM3)
            .query(query1);

        const newOperationId = result1.recordset[0].newOperationId; // Get the inserted operationId
        const result2 = await transaction.request()
      .input('approvedby', sql.Int, approvedby)
      .input('approvalStatus', sql.Int, approvalStatus)
      .input('createdBy', sql.Int,user )
      .input('vesselId', sql.Int, vessel)
      .input('verifiedBy', sql.Int, verifiedBy)
      .input('verifiedAt', sql.DateTime, new Date())
      .input('verificationStatus', sql.Int, verificationStatus)
      .input('verificationRemarks', sql.NVarChar(255), verificationRemarks)
      .input('UnloadingOfOilCargo_id', sql.Int, newOperationId)
      .input('operationName',sql.NVarChar(250),recordName)
      .query(`
        INSERT INTO tbl_orb_2 (
          approvedby, approvalStatus, createdBy, vesselId, 
          verifiedBy,verifiedAt,  verificationStatus, verificationRemarks,
          UnloadingOfOilCargo_id,operationName
        )
        VALUES (
          @approvedby, @approvalStatus, @createdBy, @vesselId, 
          @verifiedBy,@verifiedAt,  @verificationStatus, @verificationRemarks,
          @UnloadingOfOilCargo_id, @operationName
        )
      `);
        
        if (data.tanks && data.tanks.length > 0) {
            const query2 = `
                INSERT INTO UnloadingOfOilCargo_Tanks (operationId, tankIdentity,quantity) 
                VALUES (@operationId, @tankIdentity,@quantity);
            `;

            for (const tank of data.tanks) {
                await transaction.request()
                    .input("operationId", sql.Int, newOperationId)
                    .input("tankIdentity", sql.NVarChar(100), tank.identity)
                    .input("quantity",sql.Decimal(10,3),tank.quantity)
                    .query(query2);
            }
            console.log("Inserted into UnloadingOfOilCargo_Tanks successfully.");
        }

      
        await transaction.commit();
        console.log("Transaction committed successfully.");

        return { message: `Unloading of oil Cargo created successfully` };

    } catch (error) {
        console.error("Error inserting Unloading Cargo:", error);

        
        if (transaction) {
            await transaction.rollback();
            console.log("Transaction rolled back due to an error.");
        }

        throw new Error("Database operation failed");
    } finally {
        
            transaction.release();
        
    }
}

export  { processOperation, fetchOperation }
