const pool = require("../db");


const getposts=(req,res)=>{
    pool.query("SELECT * FROM postdetails", (error,result)=>{
        if(error)
            throw error;

        res.status(200).json(result.rows);
    })
}; 

module.exports={
    getposts,
};