var db = require('./../helpers/db_helpers')
var helper =  require('./../helpers/helpers')
var multiparty = require('multiparty')
var fs = require('fs');
var imageSavePath = "./public/img/"



module.exports.controller = (app, io, socket_list ) => {

    const msg_success = "successfully";
    const msg_fail = "fail";
    const msg_invalidUser = "invalid username and password";
    const msg_already_register = "This email has been already registered";
    const msg_add_favorite = "Added to favourites";
    const msg_remove_favorite = "Removed from favourites";



    //Login Endpoint
    app.post('/api/app/login', (req, res) => {
        helper.Dlog(req.body);
        var reqObj =  req.body;

        helper.CheckParameterValid(res, reqObj, ["email", "password", "device_token"], () => {

            var auth_token = helper.createRequestToken();
            db.query("UPDATE `user_detail` SET `auth_token`= ?,`device_token`=?,`modify_date`= NOW() WHERE `email` = ? AND  `password` = ? AND `status` = ?", [auth_token, reqObj.device_token,reqObj.email, reqObj.password, "1"], (err,result) => {

                if(err) {
                    helper.ThrowHtmlError(err, res);
                    return
                }

                if(result.affectedRows > 0) {

                    db.query('SELECT `user_id`, `username`, `name`, `email`, `mobile`, `mobile_code`, `password`, `auth_token`, `status`, `created_date` FROM `user_detail` WHERE `email` = ? AND  `password` = ? AND `status` = "1" ', [ reqObj.email, reqObj.password ] , (err, result) => {

                        if(err) {
                            helper.ThrowHtmlError(err, res);
                            return
                        }

                        if(result.length > 0) {
                            res.json({ "status": "1", "payload": result[0] , "message": msg_success })
                        }else{
                            res.json({ "status": "0", "message": msg_invalidUser })
                        }
                    })
                 } else {
                res.json({ "status": "0", "message": msg_invalidUser })
                }
            })
        } )
    } )

    //Sign Up Endpint
    app.post('/api/app/sign_up', (req, res) => {
        helper.Dlog(req.body);
        var reqObj =  req.body;

        helper.CheckParameterValid(res, reqObj, ["username", "email", "password", "device_token"], () => {

            db.query('SELECT `user_id`,`status` FROM `user_detail` WHERE `email` = ? ', [ reqObj.email ] , (err, result) => {

                if(err) {
                    helper.ThrowHtmlError(err, res);
                    return
                }

                if(result.length > 0) {
                    res.json({ "status": "1", "payload": result[0] , "message": msg_already_register })
                }else{
                    var auth_token = helper.createRequestToken();
                    db.query("INSERT INTO `user_detail`(`username`, `email`,`password`, `auth_token`, `device_token`,  `created_date`, `modify_date`) VALUES(?,?,?,?,?, NOW(), NOW())", [reqObj.username, reqObj.email, reqObj.password, auth_token,reqObj.device_token, ], (err, result) => {
                        if(err) {
                            helper.ThrowHtmlError(err, res);
                            return
                        }

                        if(result){
                            db.query('SELECT `user_id`, `username`, `name`, `email`, `mobile`, `mobile_code`, `password`, `auth_token`, `status`, `created_date` FROM `user_detail` WHERE `user_id` = ? AND `status` = "1" ', [ result.insertId] , (err, result) => {

                                if(err) {
                                    helper.ThrowHtmlError(err, res);
                                    return
                                }
        
                                if(result.length > 0) {
                                    res.json({ "status": "1", "payload": result[0] , "message": msg_success })
                                }else{
                                    res.json({ "status": "0", "message": msg_invalidUser })
                                }
                            })
                        } else{
                            res.json({ "status": "0", "message": msg_fail })
                        }
                    })
                   
                }
            })
        }) 
    })

    //Locations Endpoint
    app.post('/api/app/get_zone_area', (req, res) => {
        helper.Dlog(req.body);
        var reqObj = req.body;

        db.query("SELECT `zone_id`, `name` FROM `zone_details` WHERE `status`= ? ;" +
        "SELECT `ad`.`area_id`, `ad`.`zone_id`,`ad`.`name`,`zd`.`name` AS `zone_name` FROM `area_detail` AS `ad` "+
        "INNER JOIN `zone_details` AS `zd` ON `zd`.`zone_id`=`ad`.`zone_id` AND `zd`.`status` = '1' "+
        "WHERE `ad`.`status`= ? ", ["1","1"], (err, result) => {
            if(err){
                helper.ThrowHtmlError(err,res);
                return;
            }

        result[0].forEach(zObj => {
            zObj.area_list = result[1].filter((aObj) => {
                return aObj.zone_id == zObj.zone_id
            });
        });
        res.json({ "status": "1", "payload": result[0] , "message": msg_success })

        })
    })

    //Offers display endpoint
    app.post('/api/app/home', (req, res) => {
        helper.Dlog(req.body);
        var reqObj = req.body;
        checkAccessToken(req.headers, res, () => { 
            db.query("SELECT `od`.`price` AS `offer_price`, `od`.`start_date`, `od`.`end_date`,`pd`.`prod_id`, `pd`.`cat_id`, `pd`.`brand_id`, `pd`.`type_id`, `pd`.`name`, `pd`.`detail`, `pd`.`unit_name`, `pd`.`unit_value`, `pd`.`quantity`, `pd`.`price`, (CASE WHEN `imd`.`image` != '' THEN CONCAT( '" + image_base_url + "','',`imd`.`image`) ELSE '' END) AS `image`, `cd`.`cat_name`, `td`.`type_name`, ( CASE WHEN `fd`.`fav_id` IS NOT NULL THEN 1 ELSE 0 END) AS `is_fav` FROM `offer_detail` AS `od` "+
            "INNER JOIN `product_detail` AS `pd` ON `pd`.`prod_id` = `od`.`prod_id` AND `pd`.`status` = ? "+
            "INNER JOIN `image_detail` AS `imd` ON `pd`.`prod_id` = `imd`.`prod_id` AND `imd`.`status` = 1 "+
            "INNER JOIN `category_details` AS `cd` ON `cd`.`cat_id` = `pd`.`cat_id` AND `cd`.`status` = 1 "+
            "LEFT JOIN `favourite_detail` AS `fd` ON `pd`.`prod_id` = `fd`.`prod_id` AND `fd`.`status`=1 "+
            "INNER JOIN `type_detail` AS `td` ON `pd`.`type_id` = `td`.`type_id` AND `td`.`status` = 1 "+
            "WHERE `od`.`status` = ? AND  `od`.`start_date` <= NOW() AND `od`.`end_date` >= NOW() GROUP BY `pd`.`prod_id` ;"+
            
            "SELECT `pd`.`prod_id`, `pd`.`cat_id`, `pd`.`brand_id`, `pd`.`type_id`, `pd`.`name`, `pd`.`detail`, `pd`.`unit_name`, `pd`.`unit_value`, `pd`.`quantity`, `pd`.`price`, (CASE WHEN `imd`.`image` != '' THEN CONCAT( '" + image_base_url + "','',`imd`.`image`) ELSE '' END) AS `image`, `cd`.`cat_name`, `td`.`type_name`,( CASE WHEN `fd`.`fav_id` IS NOT NULL THEN 1 ELSE 0 END) AS `is_fav` FROM `product_detail` AS `pd` "+
            "LEFT JOIN `favourite_detail` AS `fd` ON `pd`.`prod_id` = `fd`.`prod_id` AND `fd`.`status`=1 "+
            "INNER JOIN `image_detail` AS `imd` ON `pd`.`prod_id` = `imd`.`prod_id` AND `imd`.`status` = 1 "+
            "INNER JOIN `category_details` AS `cd` ON `cd`.`cat_id` = `pd`.`cat_id` AND `cd`.`status` = 1 "+
            "INNER JOIN `type_detail` AS `td` ON `pd`.`type_id` = `td`.`type_id` AND `td`.`status` = 1 "+
            "WHERE `pd`.`status` = ? AND `pd`.`cat_id` = ? GROUP BY `pd`.`prod_id` ;"+


            "SELECT `type_id`, `type_name`, (CASE WHEN `imd`.`image` != '' THEN CONCAT( '" + image_base_url + "','',`imd`.`image`) ELSE '' END) AS `image`, `color` FROM `type_detail` WHERE `status` =? ;"+
            
            "SELECT `pd`.`prod_id`, `pd`.`cat_id`, `pd`.`brand_id`, `pd`.`type_id`, `pd`.`name`, `pd`.`detail`, `pd`.`unit_name`, `pd`.`unit_value`, `pd`.`quantity`, `pd`.`price`, (CASE WHEN `imd`.`image` != '' THEN CONCAT( '" + image_base_url + "','',`imd`.`image`) ELSE '' END) AS `image`, `cd`.`cat_name`, `td`.`type_name`, ( CASE WHEN `fd`.`fav_id` IS NOT NULL THEN 1 ELSE 0 END) AS `is_fav` FROM `product_detail` AS `pd` "+
            "LEFT JOIN `favourite_detail` AS `fd` ON `pd`.`prod_id` = `fd`.`prod_id` AND `fd`.`status`=1 "+
            "INNER JOIN `image_detail` AS `imd` ON `pd`.`prod_id` = `imd`.`prod_id` AND `imd`.`status` = 1 "+
            "INNER JOIN `category_details` AS `cd` ON `cd`.`cat_id` = `pd`.`cat_id` AND `cd`.`status` = 1 "+
            "INNER JOIN `type_detail` AS `td` ON `pd`.`type_id` = `td`.`type_id` AND `td`.`status` = 1 "+
            "WHERE `pd`.`status` = ? GROUP BY `pd`.`prod_id` ORDER BY `pd`.`prod_id` DESC LIMIT 4;"
            , [
                "1", "1",
                "1", "1",
                "1",
                "1"
            ], (err, result) => {
                if(err){
                    helper.ThrowHtmlError(err, res);
                    return;
                }
                res.json({
                    "status": "1",
                    "payload": {
                        "offer_list": result[0],
                        "best_sell_list":result[1],
                        "type_list":result[2],
                        "list": result[3]
                    },
                    "message": msg_success
                });
            });
        }, "1");
    })


    //Products display endpoint
    app.post('/api/app/product_detail', (req,res)=>{
        helper.Dlog(req.body);
        var reqObj =  req.body;

        checkAccessToken(req.headers, res, (uObj) =>{

            helper.CheckParameterValid(res, reqObj, ["prod_id"], () =>{

                getProductDetail(res, reqObj.prod_id);
                    
            })
        }, "1")
    })

    //Add and remove favourites
    app.post('/api/app/add_remove_favorite', (req, res) => {
        helper.Dlog(req.body)
        var reqObj = req.body;

        checkAccessToken(req.headers, res, (userObj) => {
            helper.CheckParameterValid(res, reqObj, ["prod_id"], () =>{
                db.query("SELECT `fav_id`, `prod_id` FROM `favourite_detail` WHERE `prod_id` = ? AND `user_id` = ? AND `status` = '1' ",[reqObj.prod_id,userObj.user_id],(err,result) => {
                    if(err){
                        helper.ThrowHtmlError(err, res);
                        return
                    }

                    if(result.length > 0){
                        //already in fav items and to del
                        db.query("DELETE FROM `favourite_detail` WHERE `prod_id` = ?, `user_id` = ? ",[reqObj.prod_id,userObj.user_id], (err, result) => {
                            if(err){
                                helper.ThrowHtmlError(err, res);
                                return
                            } else{
                                res.json({
                                    "status": "1",
                                    "message": msg_remove_favorite
                                })
                            }
                        })
                        
                    }else{
                        //Not added fav items needs to
                        db.query("INSERT INTO `favourite_detail`(`prod_id`, `user_id`) VALUES (?,?) ",[
                            reqObj.prod_id, userObj.user_id
                        ], (err, result) => {
                            if(err){
                                helper.ThrowHtmlError(err, res);
                                return
                            }

                            if(result){
                                res.json({
                                    "status": "1",
                                    "message": msg_add_favorite
                                })
                            }else{
                                res.json({
                                    "status": "0",
                                    "message": msg_fail
                                })
                            }
                        })
                    }
                })
            })
        },'1')
    })

    //Favourites list Endpoint
    app.post('/api/app/favorite_list', (req, res) => {
        helper.Dlog(req.body)
        var reqObj = req.body;

        checkAccessToken(req.headers, res, (userObj) => {
            db.query("SELECT `fd`.`fav_id`,`pd`.`prod_id`, `pd`.`cat_id`, `pd`.`brand_id`, `pd`.`type_id`, `pd`.`name`, `pd`.`detail`, `pd`.`unit_name`, `pd`.`unit_value`, `pd`.`quantity`, `pd`.`price`, `pd`.`created_date`, `pd`.`modify_date`, `cd`.`cat_name`, IFNULL( `bd`.`brand_name`, '') AS `brand_name`, `td`.`type_name`, IFNULL(`od`.`price`,`pd`.`price`) AS `offer_price`, IFNULL(`od`.`start_date`,'') as `start_date`, IFNULL(`od`.`end_date`,'') as `end_date`, (CASE WHEN `od`.`offer_id` IS NOT NULL THEN 1 ELSE 0 END) AS `is_offer_active`, 1 AS `is_fav` FROM `favourite_detail` AS `fd` "+
            "INNER JOIN `product_detail` AS `pd` ON `pd`.`prod_id` = `fd`.`prod_id` AND `rd`.`status` = 1"+
            "INNER JOIN `category_details` AS `cd` ON `pd`.`cat_id`=`cd`.`cat_id` "+
                    "LEFT JOIN `brand_detail` AS `bd` ON `pd`.`brand_id`=`bd`.`brand_id` "+
                    "LEFT JOIN `offer_detail` AS `od` ON `pd`.`prod_id`=`od`.`prod_id` AND `od`.`status` = 1 AND `od`.`start_date` <= NOW() AND `od`.`end_date` >= NOW() "+
                    "INNER JOIN `type_detail` AS `td` ON `pd`.`type_id`=`td`.`type_id` "+
            "WHERE `fd`.`user_id` = ? AND `fd`.`status` = '1' ",[userObj.user_id],(err,result) => {
                if(err){
                    helper.ThrowHtmlError(err, res);
                    return
                }

                res.json({
                    "status": "1",
                    "payload": result,
                    "message":msg_success
                })
            })
        },'1')
    })

    //Explore list Endpoint
    app.post('/api/app/explore_category_list', (req, res) => {
        helper.Dlog(req.body)
        var reqObj = req.body;

        checkAccessToken(req.headers, res, (userObj) => {
            db.query("SELECT `cat_id`, `cat_name`, `image`, `color` FROM `category_details` WHERE `status` =1", [],(err,result) => {
                if(err){
                    helper.ThrowHtmlError(err, res);
                    return
                }

                res.json({
                    "status": "1",
                    "payload": result,
                })
            })
        },'1')
    })

    //Favourites list Endpoint
    app.post('/api/app/explore_category_items_list', (req, res) => {
        helper.Dlog(req.body)
        var reqObj = req.body;

        checkAccessToken(req.headers, res, (userObj) => {
            helper.CheckParameterValid(res,reqObj, ["cat_id"], () => {

            
            db.query("SELECT `pd`.`prod_id`, `pd`.`cat_id`, `pd`.`brand_id`, `pd`.`type_id`, `pd`.`name`, `pd`.`detail`, `pd`.`unit_name`, `pd`.`unit_value`, `pd`.`quantity`, `pd`.`price`, `pd`.`created_date`, `pd`.`modify_date`, `cd`.`cat_name`, IFNULL( `bd`.`brand_name`, '') AS `brand_name`, `td`.`type_name`, IFNULL(`od`.`price`,`pd`.`price`) AS `offer_price`, IFNULL(`od`.`start_date`,'') as `start_date`, IFNULL(`od`.`end_date`,'') as `end_date`, (CASE WHEN `od`.`offer_id` IS NOT NULL THEN 1 ELSE 0 END) AS `is_offer_active`, ( CASE WHEN `fd`.`fav_id` IS NOT NULL THEN 1 ELSE 0 END) AS `is_fav` FROM `product_detail` AS `pd` "+
                "LEFT JOIN `favourite_detail` AS `fd` ON `pd`.`prod_id` = `fd`.`prod_id` AND `fd`.`status` = 1 "+
                "INNER JOIN `category_details` AS `cd` ON `pd`.`cat_id`=`cd`.`cat_id` AND `pd`.`status`= 1 "+
                "LEFT JOIN `brand_detail` AS `bd` ON `pd`.`brand_id`=`bd`.`brand_id` "+
                "LEFT JOIN `offer_detail` AS `od` ON `pd`.`prod_id`=`od`.`prod_id` AND `od`.`status` = 1 AND `od`.`start_date` <= NOW() AND `od`.`end_date` >= NOW() "+
                "INNER JOIN `type_detail` AS `td` ON `pd`.`type_id`=`td`.`type_id` "+
                "WHERE `cd`.`cat_id` = ? AND `cd`.`status` = '1' ",[reqObj.cat_id],(err,result) => {
                if(err){
                    helper.ThrowHtmlError(err, res);
                    return
                }

                res.json({
                    "status": "1",
                    "payload": result,
                    "message": msg_success
                })
            })
            })
        },'1')
    })


    //Function for product Details
    function getProductDetail(res ,prod_id){
        db.query("SELECT `pd`.`prod_id`, `pd`.`cat_id`, `pd`.`brand_id`, `pd`.`type_id`, `pd`.`name`, `pd`.`detail`, `pd`.`unit_name`, `pd`.`unit_value`, `pd`.`quantity`, `pd`.`price`, `pd`.`created_date`, `pd`.`modify_date`, `cd`.`cat_name`, ( CASE WHEN `fd`.`fav_id` IS NOT NULL THEN 1 ELSE 0 END) AS `is_fav`, IFNULL( `bd`.`brand_name`, '') AS `brand_name`, `td`.`type_name`, IFNULL(`od`.`price`,`pd`.`price`) AS `offer_price`, IFNULL(`od`.`start_date`,'') as `start_date`, IFNULL(`od`.`end_date`,'') as `end_date`, (CASE WHEN `od`.`offer_id` IS NOT NULL THEN 1 ELSE 0 END) AS `is_offer_active` FROM `product_detail` AS `pd` "+
                    "INNER JOIN `category_details` AS `cd` ON `pd`.`cat_id`=`cd`.`cat_id` "+
                    "LEFT JOIN `favourite_detail` AS `fd` ON `pd`.`prod_id` = `fd`.`prod_id` AND `fd`.`status`=1 "+
                    "LEFT JOIN `brand_detail` AS `bd` ON `pd`.`brand_id`=`bd`.`brand_id` "+
                    "LEFT JOIN `offer_detail` AS `od` ON `pd`.`prod_id`=`od`.`prod_id` AND `od`.`status` = 1 AND `od`.`start_date` <= NOW() AND `od`.`end_date` >= NOW() "+
                    "INNER JOIN `type_detail` AS `td` ON `pd`.`type_id`=`td`.`type_id` "+
                    "WHERE `pd`.`status`=? AND `pd`.`prod_id`= ? ; "+
                    
                    "SELECT `quantity_id`, `prod_id`, `prod_name`, `quantity` FROM `quantity_detail` WHERE `prod_id`=? AND `status`= ? ORDER BY `prod_name` ;" +
                    
                    "SELECT `img_id`, `prod_id`, `image` FROM `image_detail` WHERE `prod_id`=? AND `status`= ?", [

                    "1", prod_id, prod_id,"1", prod_id,"1",

                    ], (err, result) => {

                        if(err){
                            helper.ThrowHtmlError(err, res);
                            return;
                        }

                        // result= result.replace_null()
                        // helper.Dlog(result);

                        if(result[0].length > 0){

                            result[0][0].quantity_list = result[1];
                            result[0][0].images = result[2];

                            res.json({
                                "status": "1", "payload": result[0][0]
                            });

                        }else{
                            res.json({"status":"0", "message": "invalid item"})
                        }

                        
                })
    }

    
}

function checkAccessToken(headerObj, res, callback, require_type=""){
    helper.Dlog(headerObj.access_token);
    helper.CheckParameterValid(res, headerObj, ["access_token"] , () => {
        db.query("SELECT `user_id`, `username`, `user_type`, `name`, `email`, `mobile`, `mobile_code`, `auth_token`, `device_token`, `status` FROM `user_detail` WHERE `auth_token` =? AND `status` = ?", [headerObj.access_token,"1"], (err, result) => {
            if(err){
                helper.ThrowHtmlError(err,res);
                return
            }  
            
            helper.Dlog(result);

            if(result.length > 0){
                if(require_type != ""){
                    if(require_type == result[0].user_type){
                        return callback(result[0]);
                    } else{
                        res.json({ "status": "0", "code":"404", "message": "Access denied! Unauthorized user access." })
                    }

                } else{
                    return callback(result[0]);
                }
            }else{
                res.json({ "status": "0", "code":"404", "message": "Access denied! Unauthorized user access." })
            }
        })
    })



}


function saveImage(imageFile, savePath ) {
    fs.rename(imageFile.path, savePath, (err) => {

        if (err) {
            helper.ThrowHtmlError(err);
            return;
        }
    })
}