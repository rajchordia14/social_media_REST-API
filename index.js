const express  = require('express');
const jwt = require('jsonwebtoken');
require("dotenv").config();
const pool = require("./db");
const queries = require("./src/queries");
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:false}));
const PORT = process.env.PORT || 5000;

const {Pool, Client} = require("pg");

const e = require('express');
app.get('/api',(req,res)=>{
    res.json({
        message: 'welcome to the api'
    });
});
//POST api/athenticate
app.post('/api/authenticate',(req,res)=>{

    //Mock user
    const user = {
        id: 1,
        username :'raj',//dew
        email: 'rajchordia@gmail.com',
    }

    jwt.sign({user},'secretkey',(err,token)=>{
        res.json({token: token});
    });
});

//POST api/follow/:id

app.post('/api/follow/:id',verifyToken,async (req,res)=>{
    jwt.verify(req.token,'secretkey',(err,authData)=>{
        if(err)
            res.sendStatus(403);   
        else{

            const follow = parseInt(req.params.id);
            const user = parseInt(authData.user.id);
            if( user!==follow)
            {
                pool.query(`SELECT * FROM follow WHERE userid = ${user} AND followerid = ${follow}`,(err1,res1)=>{
                    if(err1)
                        throw err1;

                    else if(res1.rowCount>0)
                    {   
                        res.status(403).send('User already followed');
                    }
                    else
                    {
                        pool.query(`INSERT INTO follow (userid,followerid) VALUES (${user},${follow})`,(err2,res2)=>{
                            if(err2)
                                throw err2;
                            else
                            {

                                pool.query(`UPDATE userinfo SET followers = followers+1 WHERE id=${follow}`,(err3,res3)=>{
                                    if(err3)
                                        throw err3;
                                    else
                                    {
                                        pool.query(`UPDATE userinfo SET following = following+1 WHERE id=${user}`,(err4,res4)=>{
                                            if(err4)
                                                throw err4;
                                            else
                                            {
                                                res.status(200).send("Follwing");
                                            }
                                        })
                                    }
                                })
                            }
                        })
                        
                    }
                })
            }
            else{
                res.status(403).send('Can\'t follow yourself');
            }
        }
    })
});
//POST api/unfollow/:id
app.post('/api/unfollow/:id',verifyToken,async (req,res)=>{

    jwt.verify(req.token,'secretkey',(err,authData)=>{
        if(err)
            res.sendStatus(403);   
        else{
            const follow = parseInt(req.params.id);
            const user = parseInt(authData.user.id);
            if( user!==follow)
            {
                pool.query(`SELECT * FROM follow WHERE userid = ${user} AND followerid = ${follow}`,(err1,res1)=>{
                    if(err1)
                        throw err1;
                    else if(res1.rowCount==0)
                    {   
                        res.status(403).send('User dont follow given user');
                    }
                    else
                    {
                        pool.query(`DELETE FROM follow WHERE userid = ${user} AND followerid = ${follow}`,(err2,res2)=>{
                            if(err2)
                                throw err2;
                            else
                            {
                                pool.query(`UPDATE userinfo SET followers = followers-1 WHERE id=${follow}`,(err3,res3)=>{
                                    if(err3)
                                        throw err3;
                                    else
                                    {
                                        pool.query(`UPDATE userinfo SET following = following-1 WHERE id=${user}`,(err4,res4)=>{
                                            if(err4)
                                                throw err4;
                                            else
                                            {
                                                res.status(200).send("unFollwing user");
                                            }
                                        })
                                    }
                                })
                            }

                        })            
                    }
                })
            }
            else{
                res.status(403).send('Can\'t unfollow yourself');
            }
        }
    })
});
//GET api/user
app.get('/api/user',verifyToken,async (req,res)=>{
    jwt.verify(req.token,'secretkey',(err,authData)=>{
        if(err)
            res.sendStatus(403);
        else
        {
            const user = parseInt(authData.user.id);
            pool.query(`SELECT * FROM userinfo WHERE id = ${user}`,(err1,res1)=>{
                if(err1)
                    throw err1;
                else if(res1.rowCount==0)
                {
                    res.status(403).send('User not found');
                }
                else
                {
                    res.json(res1.rows);
                }
            })
        }
    })
});
//POST api/posts
app.post('/api/posts/',verifyToken,async (req,res)=>{
    jwt.verify(req.token,'secretkey',(err,authData)=>{
        if(err)
            throw err;
        else
        {
            const user = parseInt(authData.user.id);
            const title = req.body.title;
            const desc = req.body.desc;
            if(title.length==0 || desc.length==0)
            {
                res.status(403).send('No title or description provided');
            }
            else
            {
                pool.query(`INSERT INTO postdetails (userid,description,title,likes,dislikes) VALUES (${user},'${desc}','${title}',0,0)`,(err1,res1)=>{
                    if(err1)
                        throw err1;
                    else
                    {
                        res.status(200).json(res1.rows);      
                    }
                })
            }
        }
    })
})
//DELETE api/posts/:id
app.post('/api/posts/:id',verifyToken,async (req,res)=>{
    jwt.verify(req.token,'secretkey',(err,authData)=>{
        if(err)
            throw err;
        else
        {
            const id = parseInt(req.params.id);
            const userid = parseInt(authData.user.id);
            pool.query(`DELETE FROM postdetails WHERE userid=${userid} AND postid=${id}`,(err1,res1)=>{
                if(err1)
                    throw err1;
                else if(res1.rowCount==0)
                {
                    res.status(403).send('No post found for particular id');
                }
                else
                {
                    res.status(200).send('Success');
                }
            })
        }
    })
})
//POST api/like/:id
app.post('/api/like/:id',verifyToken,async (req,res)=>{
    jwt.verify(req.token,'secretkey',(err,authData)=>{
        if(err)
            throw err;
        else
        {
            const id = parseInt(req.params.id);
            const userid = parseInt(authData.user.id);
            pool.query(`UPDATE postdetails SET likes=likes+1 WHERE postid = ${id}`,(err1,res1)=>{
                if(err1)
                    throw err1;
                else if(res1.rowCount==0)
                {
                    res.status(403).send('No post exits with given id');
                }
                else
                {
                    res.status(200).send('success');
                }

            })


        }
    })
})
//POST api/unlike/:id
app.post('/api/unlike/:id',verifyToken,async (req,res)=>{
    jwt.verify(req.token,'secretkey',(err,authData)=>{
        if(err)
            throw err;
        else
        {
            const id = parseInt(req.params.id);
            const userid = parseInt(authData.user.id);
            pool.query(`UPDATE postdetails SET dislikes=dislikes+1 WHERE postid = ${id}`,(err1,res1)=>{
                if(err1)
                    throw err1;
                else if(res1.rowCount==0)
                {
                    res.status(403).send('No post exits with given id');
                }
                else
                {
                    res.status(200).send('success');
                }

            })


        }
    });

});
//POST api/comment/:id
app.post('/api/comment/:id',verifyToken,async (req,res)=>{
    jwt.verify(req.token,'secretkey',(err,authData)=>{
        if(err)
            throw err;
        else
        {
            const id = parseInt(req.params.id);
            const userid = parseInt(authData.user.id);

            const comment = req.body.comment
            pool.query(`INSERT INTO comments(postid,userid,comment) VALUES (${id},${userid},'${comment}')`,(err1,res1)=>{
                if(err1)
                    throw err1;
                else
                {
                    pool.query(`UPDATE postdetails SET comments = ARRAY_APPEND(comments,'${comment}') WHERE postid = ${id} AND userid = ${userid}`,(err2,res2)=>{
                        if(err2)
                            throw err2;
                        else{
                            res.status(200).send('success');
                        }
                    })
                }
            })

        }
    });

});
//GET api/post/:id
app.get('/api/posts/:id',verifyToken,async (req,res)=>{
    jwt.verify(req.token,'secretkey',(err,authData)=>{
        if(err)
            throw err;
        else
        {
            const id = parseInt(req.params.id);
            const userid = parseInt(authData.user.id);
            pool.query(`SELECT postid,likes,comments FROM postdetails WHERE postid=${id}`,(err1,res1)=>{
                if(err1)
                    throw err1;
                else if(res1.rowCount!==0)
                {
                    res.status(200).json(res1.rows);
                }
                else
                {
                    res.status(403).send('post not found');
                }
            })
        }
    });

});

//GET api/all_posts
app.get('/api/all_posts',verifyToken,async (req,res)=>{
    jwt.verify(req.token,'secretkey',(err,authData)=>{
        if(err)
            throw err;
        else
        {
            const userid = parseInt(authData.user.id); 
            pool.query(`SELECT userid,postid,description,createdtime,likes,title,comments FROM postdetails WHERE userid = ${userid} ORDER BY createdtime DESC`,(err1,res1)=>{
                if(err1)
                    throw err1;
                else
                {
                    res.status(200).json(res1.rows);

                }
            })

        }
    });

});
//Verify Token
function verifyToken(req,res,next)
{
    const bearerHeader = req.headers['authorization'];
    //Check if bearer is undefined
    if(typeof(bearerHeader) !=='undefined'){
        const bearer = bearerHeader.split(' ');
        // Get token from array
        const bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    }
    else{
        res.sendStatus(403);

    }
}

app.listen(PORT,() => console.log(`Server started on port ${PORT}`));
